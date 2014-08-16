"""
Create the app and run the server
"""
from flask import Flask

from models import db
from models.abilities import list_abilities
from models.races import list_races
from models.skills import list_skills
from util import Jsonifier
from views.admin import admin_app, init_all
from views.campaign import campaign_app
from views.character import character_app
from views.dm import dm_app


def create_app(debug=False):
    app = Flask(__name__)
    app.debug = debug
    app.secret_key = 'this is a secret'
    app.json_encoder = Jsonifier

    app.before_request(before_request)
    app.after_request(after_request)
    app.context_processor(context_processor)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'

    db.init_app(app)
    with app.app_context():
        init_all()
    app.register_blueprint(admin_app, url_prefix="/admin")
    app.register_blueprint(campaign_app)
    app.register_blueprint(character_app, url_prefix="/character")
    app.register_blueprint(dm_app, url_prefix="/dm")

    return app


def before_request():
    pass


def after_request(response):
    db.session.commit()
    return response


def context_processor():
    d = {
        'list_abilities': list_abilities,
        'list_skills': list_skills,
        'list_races': list_races
    }
    return d


if __name__ == '__main__':
    create_app(True).run(threaded=True)