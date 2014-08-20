from flask.blueprints import Blueprint
from flask.templating import render_template
from flask import redirect, url_for, make_response, request, flash, Response, g

from models import db
from models.abilities import list_abilities
from models.campaign import get_main_campaign
from models.characters import Character, get_character
from models.classes import get_class
from models.races import list_races, get_race
from models.skills import list_skills
import updates
from util import json_service, require_scripts, require_styles


character_app = Blueprint('characters', __name__)

update_handlers = {}
""":type: dict[str, func]"""

creation_phases = ['name', 'race', 'class', 'abilities', 'background', 'skills']
"""The phases to go through when creating a character."""


@character_app.route('/<int:character_id>/')
@character_app.route('/<name>/')
def view(character_id=None, name=None):
    character = get_character(character_id or name)
    if character:
        if character.creation_phase != 'done':
            return redirect(character.creation_wizard_url)

        g.bundle['races'] = list_races()
        g.bundle['skills'] = list_skills()
        g.bundle['abilities'] = list_abilities()
        g.bundle['character_data'] = character
        g.bundle['update_url'] = character.update_url
        g.bundle['fetch_updates_url'] = character.fetch_updates_url
        g.bundle['stream_updates_url'] = character.stream_updates_url

        require_scripts('chat', 'character', 'updates', 'tabs', 'view_character')
        require_styles('character', 'tabs', 'view_character')

        response = make_response(render_template('view_character.html', character=character))
        response.set_cookie('character', str(character.id))
        return response
    else:
        flash("Character not found: " + (name or str(character_id)))
        return redirect('/')


@character_app.route('/<int:character_id>/update')
@character_app.route('/<name>/update')
@json_service
def update(character_id=None, name=None):
    character = get_character(character_id or name)
    if character is None:
        raise ValueError('Could not find character: ' + str((character_id, name)))
    print 'updating', request.args
    for key in request.args:
        if key in update_handlers.keys():
            update_handlers.get(key)(character, request.args[key])
        else:
            raise Exception('Invalid attribute: ' + key)
    return {'updates': updates.get_updates(character.id)}


@character_app.route('/new/')
def create():
    character = Character()
    character.campaign = get_main_campaign()
    db.session.add(character)
    db.session.commit()
    return redirect(url_for('characters.creation_wizard', character_id=character.id))


@character_app.route('/<int:character_id>/create')
@character_app.route('/<name>/create')
@character_app.route('/<int:character_id>/create/<phase>')
@character_app.route('/<name>/create/<phase>')
def creation_wizard(character_id=None, name=None, phase=None):
    character = get_character(character_id or name)
    if character is None:
        flash('character' + (name or str(character_id)) + ' does not exist')
        return redirect(url_for('campaign.view'))
    if not phase:
        phase = character.creation_phase
    if not phase:
        phase = creation_phases[0]
    if phase not in creation_phases:
        flash('phase "' + phase + '" is not a valid phase')
        return redirect(url_for('campaign.view'))

    require_scripts('wizard', 'character_creation_wizard')
    require_styles('wizard')
    g.bundle['character'] = character
    g.bundle['wizard_current_phase'] = phase
    g.bundle['wizard_phases'] = creation_phases
    done_url = character.view_url
    return render_template('wizard/wizard.html', current_phase=phase, phases=creation_phases,
                           done_url=done_url, character=character)


@character_app.route('/<int:character_id>/fetch_updates')
@character_app.route('/<name>/fetch_updates')
@json_service
def fetch_updates(character_id=None, name=None):
    if character_id is None:
        character_id = get_character(name).id
    return {'updates': updates.get_updates(character_id)}


@character_app.route('/<int:character_id>/update_stream')
@character_app.route('/<name>/update_stream')
def stream_updates(character_id=None, name=None):
    if character_id is None:
        character_id = get_character(name).id
    return Response(updates.update_stream(character_id), mimetype="text/event-stream")


def handler(handler_name):
    def wrapper(f):
        update_handlers[handler_name] = f
        return f

    return wrapper


@handler('name')
def update_name(character, value):
    old_name = character.name
    if old_name != value:
        character.name = str(value)
        db.session.commit()
        updates.add_update(character.id, {'name', character.name})
        updates.add_update(character.id, {'view_url', character.view_url})


@handler('max_hitpoints')
def update_max_hitpoints(character, value):
    value = int(value)
    character.hitpoints += value - character.max_hitpoints
    character.max_hitpoints = value
    db.session.commit()


@handler('hitpoints')
def update_max_hitpoints(character, value):
    character.hitpoints = int(value)
    db.session.commit()


@handler('backstory')
def update_backstory(character, value):
    value = value.replace('<br>', '\n')
    character.backstory = value
    db.session.commit()


@handler('personality')
def update_personality(character, value):
    value = value.replace('<br>', '\n')
    character.personality = value
    db.session.commit()


@handler('creation_phase')
def update_creation_phase(character, value):
    character.creation_phase = value
    db.session.commit()


@handler('race')
def update_race(character, value):
    character.race = get_race(value)
    db.session.commit()


@handler('class')
def update_class(character, value):
    character.character_class = get_class(value)
    db.session.commit()


