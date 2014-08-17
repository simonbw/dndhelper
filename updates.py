"""
Update queues for all characters.
"""

from Queue import Empty, Queue
from threading import Lock
from time import sleep

from util import Jsonifier


_updates = {}
"""
:type : dict[str, Queue]
"""


def ensure_exists(character):
    lock = Lock()
    lock.acquire()
    try:
        if character not in _updates:
            _updates[character] = Queue()
    except Exception as e:
        print "something went wrong in ensure_exists", e
    finally:
        lock.release()


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
    print "updates.py:48 - updating for: " + character
    _updates[character].put(update)
    # test_queue.put(update)
    print "updates.py:51 - updated for: " + character


def get_update(character, block=False):
    """
    :rtype : object
    """
    ensure_exists(character)
    queue = _updates[character]
    update = queue.get(block)
    queue.task_done()
    return update


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
        'sender': message.sender_name,
        'recipient': message.recipient_name,
        'content': message.content
    }
    add_update(message.recipient_name, update)
    add_update(message.sender_name, update)


def update_stream(name):
    """
    Create an update stream for a character or the DM.
    :param name:
    :return:
    """
    jsonifier = Jsonifier()
    while True:
        try:
            if has_update(name):
                updates = [get_update(name)]
                data = jsonifier.encode({'updates': updates})
                yield 'data: ' + 'test data\n'
        except Empty as e:
            print "updates.py:121 - Empty Queue Exception"
        except Exception as e:
            print "updates.py:123 - Something went wrong", e
        sleep(0.5)  # do we need this?
