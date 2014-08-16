from models import db


abilities = {}


def init_abilities():
    for ability_name in ('strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'):
        if get_ability(ability_name) is None:
            db.session.add(Ability(ability_name))
    db.session.commit()


def get_ability(name):
    """
    Load the race from the database with that name
    :type name: str
    :rtype: Ability
    """
    return Ability.query.filter_by(name=name).first()


def list_abilities():
    """
    :rtype: list of [Ability]
    """
    return Ability.query.all()


class Ability(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), unique=True)
    description = db.Column(db.Text)

    def __init__(self, name, description='...'):
        self.name = name
        self.description = description

    def __serialize__(self):
        return {
            'name': self.name,
            'description': self.description
        }


class AbilityScore(db.Model):
    character_id = db.Column(db.Integer, db.ForeignKey('character.id'), primary_key=True)
    ability_id = db.Column(db.Integer, db.ForeignKey('ability.id'), primary_key=True)
    score = db.Column(db.Integer)

    ability = db.relationship('Ability')
    character = db.relationship('Character', backref="ability_scores")

    def __init__(self, ability, character, level):
        self.ability = ability
        self.character = character
        self.score = int(level)