from flask import render_template, request, Response, g, url_for
from flask.blueprints import Blueprint

from models import db
from models.campaign import get_main_campaign
from models.characters import get_character
from models.messages import Message
from updates import add_message_update, update_stream, get_updates
from util import json_service, require_scripts, require_styles


dm_app = Blueprint('dm', __name__)


@dm_app.route('/')
def dashboard():
    campaign = get_main_campaign()
    g.bundle['characters'] = campaign.characters
    g.bundle['chat_url'] = url_for('dm.chat')
    g.bundle['fetch_updates_url'] = url_for('dm.fetch_updates')
    g.bundle['stream_updates_url'] = url_for('dm.stream_updates')
    require_scripts('chat', 'character', 'updates', 'tabs', 'dm_dashboard')
    require_styles('character', 'tabs', 'dm_dashboard')
    return render_template("dm_dashboard.html", campaign=campaign)


@dm_app.route('/fetch_updates')
@json_service
def fetch_updates():
    return {'updates': get_updates('DM')}


@dm_app.route('/update_stream')
def stream_updates():
    print "stream_updates called"
    return Response(update_stream('DM'), mimetype="text/event-stream")


@dm_app.route('/chat', methods=["POST"])
@json_service
def chat():
    content = request.form.get('content', '')
    for recipient in request.form.getlist("to[]"):
        recipient = get_character(recipient)
        if recipient:
            message = Message(content, None, recipient)
            db.session.add(message)
            add_message_update(message)

