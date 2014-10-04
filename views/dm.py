from flask import render_template, Response, g, url_for, flash, redirect
from flask.blueprints import Blueprint

from models import db
from models.campaign import get_main_campaign
from models.inventory import list_items
from models.knowledge import list_knowledge
from models.monsters import Monster, get_monster
from updates import update_stream, get_updates
import updates
from util import json_service, require_scripts, require_styles


dm_app = Blueprint('dm', __name__)

creation_phases = ['name', 'abilities', 'modifiers', 'description']
"""The phases to go through when creating a monster."""


@dm_app.route('/')
def dashboard():
    campaign = get_main_campaign()
    g.bundle['characters'] = campaign.characters
    g.bundle['fetch_updates_url'] = url_for('dm.fetch_updates')
    g.bundle['stream_updates_url'] = url_for('dm.stream_updates')
    g.bundle['knowledge'] = list_knowledge()
    g.bundle['item-types'] = list_items()

    require_scripts('chat', 'character', 'updates', 'binds', 'characters', 'dashboard', 'util/util',
                    'models/simple_model', 'models/item_type', 'models/knowledge', 'renderers/inventory',
                    'renderers/item_list', 'renderers/item_picker', 'renderers/knowledge', 'dm/roller',
                    'dm/knowledge_edit', 'dm/items_edit', 'dm/character_info', 'dm/dashboard'); require_styles('character', 'tabs', 'dashboard', 'dm/party', 'dm/roller', 'dm/chat', 'dm/character_info', 'dm/tools', 'dm/knowledge', 'dm/items', 'dm/item_picker')
    return render_template("dm/dashboard.html", campaign=campaign, title='DM')


@dm_app.route('/fetch_updates')
@json_service
def fetch_updates():
    return {'updates': (get_updates(updates.DM_ID))}


@dm_app.route('/update_stream')
def stream_updates():
    print "dm.py:34 - stream_updates called"
    return Response(update_stream(updates.DM_ID), mimetype="text/event-stream")


@dm_app.route('/new/monster')
def create_monster():
    monster = Monster()
    monster.campaign = get_main_campaign()
    db.session.add(monster)
    db.session.commit()
    return redirect(url_for('monsters.creation_wizard', character_id=monster.id))


@dm_app.route('monster/<int:monster_id>/create/<phase>')
@dm_app.route('monster/<int:monster_id>/create')
def creation_wizard(monster_id=None, phase=None):
    monster = get_monster(monster_id)
    if monster is None:
        flash('monster' + str(monster_id) + ' does not exist')
        return redirect(url_for('dm.view'))
    if not phase:
        phase = monster.creation_phase
    if not phase:
        phase = creation_phases[0]
    if phase not in creation_phases:
        flash('phase "' + phase + '" is not a valid phase')
        return redirect(url_for('dm.view'))

    require_scripts('updates', 'wizard', 'binds', 'monster_creation_wizard')
    require_styles('wizard')
    g.bundle['monster'] = monster
    g.bundle['wizard_current_phase'] = phase
    g.bundle['wizard_phases'] = creation_phases
    g.bundle['fetch_updates_url'] = monster.fetch_updates_url
    g.bundle['stream_updates_url'] = monster.stream_updates_url
    done_url = dm_app.static_url_path
    return render_template('wizard/wizard.html', current_phase=phase, phases=creation_phases,
                           done_url=done_url, character=character)