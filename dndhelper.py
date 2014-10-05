"""
Create the app and run the server
"""
from collections import OrderedDict
import os

from flask import Flask, g, url_for

from models import db
from models.abilities import list_abilities
from models.alignments import list_alignments
from models.classes import list_classes
from models.inventory import list_items
from models.knowledge import list_knowledge
from models.races import list_races
from models.skills import list_skills
from util import Jsonifier, require_scripts, require_styles
from views.admin import admin_app, init_all
from views.campaign import campaign_app
from views.character import character_app
from views.chat import chat_app
from views.dm import dm_app
from views.items import items_app
from views.knowledge import knowledge_app


def create_app(debug=False):
    app = Flask(__name__)
    app.debug = debug
    app.secret_key = 'this is a secret'
    app.json_encoder = Jsonifier

    app.file_root = os.path.abspath(os.path.dirname(__file__))

    app.before_request(before_request)
    app.after_request(after_request)
    app.context_processor(context_processor)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'

    db.init_app(app)
    with app.app_context():
        init_all()
    app.register_blueprint(admin_app, url_prefix='/admin')
    app.register_blueprint(campaign_app, url_prefix='/')
    app.register_blueprint(character_app, url_prefix='/character')
    app.register_blueprint(dm_app, url_prefix='/dm')
    app.register_blueprint(chat_app, url_prefix='/chat')
    app.register_blueprint(items_app, url_prefix='/item-type')
    app.register_blueprint(knowledge_app, url_prefix='/knowledge')

    return app


def before_request():
    """ Called before every request. """
    g.bundle = OrderedDict()
    g.bundle['chat_url'] = url_for('chat.chat')
    g.bundle['fetch_item_url'] = url_for('ItemType.get')
    g.bundle['save_item_url'] = url_for('ItemType.post')
    g.bundle['fetch_knowledge_url'] = url_for('knowledge.get')
    g.bundle['save_knowledge_url'] = url_for('knowledge.post')

    g.scripts = []
    g.stylesheets = []

    require_scripts('lib/jquery', 'dice_roller')
    require_styles('style')


def after_request(response):
    """ Called after every request. """
    db.session.commit()
    return response


def context_processor():
    """ Defines things sent to the template context. """
    d = {
        'list_abilities': list_abilities,
        'list_skills': list_skills,
        'list_races': list_races,
        'list_classes': list_classes,
        'list_items': list_items,
        'list_knowledge': list_knowledge,
        'list_alignments': list_alignments,
        'bundle': g.bundle,
        'scripts': g.scripts,
        'stylesheets': g.stylesheets
    }
    return d


if __name__ == '__main__':
    # Run the development server.
    create_app(True).run(threaded=True, host='0.0.0.0')