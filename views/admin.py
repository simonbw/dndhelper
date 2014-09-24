import os

from flask import current_app, render_template, redirect, url_for, jsonify
from flask.blueprints import Blueprint
from flask.json import loads

from descriptions import init_descriptions
from models import db
from models.abilities import init_abilities, list_abilities, Ability
from models.alignments import init_alignments, list_alignments, Alignment
from models.characters import init_characters
from models.classes import init_classes, list_classes, CharacterClass
from models.inventory import init_items, list_items, ItemType
from models.knowledge import init_knowledge
from models.races import init_races, list_races, Race
from models.skills import init_skills, list_skills, Skill
from views.character import init_handlers


admin_app = Blueprint('admin', __name__)

DATA_PATH = os.path.join(os.path.dirname(__file__), 'data.json')


@admin_app.route('/')
def index():
    return render_template('admin/index.html')


@admin_app.route('/reset/')
def reset():
    with current_app.app_context():
        db.drop_all()
        init_all()
    return redirect(url_for('admin.index'))


@admin_app.route('/dump/')
def dump():
    with current_app.app_context():
        return dump_all()


@admin_app.route('/reload/')
def reload_db():
    with current_app.app_context():
        reload_all()
    return redirect(url_for('admin.index'))


def init_all():
    db.drop_all()
    db.create_all()
    init_descriptions(current_app.file_root)
    init_abilities()
    init_races()
    init_skills()
    init_classes()
    init_characters()
    init_handlers()
    init_items()
    init_knowledge()
    init_alignments()


def dump_all():
    """Dump all the database stuff to JSON files"""
    data = {
        'abilities': list_abilities(),
        'skills': list_skills(),
        'alignments': list_alignments(),
        'item_types': list_items(),
        'races': list_races(),
        'classes': list_classes(),
    }

    with open(DATA_PATH, mode='w') as f:
        encoded_data = jsonify(data)
        f.write(encoded_data.get_data())
    return encoded_data


def reload_all():
    db.drop_all()
    db.create_all()

    with open(DATA_PATH) as f:
        data = loads(f.read())

    ability_map = {}
    for ability_data in data['abilities']:
        ability = Ability(ability_data['name'], ability_data['abbreviation'], ability_data['description'])
        ability_map[ability_data['id']] = ability
        db.session.add(ability)

    skill_map = {}
    for skill_data in data['skills']:
        ability = ability_map[skill_data['ability_id']]
        skill = Skill(skill_data['name'], ability, skill_data['description'])
        skill_map[skill_data['id']] = skill
        db.session.add(skill)

    alignment_map = {}
    for alignment_data in data['alignments']:
        alignment = Alignment(alignment_data['name'], alignment_data['description'])
        alignment_map[alignment_data['id']] = alignment
        db.session.add(alignment)

    race_map = {}
    for race_data in data['races']:
        race = Race(race_data['name'], race_data['description'])
        race_map[race_data['id']] = race
        db.session.add(race)

    class_map = {}
    for class_data in data['classes']:
        character_class = CharacterClass(class_data['name'], class_data['description'])
        class_map[class_data['id']] = character_class
        db.session.add(character_class)

    item_type_map = {}
    for item_type_data in data['item_types']:
        item_type_id = item_type_data['id']
        del item_type_data['id']
        item_type = ItemType(**item_type_data)
        item_type_map[item_type_id] = item_type
        db.session.add(item_type)

    db.session.commit()
    print data
    return data
