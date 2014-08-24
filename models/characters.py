import random

from flask import url_for

from models import db
from models.abilities import list_abilities, get_ability, AbilitiesComponent
from models.campaign import get_main_campaign
from models.classes import get_class
from models.messages import Message
from models.races import get_race
from models.skills import list_skills, get_skill, SkillsComponent

DEFAULT_SKILL_LEVEL = 0

DEFAULT_ABILITY_SCORE = 10


def init_characters():
    make_character('Simieth')
    make_character('Balthor')
    make_character('Tamora')
    make_character('Leora')
    make_character('Glenn')


def make_character(name):
    character = Character(name, random.randint(8, 16))
    db.session.add(character)
    db.session.commit()
    character.hitpoints = random.randint(1, character.max_hitpoints)
    character.campaign = get_main_campaign()
    for ability in list_abilities():
        character.set_ability_score(ability, random.randint(8, 18))
    for skill in list_skills():
        character.set_skill_level(skill, random.randint(0, 6))
    db.session.commit()


def get_character(id_or_name):
    """
    Load the first character from the database with that name
    :type id_or_name: str|int
    :rtype: Character
    """
    if isinstance(id_or_name, int):
        return Character.query.get(id_or_name)
    else:
        return Character.query.filter_by(name=id_or_name).first()


class Character(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaign.id'))
    creation_phase = db.Column(db.String(256))

    race_id = db.Column(db.Integer, db.ForeignKey('race.id'))
    race = db.relationship("Race")

    class_id = db.Column(db.Integer, db.ForeignKey('character_class.id'))
    character_class = db.relationship("CharacterClass")

    name = db.Column(db.String(128))  # not unique because we might have multiple no names
    backstory = db.Column(db.Text)
    personality = db.Column(db.Text)
    hitpoints = db.Column(db.Integer)
    max_hitpoints = db.Column(db.Integer)
    initiative = db.Column(db.Integer)

    abilities_component_id = db.Column(db.ForeignKey("abilities_component.id"))
    abilities = db.relationship("AbilitiesComponent")

    skills_component_id = db.Column(db.ForeignKey("skills_component.id"))
    skills = db.relationship("SkillsComponent")

    # messages

    def __init__(self, name='', max_hit_points=10, backstory='...', personality='...',
                 race='Human', character_class='Fighter', **kwargs):
        self.name = name
        self.name = name
        self.max_hitpoints = max_hit_points
        self.hitpoints = max_hit_points
        self.backstory = backstory
        self.personality = personality
        self.race = get_race(race)
        self.character_class = get_class(character_class)

        self.abilities = AbilitiesComponent()
        self.skills = SkillsComponent()

        for ability in list_abilities():
            self.abilities.set_score(ability, kwargs.get(ability.name, DEFAULT_ABILITY_SCORE))

        for skill in list_skills():
            self.skills.set_level(skill, kwargs.get(skill.name, DEFAULT_SKILL_LEVEL))

    @property
    def view_url(self):
        if self.name:
            return url_for('characters.view', name=self.name)
        return url_for('characters.view', character_id=self.id)

    @property
    def update_url(self):
        return url_for('characters.update', character_id=self.id)

    @property
    def fetch_updates_url(self):
        return url_for('characters.fetch_updates', character_id=self.id)

    @property
    def stream_updates_url(self):
        return url_for('characters.stream_updates', character_id=self.id)

    @property
    def creation_wizard_url(self):
        phase = None  # self.creation_phase
        return url_for('characters.creation_wizard', character_id=self.id, phase=phase)

    def get_recent_messages(self):
        return self.messages.order_by(Message.id.desc()).limit(20)

    def get_skill_level(self, skill):
        """
        :rtype: int
        """
        if isinstance(skill, str):
            skill = get_skill(skill)
        return self.skills.get_level(skill)

    def set_skill_level(self, skill, level):
        """
        :type skill: Skill|str
        :type level: int
        """
        if isinstance(skill, basestring):
            skill = get_skill(skill)
        return self.skills.set_level(skill, level)

    def get_ability_score(self, ability):
        """
        :rtype: int
        """
        if isinstance(ability, basestring):
            ability = get_ability(ability)
        return self.abilities.get_score(ability)

    def set_ability_score(self, ability, score):
        """
        :type ability: Skill|str
        :type score: int
        """
        if isinstance(ability, basestring):
            ability = get_ability(ability)
        self.abilities.set_score(ability, score)

    def __serialize__(self):
        # serialized = {attribute: getattr(self, attribute) for attribute in Character.list_attribute_names()}
        serialized = {
            'id': self.id,
            'name': self.name,
            'backstory': self.backstory,
            'race': getattr(self.race, 'name', ''),
            'character_class': getattr(self.character_class, 'name', ''),
            'personality': self.personality,
            'hitpoints': self.hitpoints,
            'max_hitpoints': self.max_hitpoints,
            'creation_phase': self.creation_phase,
            'view_url': self.view_url,
            'update_url': self.update_url,
            'fetch_updates_url': self.fetch_updates_url,
            'stream_updates_url': self.stream_updates_url,
            'creation_wizard_url': self.creation_wizard_url,
        }
        for skill in list_skills():
            serialized[skill.name] = self.get_skill_level(skill)
        for ability, score in self.abilities:
            serialized[ability.name] = score
        return serialized

    @staticmethod
    def list_attribute_names():
        """
        Return a list of the names of all attributes that can be accessed directly.
        :rtype: list[str]
        """
        attributes = ['id', 'name', 'backstory', 'personality', 'hitpoints', 'max_hitpoints',
                      'view_url', 'update_url', 'fetch_updates_url', 'stream_updates_url', 'creation_wizard_url',
                      'creation_phase', 'initiative']
        # for skill in list_skills():
        # attributes.append(skill.name)
        # for ability in list_abilities():
        # attributes.append(ability.name)
        return attributes