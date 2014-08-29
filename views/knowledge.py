from flask import Blueprint, request

from models import db

from models.knowledge import Knowledge
from util import json_service


knowledge_app = Blueprint('knowledge', __name__)


@knowledge_app.route('/', methods=['GET'])
@json_service
def get():
    return [Knowledge.query.get(knowledge_id) for knowledge_id in request.args.getlist('ids[]')]


@knowledge_app.route('/<knowledge_id>')
def view(knowledge_id):
    knowledge = Knowledge.query.get(knowledge_id)
    return '<h1>' + knowledge.name + '</h1>' + '<p>' + knowledge.content + '</p>'


@knowledge_app.route('/', methods=['POST'])
@json_service
def post():
    return {}


@knowledge_app.route('/new', methods=['POST'])
@json_service
def create():
    knowledge = Knowledge()
    db.session.add(knowledge)
    db.session.commit()
    return knowledge
