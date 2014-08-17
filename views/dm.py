from flask import render_template, Response, g, url_for
from flask.blueprints import Blueprint

from models.campaign import get_main_campaign
from updates import update_stream, get_updates
from util import json_service, require_scripts, require_styles


dm_app = Blueprint('dm', __name__)


@dm_app.route('/')
def dashboard():
    campaign = get_main_campaign()
    g.bundle['characters'] = campaign.characters
    g.bundle['fetch_updates_url'] = url_for('dm.fetch_updates')
    g.bundle['stream_updates_url'] = url_for('dm.stream_updates')
    require_scripts('chat', 'character', 'updates', 'dm_dashboard')
    require_styles('character', 'dm_dashboard')
    return render_template("dm_dashboard.html", campaign=campaign)


@dm_app.route('/fetch_updates')
@json_service
def fetch_updates():
    return {'updates': (get_updates('DM'))}


@dm_app.route('/update_stream')
def stream_updates():
    print "dm.py:34 - stream_updates called"
    return Response(update_stream('DM'), mimetype="text/event-stream")
