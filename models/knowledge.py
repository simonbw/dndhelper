from models import db


def init_knowledge():
    print "initializing knowledge"
    db.session.add(Knowledge(name='Basic Info', content='trololol'))
    for i in range(3):
        db.session.add(Knowledge(name='More Basic Info: ' + str(i), content='infofofofof'))
    db.session.commit()


def list_knowledge():
    return Knowledge.query.all()


knowledge_to_character = db.Table('knowledge_to_component',
                                  db.Column('knowledge_id', db.Integer, db.ForeignKey('knowledge.id')),
                                  db.Column('character_id', db.Integer, db.ForeignKey('character.id')))


class Knowledge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, default='New Knowledge')
    content = db.Column(db.Text, default='content...')
    owners = db.relationship('Character', secondary=knowledge_to_character, backref='knowledge')

    def __serialize__(self, full=True):
        if full:
            return {
                'id': self.id,
                'name': self.name,
                'content': self.content,
                'owners': [owner.id for owner in self.owners]
            }
        else:
            return {
                'id': self.id,
                'name': self.name,
            }