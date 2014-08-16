from flask import url_for

from models import db
from models.abilities import list_abilities, AbilityScore, get_ability
from models.campaign import get_main_campaign
from models.classes import get_class
from models.messages import Message
from models.races import get_race
from models.skills import SkillLevel, list_skills, get_skill


def init_characters():
    character = Character('Simieth', 12)
    character.hitpoints = 8
    character.campaign = get_main_campaign()
    db.session.add(character)
    db.session.commit()


def get_character(name):
    """
    Load the first character from the database with that name
    :type name: str
    :rtype: Character
    """
    return Character.query.filter_by(name=name).first()


class Character(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), unique=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaign.id'))

    race_id = db.Column(db.Integer, db.ForeignKey('race.id'))
    race = db.relationship("Race")

    class_id = db.Column(db.Integer, db.ForeignKey('character_class.id'))
    character_class = db.relationship("CharacterClass")

    backstory = db.Column(db.Text)
    personality = db.Column(db.Text)
    hitpoints = db.Column(db.Integer)
    max_hitpoints = db.Column(db.Integer)

    # abilities
    # skills
    # messages

    def __init__(self, name, max_hit_points=10, backstory='...', personality='...',
                 race='Human', character_class='Fighter', **kwargs):
        self.name = name
        self.max_hitpoints = max_hit_points
        self.hitpoints = max_hit_points
        self.backstory = backstory
        self.personality = personality
        self.race = get_race(race)
        self.character_class = get_class(character_class)

        for ability in list_abilities():
            db.session.add(AbilityScore(ability, self, 10))

        for skill in list_skills():
            db.session.add(SkillLevel(skill, self, 1))

    @property
    def view_url(self):
        return url_for('characters.view', name=self.name)

    def get_recent_messages(self):
        return self.messages.order_by(Message.id.desc()).limit(20)

    def get_skill_level(self, skill):
        """
        :rtype: int
        """
        if isinstance(skill, str):
            skill = get_skill(skill)
        return getattr(SkillLevel.query.filter_by(character=self, skill=skill).first(), 'level', 0)

    def set_skill_level(self, skill, level):
        if isinstance(skill, basestring):
            skill = get_skill(skill)
        SkillLevel.query.filter_by(character=self, skill=skill).first().level = int(level)

    def get_ability_score(self, ability):
        """
        :rtype: int
        """
        if isinstance(ability, basestring):
            ability = get_ability(ability)
        return getattr(AbilityScore.query.filter_by(character=self, ability=ability).first(), 'score', 10)

    def set_ability_score(self, ability, score):
        if isinstance(ability, basestring):
            ability = get_ability(ability)
        AbilityScore.query.filter_by(character=self, ability=ability).first().score = int(score)

    def __serialize__(self):
        serialized = {
            'id': self.id,
            'name': self.name,
            'class': self.character_class.name,
            'race': self.race.name,
            'backstory': self.backstory,
            'personality': self.personality,
            'hitpoints': self.hitpoints,
            'max_hitpoints': self.max_hitpoints
        }
        for skill in list_skills():
            serialized[skill.name] = self.get_skill_level(skill)
        return serialized