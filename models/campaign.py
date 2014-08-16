from models import db


def get_main_campaign():
    campaign = Campaign.query.first()
    if campaign is None:
        campaign = Campaign('')
        db.session.add(campaign)
        db.session.commit()
    return campaign


class Campaign(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), unique=True)

    characters = db.relationship("Character", backref='campaign')

    def __init__(self, name):
        self.name = name