def serialize_product(product):
    """Convert a MongoDB product document to a JSON-safe dict."""
    if product is None:
        return None
    return {
        "id": str(product["_id"]),
        "name": product.get("name"),
        "description": product.get("description", ""),
        "price": product.get("price"),
        "category": product.get("category", ""),
        "created_at": product.get("created_at"),
    }


def validate_product(data):
    """Validate product data. Returns a list of error strings."""
    errors = []

    if not data.get("name"):
        errors.append("Name is required")

    if "price" not in data or data["price"] is None:
        errors.append("Price is required")
    else:
        try:
            price = float(data["price"])
            if price <= 0:
                errors.append("Price must be a positive number")
        except (TypeError, ValueError):
            errors.append("Price must be a valid number")

    return errors
