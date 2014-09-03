from flask import Blueprint, request

from models import db
from models.knowledge import Knowledge
from util import json_service


knowledge_app = Blueprint('knowledge', __name__)


@knowledge_app.route('/', methods=['GET'])
@json_service
def get():
    return [Knowledge.query.get(knowledge_id) for knowledge_id in (request.args.getlist('ids[]'))]


@knowledge_app.route('/', methods=['POST'])
@json_service
def post():
    data = request.get_json()
    if data['id'] == 'new':
        knowledge = Knowledge()
        db.session.add(knowledge)
        db.session.commit()
    else:
        knowledge = Knowledge.query.get(data['id'])
    for attribute in data:
        if attribute == 'id':
            continue
        if hasattr(knowledge, attribute):
            setattr(knowledge, attribute, data[attribute])
    return knowledge