"""
Update queues for all characters.
"""

from Queue import Queue

updates = {}
"""
:type : dict[str, Queue]
"""


def ensure_exists(character):
    if character not in updates:
        updates[character] = Queue()


def has_update(character):
    """
    :type character: str
    :rtype: bool
    """
    ensure_exists(character)
    return not updates[character].empty()


def add_update(character, update):
    """
    :type character: str
    :type update: object
    """
    ensure_exists(character)
    updates[character].put(update)

    print "updated for: " + character, updates


def get_update(character):
    """
    :rtype : object
    """
    return updates[character].get()


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
        'sender': getattr(message.sender, 'name', "DM"),
        'content': message.content
    }
    add_update(message.recipient_name, update)