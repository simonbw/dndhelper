from flask import Blueprint, request

from models import db
from models.inventory import ItemType
from util import json_service


items_app = Blueprint('items', __name__)


@items_app.route('/', methods=['GET'])
@json_service
def get():
    return [ItemType.query.get(item_type_id) for item_type_id in request.args.getlist('ids[]')]


@items_app.route('/', methods=['POST'])
@json_service
def create():
    item_type = ItemType()
    if 'name' in request.form:
        item_type.name = request.form['name']
    if 'description' in request.form:
        item_type.name = request.form['name']
    db.session.add(item_type)
    db.session.commit()
    return item_type