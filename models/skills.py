from models import db
from models.abilities import get_ability


def init_skills():
    strength = get_ability('strength')
    dexterity = get_ability('dexterity')
    intelligence = get_ability('intelligence')
    wisdom = get_ability('wisdom')
    charisma = get_ability('charisma')

    make_skill('Athletics', strength, 'How athletic you are')
    make_skill('Acrobatics', dexterity)
    make_skill('Sleight of hand', dexterity)
    make_skill('Stealth', dexterity)
    make_skill('Arcana', intelligence)
    make_skill('History', intelligence)
    make_skill('Investigation', intelligence)
    make_skill('Nature', intelligence)
    make_skill('Religion', intelligence)
    make_skill('Animal Handling', wisdom)
    make_skill('Insight', wisdom)
    make_skill('Medicine', wisdom)
    make_skill('Perception', wisdom)
    make_skill('Survival', wisdom)
    make_skill('Deception', charisma)
    make_skill('Intimidation', charisma)
    make_skill('Performance', charisma)
    make_skill('Persuasion', charisma)

    db.session.commit()


def make_skill(name, ability, description='...'):
    if get_skill(name) is None:
        db.session.add(Skill(name, ability, description))


def get_skill(name):
    """
    Load the skill from the database with that name
    :type name: str
    :rtype: Skill
    """
    return Skill.query.filter_by(name=name).first()


def list_skills():
    """
    :rtype: list of [Skill]
    """
    return Skill.query.all()


class Skill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), unique=True)
    ability_id = db.Column(db.Integer, db.ForeignKey('ability.id'))
    description = db.Column(db.Text)

    ability = db.relationship('Ability', backref="skills")

    def __init__(self, name, ability, description="..."):
        self.name = name
        self.ability = ability
        self.description = description

    def __serialize__(self):
        return {
            'name': self.name,
            'description': self.description,
            'ability': getattr(self.ability, 'name', '')
        }


class SkillLevel(db.Model):
    character_id = db.Column(db.Integer, db.ForeignKey('character.id'), primary_key=True)
    skill_id = db.Column(db.Integer, db.ForeignKey('skill.id'), primary_key=True)
    level = db.Column(db.Integer)

    skill = db.relationship('Skill')
    character = db.relationship('Character', backref="skill_levels")

    def __init__(self, skill, character, level):
        self.skill = skill
        self.character = character
        self.level = level

    def __serialize__(self):
        return {
            'skill': getattr(self.skill, 'name', ''),
            'character': getattr(self.character, 'name', '')
        }