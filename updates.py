"""
Update queues for all characters. NOTE: 0 is used for the id of the DM.
"""

from Queue import Empty, Queue
from threading import Lock
from time import sleep

from util import Jsonifier


DM_ID = 0

_updates = {}
"""
:type : dict[int, Queue]
"""


def ensure_exists(character_id):
    """
    :type character_id: int
    """
    lock = Lock()
    lock.acquire()
    try:
        if character_id not in _updates:
            _updates[character_id] = Queue()
    except Exception as e:
        print "something went wrong in ensure_exists", e
    finally:
        lock.release()


def has_update(character_id):
    """
    :type character_id: int
    :rtype: bool
    """
    ensure_exists(character_id)
    return not _updates[character_id].empty()


def add_update(character_id, update):
    """
    :type character_id: int
    :type update: object
    """
    ensure_exists(character_id)
    _updates[character_id].put(update)


def add_character_update(character_id, attribute, value):
    """
    :type character_id: int
    :type attribute: str
    :type value: *
    """
    update = {
        'type': 'character_update',
        'id': character_id,
        'attribute': attribute,
        'value': value
    }
    add_update(character_id, update)
    add_update(DM_ID, update)


def get_update(character_id, block=False):
    """
    :type character_id: int
    :rtype : object
    """
    ensure_exists(character_id)
    queue = _updates[character_id]
    update = queue.get(block)
    queue.task_done()
    return update


def get_updates(character_id):
    """
    :type character_id: int
    :rtype : list[object]
    """
    u = []
    while has_update(character_id):
        u.append(get_update(character_id))
    return u


def add_redirect_update(character_id, location):
    """
    :type character_id: int
    :type location: str
    """
    update = {
        'type': 'redirect',
        'location': location
    }
    add_update(character_id, update)


def add_message_update(message):
    """
    :type message: models.messages.Message
    """
    sender_id = getattr(message.sender, 'id', 0)
    recipient_id = getattr(message.recipient, 'id', 0)
    update = {
        'type': 'message',
        'id': message.id,
        'sender': message.sender_name,
        'recipient': message.recipient_name,
        'content': message.content
    }
    add_update(sender_id, update)
    add_update(recipient_id, update)


def update_stream(character_id):
    """
    Create an update stream for a character or the DM.
    :type character_id: int
    :return:
    """
    jsonifier = Jsonifier()
    while True:
        try:
            if has_update(character_id):
                updates = [get_update(character_id)]
                data = jsonifier.encode({'updates': updates})
                yield 'data: ' + 'test data\n'
        except Empty as e:
            print "updates.py:135 - Empty Queue Exception"
        except Exception as e:
            print "updates.py:137 - Something went wrong", e
        sleep(0.5)  # do we need this?
