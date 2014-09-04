from flask import current_app, render_template, redirect
from flask.blueprints import Blueprint

from descriptions import init_descriptions
from models import db
from models.abilities import init_abilities
from models.alignments import init_alignments
from models.characters import init_characters
from models.classes import init_classes
from models.inventory import init_items
from models.knowledge import init_knowledge
from models.races import init_races
from models.skills import init_skills
from views.character import init_handlers


admin_app = Blueprint('admin', __name__)


@admin_app.route('/')
def index():
    return render_template('admin/index.html')


@admin_app.route('/reset/')
def reset():
    with current_app.app_context():
        db.drop_all()
        init_all()
    return redirect('/')


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
