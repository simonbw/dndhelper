from models import db


class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(128))

    sender_id = db.Column(db.Integer, db.ForeignKey('character.id'))
    sender = db.relationship('Character', backref='sent_messages', foreign_keys=[sender_id])

    recipient_id = db.Column(db.Integer, db.ForeignKey('character.id'))
    recipient = db.relationship('Character', backref=db.backref('messages', lazy='dynamic'),
                                foreign_keys=[recipient_id])

    def __init__(self, content='', sender=None, recipient=None):
        self.content = content
        self.sender = sender
        self.recipient = recipient

    @property
    def sender_name(self):
        return getattr(self.sender, 'name', "DM")

    @property
    def recipient_name(self):
        return getattr(self.recipient, 'name', "DM")

    def __serialize__(self):
        return {
            'id': self.id,
            'content': self.content,
            'sender': self.sender_name,
            'recipient': self.recipient_name
        }