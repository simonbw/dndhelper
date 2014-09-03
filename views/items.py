from flask import Blueprint, request

from models import db
from models.inventory import ItemType
from util import json_service


items_app = Blueprint('ItemType', __name__)


@items_app.route('/', methods=['GET'])
@json_service
def get():
    return [ItemType.query.get(item_type_id) for item_type_id in request.args.getlist('ids[]')]


@items_app.route('/', methods=['POST'])
@json_service
def post():
    data = request.get_json()
    if data['id'] == 'new':
        item_type = ItemType()
        db.session.add(item_type)
        db.session.commit()
    else:
        item_type = ItemType.query.get(data['id'])
    for attribute in data:
        if attribute == 'id':
            continue
        if hasattr(item_type, attribute):
            setattr(item_type, attribute, data[attribute])
    return item_type