from flask import Blueprint, request

from models import db
from models.characters import get_character
from models.messages import Message, get_dm_messages
from updates import add_message_update, get_updates, DM_ID
from util import json_service


chat_app = Blueprint('chat', __name__)


def character_id_to_messages(character_id):
    """
    Get the MessagesComponent for a character or return the DM's messenger if the character is 0.
    :param character_id:
    :rtype: MessagesComponent
    """
    if character_id == DM_ID:
        return get_dm_messages()
    else:
        character = get_character(character_id)
        if character is None:
            raise Exception('character with id', character_id, 'does not exist')
        return character.messages


@chat_app.route('/', methods=["POST"])
@json_service
def chat():
    content = request.form.get('content', '')
    sender_id = int(request.form.get('sender', DM_ID))
    sender = character_id_to_messages(sender_id)
    recipient_ids = map(int, request.form.getlist("recipients[]"))
    recipients = map(character_id_to_messages, recipient_ids)
    message = Message(content, sender, recipients)
    db.session.add(message)
    db.session.commit()
    add_message_update(message, sender_id, recipient_ids)

    return {'updates': get_updates(sender_id)}