from models import db


def init_classes():
    for race_name in ('Fighter', 'Rouge', 'Cleric', 'Wizard'):
        if get_class(race_name) is None:
            db.session.add(CharacterClass(race_name))
    db.session.commit()


def get_class(name):
    """
    Load the race from the database with that name
    :type name: str
    :rtype: CharacterClass
    """
    return CharacterClass.query.filter_by(name=name).first()


def list_classes():
    """
    :rtype: list of [CharacterClass]
    """
    return CharacterClass.query.all()


class CharacterClass(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), unique=True)

    def __init__(self, name):
        self.name = name

    def __str__(self):
        return self.name

    def __serialize__(self):
        return {
            'id': self.id,
            'name': self.name
        }