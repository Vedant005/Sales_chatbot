# app/routes/product.py

from flask import Blueprint, request, jsonify
from app import db
from app.models.product import Product
from flask_jwt_extended import jwt_required # To protect product routes if needed

product_bp = Blueprint('product', __name__)

@product_bp.route('/', methods=['GET'])
# @jwt_required() # Uncomment if product listing should be protected
def fetch_products():
    """
    Fetches a list of products with optional search, filtering, and pagination.
    Query parameters:
    - name: search term for product name
    - category: filter by category
    - page: current page number (1-indexed)
    - per_page: number of items per page
    """
    query_name = request.args.get('name')
    query_category = request.args.get('category')

    # Pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int) # Default to 12 products per page

    products_query = Product.query

    if query_name:
        products_query = products_query.filter(Product.name.ilike(f'%{query_name}%'))

    if query_category:
        products_query = products_query.filter(Product.category.ilike(f'%{query_category}%'))

    # Get total count BEFORE applying pagination limits
    total_products = products_query.count()

    # Apply pagination
    # Calculate offset: (page - 1) * per_page
    products_query = products_query.offset((page - 1) * per_page).limit(per_page)

    all_products = products_query.all()

    if not all_products and total_products == 0:
        return jsonify({
            "message": "No products found matching your criteria.",
            "products": [],
            "total_products": 0,
            "page": page,
            "per_page": per_page
        }), 200 # Changed to 200 OK as it's a valid empty result

    return jsonify({
        "products": [product.to_dict() for product in all_products],
        "total_products": total_products,
        "page": page,
        "per_page": per_page
    }), 200

@product_bp.route('/<int:id>', methods=['GET'])
# @jwt_required() # Uncomment if single product view should be protected
def fetch_single_product(id):
    """
    Fetches a single product by its ID.
    """
    product = Product.query.get(id)

    if not product:
        return jsonify({"message": "Product not found"}), 404

    return jsonify(product.to_dict()), 200
