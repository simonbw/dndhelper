from models import db


def init_alignments():
    print "initializing alignments"
    db.session.add(Alignment('Lawful Good'))
    db.session.add(Alignment('Neutral Good'))
    db.session.add(Alignment('Chaotic Good'))
    db.session.add(Alignment('Lawful Neutral'))
    db.session.add(Alignment('True Neutral'))
    db.session.add(Alignment('Chaotic Neutral'))
    db.session.add(Alignment('Lawful Evil'))
    db.session.add(Alignment('Neutral Evil'))
    db.session.add(Alignment('Chaotic Evil'))
    db.session.commit()


def get_alignment(name):
    """
    Load the race from the database with that name
    :type name: basestring
    :rtype: Ability
    """
    return Alignment.query.filter_by(name=name).first()


def list_alignments():
    """
    :rtype: list of [Ability]
    """
    return Alignment.query.all()


class Alignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), unique=True)
    description = db.Column(db.Text)

    def __init__(self, name, description='...'):
        self.name = name
        self.description = description

    def __serialize__(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description
        }

    def __str__(self):
        return self.name
