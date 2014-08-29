from models import db


def init_races():
    for race_name in ('Human', 'Elf', 'Dwarf', 'Halfling'):
        if get_race(race_name) is None:
            db.session.add(Race(race_name))
    db.session.commit()


def get_race(name):
    """
    Load the race from the database with that name
    :type name: str
    :rtype: Race
    """
    return Race.query.filter_by(name=name).first()


def list_races():
    """
    :rtype: list of [Race]
    """
    return Race.query.all()


class Race(db.Model):
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