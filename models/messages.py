from models import db


DM_MESSAGES_ID = 1


def init_messages():
    print "initializing messages"
    if not MessagesComponent.query.get(1):
        db.session.add(MessagesComponent())
        db.session.commit()


def get_dm_messages():
    MessagesComponent.query.get(DM_MESSAGES_ID)


recipients_table = db.Table(
    'message_recipients',
    db.Column('message_id', db.Integer, db.ForeignKey('message.id'), primary_key=True),
    db.Column('recipient_id', db.Integer, db.ForeignKey('messages_component.id'), primary_key=True),
)


class MessagesComponent(db.Model):
    id = db.Column(db.Integer, primary_key=True)


class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(128))

    sender_id = db.Column(db.Integer, db.ForeignKey('messages_component.id'))
    sender = db.relationship('MessagesComponent', backref='sent_messages', foreign_keys=[sender_id])

    recipients = db.relationship('MessagesComponent', backref=db.backref('messages', lazy='dynamic'),
                                 secondary=recipients_table)

    def __init__(self, content='', sender=None, recipients=None):
        self.content = content
        self.sender = sender
        self.recipients = recipients or []

    @property
    def sender_name(self):
        return getattr(self.sender, 'name', "DM")

    def __serialize__(self):
        return {
            'id': self.id,
            'content': self.content,
            'sender': self.sender_id,
            'recipients': [recipient.id for recipient in self.recipients]
        }