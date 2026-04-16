from datetime import datetime, timezone

from bson import ObjectId
from flask import Blueprint, jsonify, request
from pymongo import ReturnDocument

from database import db
from models.product import serialize_product, validate_product

product_bp = Blueprint("products", __name__, url_prefix="/api/products")


@product_bp.route("/", methods=["GET"])
def get_products():
    try:
        products = list(db.products.find())
        return jsonify([serialize_product(p) for p in products]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@product_bp.route("/<id>", methods=["GET"])
def get_product(id):
    try:
        product = db.products.find_one({"_id": ObjectId(id)})
        if not product:
            return jsonify({"error": "Product not found"}), 404
        return jsonify(serialize_product(product)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@product_bp.route("/", methods=["POST"])
def create_product():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400

        errors = validate_product(data)
        if errors:
            return jsonify({"errors": errors}), 400

        product = {
            "name": data["name"],
            "description": data.get("description", ""),
            "price": float(data["price"]),
            "category": data.get("category", ""),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        result = db.products.insert_one(product)
        product["_id"] = result.inserted_id

        return jsonify(serialize_product(product)), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@product_bp.route("/<id>", methods=["PUT"])
def update_product(id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400

        update_fields = {}
        if "name" in data:
            update_fields["name"] = data["name"]
        if "description" in data:
            update_fields["description"] = data["description"]
        if "price" in data:
            try:
                price = float(data["price"])
                if price <= 0:
                    return jsonify({"error": "Price must be a positive number"}), 400
                update_fields["price"] = price
            except (TypeError, ValueError):
                return jsonify({"error": "Price must be a valid number"}), 400
        if "category" in data:
            update_fields["category"] = data["category"]

        if not update_fields:
            return jsonify({"error": "No valid fields to update"}), 400

        result = db.products.find_one_and_update(
            {"_id": ObjectId(id)},
            {"$set": update_fields},
            return_document=ReturnDocument.AFTER,
        )

        if not result:
            return jsonify({"error": "Product not found"}), 404

        return jsonify(serialize_product(result)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@product_bp.route("/<id>", methods=["DELETE"])
def delete_product(id):
    try:
        result = db.products.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Product not found"}), 404
        return jsonify({"message": "Product deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
