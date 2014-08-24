"""
Create the app and run the server
"""
from collections import OrderedDict
import os

from flask import Flask, g, url_for

from models import db
from models.abilities import list_abilities
from models.classes import list_classes
from models.races import list_races
from models.skills import list_skills
from util import Jsonifier
from views.admin import admin_app, init_all
from views.campaign import campaign_app
from views.character import character_app
from views.chat import chat_app
from views.dm import dm_app


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

    return app


def before_request():
    """ Called before every request. """
    g.bundle = OrderedDict()
    g.bundle['chat_url'] = url_for('chat.chat')

    g.scripts = ['lib/jquery', 'lib/jquery.autocomplete', 'dice_roller']
    g.stylesheets = ['style', 'chat']


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
        'bundle': g.bundle,
        'scripts': g.scripts,
        'stylesheets': g.stylesheets
    }
    return d


if __name__ == '__main__':
    # Run the development server.
    create_app(True).run(threaded=True)