from models import db


def list_knowledge():
    return Knowledge.query.all()


knowledge_to_character = db.Table('knowledge_to_component',
                                  db.Column('knowledge_id', db.Integer, db.ForeignKey('knowledge.id')),
                                  db.Column('character_id', db.Integer, db.ForeignKey('character.id')))


class Knowledge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text)
    content = db.Column(db.Text)
    owners = db.relationship('Character', secondary=knowledge_to_character, backref='knowledge')

    def __serialize__(self):
        return {
            'id': self.id,
            'name': self.name,
            'content': self.content,
            'owners': [owner.id for owner in self.owners]
        }
