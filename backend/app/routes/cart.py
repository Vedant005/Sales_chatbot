# app/routes/cart.py

from flask import Blueprint, request, jsonify
from app import db
from app.models.product import Product # Needed to check if product exists
from app.models.cart import Cart, CartItem # New models
from flask_jwt_extended import jwt_required, get_jwt_identity

cart_bp = Blueprint('cart', __name__)

def _get_or_create_user_cart(user_id):
    """Helper function to get a user's cart or create one if it doesn't exist."""
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.session.add(cart)
        db.session.commit()
    return cart

@cart_bp.route('/cart/add', methods=['POST'])
@jwt_required()
def add_to_cart():
    """
    Adds a product to the user's cart or updates its quantity if already present.
    Requires 'product_id' and 'quantity' in the JSON body.
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1) # Default to 1 if quantity not provided

    if not product_id or not isinstance(quantity, int) or quantity <= 0:
        return jsonify({"message": "Invalid product ID or quantity."}), 400

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"message": "Product not found."}), 404

    cart = _get_or_create_user_cart(user_id)

    # Check if item already exists in cart
    cart_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()

    if cart_item:
        cart_item.quantity += quantity
    else:
        cart_item = CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity)
        db.session.add(cart_item)

    db.session.commit()
    return jsonify({"message": f"Added {quantity} x {product.name} to cart.", "cart_item": cart_item.to_dict()}), 200

@cart_bp.route('/cart', methods=['GET'])
@jwt_required()
def view_cart():
    """
    Retrieves the current user's shopping cart contents.
    """
    user_id = get_jwt_identity()
    cart = Cart.query.filter_by(user_id=user_id).first()

    if not cart or not cart.items.first():
        return jsonify({"message": "Your cart is empty."}), 200 # 200 OK with empty cart message

    cart_items = [item.to_dict() for item in cart.items.all()]

    # Calculate total price
    total_price = sum(item.product.discounted_price * item.quantity for item in cart.items.all())

    return jsonify({
        "message": "Your cart contents:",
        "items": cart_items,
        "total_price": round(total_price, 2) # Round to 2 decimal places
    }), 200

@cart_bp.route('/cart/update/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_cart_item(item_id):
    """
    Updates the quantity of a specific item in the user's cart.
    Requires 'quantity' in the JSON body. If quantity is 0, the item is removed.
    """
    user_id = get_jwt_identity()
    cart = _get_or_create_user_cart(user_id)
    data = request.get_json()
    new_quantity = data.get('quantity')

    if not isinstance(new_quantity, int) or new_quantity < 0:
        return jsonify({"message": "Invalid quantity provided. Must be a non-negative integer."}), 400

    cart_item = CartItem.query.filter_by(id=item_id, cart_id=cart.id).first()
    if not cart_item:
        return jsonify({"message": "Cart item not found or does not belong to your cart."}), 404

    if new_quantity == 0:
        db.session.delete(cart_item)
        db.session.commit()
        return jsonify({"message": f"Item '{cart_item.product.name}' removed from cart."}), 200
    else:
        cart_item.quantity = new_quantity
        db.session.commit()
        return jsonify({"message": f"Quantity for '{cart_item.product.name}' updated to {new_quantity}.", "cart_item": cart_item.to_dict()}), 200

@cart_bp.route('/cart/remove/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(item_id):
    """
    Removes a specific item from the user's cart.
    """
    user_id = get_jwt_identity()
    cart = _get_or_create_user_cart(user_id)

    cart_item = CartItem.query.filter_by(id=item_id, cart_id=cart.id).first()
    if not cart_item:
        return jsonify({"message": "Cart item not found or does not belong to your cart."}), 404

    db.session.delete(cart_item)
    db.session.commit()
    return jsonify({"message": f"Item '{cart_item.product.name}' removed from cart."}), 200

@cart_bp.route('/cart/clear', methods=['DELETE'])
@jwt_required()
def clear_cart():
    """
    Clears all items from the user's cart.
    """
    user_id = get_jwt_identity()
    cart = Cart.query.filter_by(user_id=user_id).first()

    if not cart:
        return jsonify({"message": "Your cart is already empty."}), 200

    # Delete all items associated with this cart
    for item in cart.items.all():
        db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Your cart has been cleared."}), 200

# Optional: Checkout Route (Placeholder)
@cart_bp.route('/checkout', methods=['POST'])
@jwt_required()
def checkout():
    """
    Simulates a checkout process.
    In a real application, this would involve payment processing, order creation,
    inventory updates, etc., and then clearing the cart.
    """
    user_id = get_jwt_identity()
    cart = Cart.query.filter_by(user_id=user_id).first()

    if not cart or not cart.items.first():
        return jsonify({"message": "Your cart is empty. Nothing to checkout."}), 400

    # For demonstration, just clear the cart and return a success message
    # In a real app, this is where you'd integrate with payment gateways,
    # create an order record, send confirmation emails, etc.

    total_items = sum(item.quantity for item in cart.items.all())
    total_price = sum(item.product.discounted_price * item.quantity for item in cart.items.all())

    # Clear the cart after "checkout"
    for item in cart.items.all():
        db.session.delete(item)
    db.session.commit()

    return jsonify({
        "message": "Checkout successful! Your order has been placed. (Simulated)",
        "total_items": total_items,
        "total_price": round(total_price, 2)
    }), 200
