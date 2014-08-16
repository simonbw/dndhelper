from flask import render_template
from flask.blueprints import Blueprint

from models.campaign import get_main_campaign


campaign_app = Blueprint('campaign', __name__)


@campaign_app.route('/')
def view():
    campaign = get_main_campaign()
    return render_template("campaign_index.html", campaign=campaign)
