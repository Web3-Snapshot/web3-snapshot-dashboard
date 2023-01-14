from flask import Blueprint

bp = Blueprint("hello", __name__, url_prefix='/hello')


@bp.route("", methods=["GET"])
def greeting():
    return {"message": 'Hello from Flask & Docker'}, 200