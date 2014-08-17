from flask import Blueprint, request

from models import db
from models.characters import get_character
from models.messages import Message
from updates import add_message_update, get_updates
from util import json_service


chat_app = Blueprint('chat', __name__)


@chat_app.route('/', methods=["POST"])
@json_service
def chat():
    content = request.form.get('content', '')
    sender = get_character(request.form.get('sender', ''))
    recipients = request.form.getlist("recipients[]")

    for recipient_name in recipients:
        recipient = get_character(recipient_name)
        message = Message(content, sender, recipient)
        db.session.add(message)
        db.session.commit()
        add_message_update(message)

    if sender is not None:
        return {'updates': get_updates(sender.name)}
    else:
        return {'updates': get_updates('DM')}