from time import sleep

from flask.blueprints import Blueprint

from flask.templating import render_template
from flask import redirect, url_for, make_response, request, flash, Response, jsonify

from models import db

from models.abilities import list_abilities
from models.campaign import get_main_campaign
from models.characters import Character, get_character
from models.races import list_races
from models.skills import list_skills
import updates
from util import json_service


character_app = Blueprint('characters', __name__)

update_handlers = {}
""":type: dict[str, func]"""


@character_app.route('/<name>/')
def view(name):
    character = get_character(name)
    if character:
        response = make_response(
            render_template('view_character.html', character=character, races=list_races(), skills=list_skills(),
                            abilities=list_abilities()))
        response.set_cookie('character', name)
        return response
    else:
        flash("Character not found: " + name)
        return redirect('/')


@character_app.route('/<name>/update')
@json_service
def update(name):
    character = get_character(name)
    if character is not None:
        print request.args
        for key in request.args:
            if key in update_handlers:
                update_handlers.get(key)(character, request.args[key])
            else:
                raise Exception('Invalid attribute: ' + key)
    return {'updates': updates.get_updates(name)}


@character_app.route('/<name>/create')
def create(name):
    character = Character(name)
    character.campaign = get_main_campaign()
    db.session.add(character)
    return redirect(url_for('characters.view', name=name))


@character_app.route('/<name>/get_updates')
@json_service
def fetch_updates(name):
    return {'updates': updates.get_updates(name)}


@character_app.route('/<name>/update_stream')
def stream_updates(name):
    print "stream_updates called"
    return Response(update_stream(name), mimetype="text/event-stream")


def update_stream(name):
    print "creating update stream"
    while True:
        if updates.has_update(name):
            return jsonify({'updates': updates.get_update(name)})
        sleep(0.1)  # do we need this?


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
        updates.add_redirect_update(old_name, character.view_url)


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


