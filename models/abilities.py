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

    def __str__(self):
        return self.name


class AbilityScore(db.Model):
    score = db.Column(db.Integer)

    ability_id = db.Column(db.Integer, db.ForeignKey('ability.id'), primary_key=True)
    ability = db.relationship('Ability')

    component_id = db.Column(db.Integer, db.ForeignKey('abilities_component.id'), primary_key=True)
    component = db.relationship('AbilitiesComponent', backref="ability_scores")

    def __init__(self, ability, component, score):
        self.ability = ability
        self.component = component
        self.score = int(score)


class AbilitiesComponent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # ability_scores

    def set_score(self, ability, score):
        if not isinstance(ability, Ability):
            raise ValueError("Expecting ability, instead got " + ability)
        ability_score = AbilityScore.query.filter_by(component=self, ability=ability).first()
        if ability_score is None:
            AbilityScore(ability, self, score)
        else:
            ability_score.score = score

    def get_score(self, ability):
        ability_score = AbilityScore.query.filter_by(component=self, ability=ability).first()
        if ability_score is None:
            return 0
        else:
            return ability_score.score

    def __iter__(self):
        for ability_score in self.ability_scores:
            yield (ability_score.ability, ability_score.score)
