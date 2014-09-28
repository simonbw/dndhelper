import os

_descriptions = {}
_root = ""


def load_descriptions_from_file(name, prefix=''):
    """
    :param name: Name of the file to load descriptions from
    :param prefix: prefix to add when storing variable
    """
    path = os.path.join(_root, name)
    with open(path) as f:
        s = f.read()
        chunks = s.split('\n\n')

        for chunk in chunks:
            lines = chunk.split('\n')
            name = format_name(prefix + lines[0].strip())
            description = str('\n'.join(lines[1:]))
            _descriptions[name] = description


def format_name(name):
    """
    :type name: str
    :rtype: str
    """
    name = name.strip()
    name = name.lower()
    name = name.replace(" ", "_")
    return name


def get_description(name):
    """
    :type name: str
    :rtype: str
    """
    s = format_name(name)
    if s in _descriptions:
        return _descriptions[s]
    else:
        return 'No description found for "' + s + '"'


def init_descriptions(root):
    global _root
    _root = os.path.join(root, 'descriptions')
    print "initializing descriptions:", _root
    load_descriptions_from_file('abilities.txt', 'ability_')
    load_descriptions_from_file('skills.txt', 'skill_')
    load_descriptions_from_file('classes.txt', 'class_')