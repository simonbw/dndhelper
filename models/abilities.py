from descriptions import get_description
from models import db


abilities = {}


def init_abilities():
    make_ability('Strength', 'STR')
    make_ability('Dexterity', 'DEX')
    make_ability('Constitution', 'CON')
    make_ability('Intelligence', 'INT')
    make_ability('Wisdom', 'WIS')
    make_ability('Charisma', 'CHA')
    db.session.commit()


def make_ability(name, abbreviation):
    """
    :rtype : Ability
    """
    if get_ability(name) is None:
        description = get_description('ability_' + abbreviation)
        db.session.add(Ability(name, abbreviation, description))


def get_ability(name):
    """
    Load the race from the database with that name
    :type name: basestring
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
    abbreviation = db.Column(db.String(128), unique=True)
    description = db.Column(db.Text)

    def __init__(self, name, abbreviation, description='...'):
        self.name = name
        self.abbreviation = abbreviation
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