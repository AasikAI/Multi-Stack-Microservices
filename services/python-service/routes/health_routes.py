from datetime import datetime, timezone

from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__, url_prefix="/health")


@health_bp.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok",
        "service": "python-product-service",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }), 200
