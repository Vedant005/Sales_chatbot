# app/routes/product.py

from flask import Blueprint, request, jsonify
from app import db
from app.models.product import Product # Assuming your Product model is in app/models/product.py
from flask_jwt_extended import jwt_required # To protect product routes if needed

product_bp = Blueprint('product', __name__)

@product_bp.route('/', methods=['GET'])
# You might want to protect this route with @jwt_required() if product listing
# is only for authenticated users, otherwise leave it open.
# @jwt_required()
def fetch_products():
    """
    Fetches a list of products.
    Supports optional search by 'name' and filtering by 'category'.
    Example: /products?name=laptop&category=electronics
    """
    query_name = request.args.get('name')
    query_category = request.args.get('category')
    query_limit = request.args.get('limit', type=int) # Optional limit for results
    query_offset = request.args.get('offset', type=int) # Optional offset for pagination

    products = Product.query

    if query_name:
        # Case-insensitive search for product name
        products = products.filter(Product.name.ilike(f'%{query_name}%'))

    if query_category:
        # Case-insensitive search for category
        products = products.filter(Product.category.ilike(f'%{query_category}%'))

    # Apply offset and limit for pagination if provided
    if query_offset:
        products = products.offset(query_offset)
    if query_limit:
        products = products.limit(query_limit)

    all_products = products.all()

    if not all_products:
        return jsonify({"message": "No products found matching your criteria."}), 404

    return jsonify([product.to_dict() for product in all_products]), 200

@product_bp.route('/<int:id>', methods=['GET'])
# You might want to protect this route with @jwt_required() if single product view
# is only for authenticated users, otherwise leave it open.
# @jwt_required()
def fetch_single_product(id):
    """
    Fetches a single product by its ID.
    Example: /products/123
    """
    product = Product.query.get(id)

    if not product:
        return jsonify({"message": "Product not found"}), 404

    return jsonify(product.to_dict()), 200