from flask import render_template, request
from flask.blueprints import Blueprint

from models import db

from models.campaign import get_main_campaign
from models.characters import get_character
from models.messages import Message
from updates import add_message_update
from util import json_service


dm_app = Blueprint('dm', __name__)


@dm_app.route('/')
def dashboard():
    campaign = get_main_campaign()
    return render_template("dm_dashboard.html", campaign=campaign)


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

