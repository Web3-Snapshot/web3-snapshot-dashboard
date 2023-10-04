from flask import Blueprint, current_app, g
from server.db import get_db
from util.helpers import compute_extra_columns, process_percentages

bp = Blueprint("tracking", __name__)


@bp.route("/tracking/timestamp", methods=["GET"])
def get_tracking():
    conn = get_db(current_app)
    cur = conn.cursor()

    cur.execute("""SELECT updated_at FROM tracking LIMIT 1""")
    item = cur.fetchone()

    if item is None:
        return {"error": "No tracking data found"}, 404

    return item, 200
