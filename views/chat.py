from flask import Blueprint, request

from models import db
from models.characters import get_character, Character
from models.messages import Message
from updates import add_message_update, get_updates, DM_ID
from util import json_service


chat_app = Blueprint('chat', __name__)


@chat_app.route('/', methods=["POST"])
@json_service
def chat():
    content = request.form.get('content', '')
    sender = get_character(request.form.get('sender', ''))
    recipient_ids = request.form.getlist("recipients[]")
    recipients = map(Character.query.get, recipient_ids)
    message = Message(content, sender, recipients)
    db.session.add(message)
    db.session.commit()
    add_message_update(message)

    if sender is not None:
        return {'updates': get_updates(sender.id)}
    else:
        return {'updates': get_updates(DM_ID)}