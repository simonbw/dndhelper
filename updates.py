"""
Update queues for all characters.
"""

from Queue import Queue
from time import sleep

from flask import jsonify


_updates = {}
"""
:type : dict[str, Queue]
"""


def ensure_exists(character):
    if character not in _updates:
        _updates[character] = Queue()


def has_update(character):
    """
    :type character: str
    :rtype: bool
    """
    ensure_exists(character)
    return not _updates[character].empty()


def add_update(character, update):
    """
    :type character: str
    :type update: object
    """
    ensure_exists(character)
    _updates[character].put(update)

    print "updated for: " + character, _updates


def get_update(character):
    """
    :rtype : object
    """
    return _updates[character].get()


def get_updates(character):
    """
    :rtype : list[object]
    """
    u = []
    while has_update(character):
        u.append(get_update(character))
    return u


def add_redirect_update(character, location):
    """
    :type character: str
    :type location: str
    """
    update = {
        'type': 'redirect',
        'location': location
    }
    add_update(character, update)


def add_message_update(message):
    """
    :type message: models.messages.Message
    """
    update = {
        'type': 'message',
        'id': message.id,
        'sender': getattr(message.sender, 'name', 'DM'),
        'content': message.content
    }
    add_update(message.recipient_name, update)
    add_update(message.sender_name, update)


def update_stream(name):
    print "creating update stream"
    while True:
        if _updates.has_update(name):
            return jsonify({'updates': get_updates(name)})
        sleep(0.1)  # do we need this?