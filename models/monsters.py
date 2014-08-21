
from models import db
from models.abilities import list_abilities, AbilityScore, get_ability
from models.campaign import get_main_campaign


def init_monsters():
    monster = Monster('Blargh', 17)
    monster.hitpoints = 8
    monster.campaign = get_main_campaign()
    db.session.add(monster)
    db.session.commit()


def get_monster(id_or_name):
    """
    Load the first character from the database with that name
    :type id_or_name: str|int
    :rtype: Character
    """
    if isinstance(id_or_name, int):
        return Monster.query.get(id_or_name)
    else:
        return Monster.query.filter_by(name=id_or_name).first()


class Monster(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaign.id'))
    creation_phase = db.Column(db.String(256))

    name = db.Column(db.String(128))  # not unique because we might have multiple no names
    description = db.Column(db.Text)
    hitpoints = db.Column(db.Integer)
    max_hitpoints = db.Column(db.Integer)
    initiative = db.Column(db.Integer)

    # abilities

    def __init__(self, name='', max_hit_points=10, description='...', **kwargs):
        self.name = name
        self.max_hitpoints = max_hit_points
        self.hitpoints = max_hit_points
        self.description = description

        for ability in list_abilities():
            db.session.add(AbilityScore(ability, self, kwargs.get(ability.name, 10)))

    @property
    def creation_wizard_url(self):
        phase = None  # self.creation_phase
        return url_for('monsters.creation_wizard', character_id=self.id, phase=phase)

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
            'description': self.description,
            'hitpoints': self.hitpoints,
            'max_hitpoints': self.max_hitpoints,
            'creation_phase': self.creation_phase,
            'creation_wizard_url': self.creation_wizard_url,
        }
        for ability in list_abilities():
            serialized[ability.name] = self.get_ability_score(ability)
        return serialized

    @staticmethod
    def list_attribute_names():
        """
        Return a list of the names of all attributes that can be accessed directly.
        :rtype: list[str]
        """
        attributes = ['id', 'name', 'description', 'hitpoints', 'max_hitpoints', 'creation_phase', 'initiative', 'creation_wizard_url']
        for ability in list_abilities():
            attributes.append(ability.name)
        return attributes