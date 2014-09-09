from descriptions import get_description
from models import db
from models.abilities import get_ability


def init_skills():
    strength = get_ability('Strength')
    dexterity = get_ability('Dexterity')
    intelligence = get_ability('Intelligence')
    wisdom = get_ability('Wisdom')
    charisma = get_ability('Charisma')

    make_skill('Athletics', strength)
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


def make_skill(name, ability):
    if get_skill(name) is None:
        description = get_description('skill_' + name)
        db.session.add(Skill(name, ability, description))


def get_skill(name):
    """
    Load the skill from the database with that name
    :type name: str
    :rtype: Skill
    """
    return Skill.query.filter_by(name=name).first()


def list_skills(ability=None):
    """
    :type ability: Ability
    :rtype: list of [Skill]
    """
    if ability is not None:
        return Skill.query.filter_by(ability=ability)
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
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'ability': getattr(self.ability, 'name', ''),
            'ability_id': self.ability.id
        }

    def __str__(self):
        return self.name


class SkillLevel(db.Model):
    level = db.Column(db.Integer)

    skill_id = db.Column(db.Integer, db.ForeignKey('skill.id'), primary_key=True)
    skill = db.relationship('Skill')

    component_id = db.Column(db.Integer, db.ForeignKey('skills_component.id'), primary_key=True)
    component = db.relationship('SkillsComponent', backref="skill_levels")

    def __init__(self, skill, component, level):
        self.skill = skill
        self.component = component
        self.level = level

    def __serialize__(self):
        return {
            'skill': getattr(self.skill, 'name', ''),
            'character': getattr(self.character, 'name', '')
        }


class SkillsComponent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # skill_levels

    def set_level(self, skill, level):
        skill_level = SkillLevel.query.filter_by(component=self, skill=skill).first()
        if skill_level is None:
            SkillLevel(skill, self, level)
        else:
            skill_level.level = level

    def get_level(self, skill):
        skill_level = SkillLevel.query.filter_by(component=self, skill=skill).first()
        if skill_level is None:
            return 0
        else:
            return skill_level.level

    def __iter__(self):
        for skill_level in self.skill_levels:
            yield (skill_level.skill, skill_level.level)