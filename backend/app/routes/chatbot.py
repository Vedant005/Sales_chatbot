# app/routes/chatbot.py

from flask import Blueprint, request, jsonify, current_app 
from app import db
from app.models.product import Product
from app.models.cart import Cart, CartItem 
from flask_jwt_extended import jwt_required, get_jwt_identity
import re 

chatbot_bp = Blueprint('chatbot', __name__)

def _get_or_create_user_cart(user_id):
    """Helper function to get a user's cart or create one if it doesn't exist."""
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.session.add(cart)
        db.session.commit()
    return cart

def _extract_search_params(user_message):
    """Extracts keywords, categories, brands, and price ranges from a message."""
    params = {
        "keywords": [],
        "category": None,
        "brand": None, 
        "min_price": None,
        "max_price": None
    }

    # Extract keywords 
    clean_message = user_message.lower()
    clean_message = re.sub(r'(search for|find|look for|show me|what is|products|in category|by brand|under|over|between|and)', '', clean_message)
    params["keywords"] = [word for word in clean_message.split() if word]

    # Extract category
    category_match = re.search(r'in category\s*(.+)', user_message)
    if category_match:
        params["category"] = category_match.group(1).strip()
        # Remove category from keywords list if it was mistakenly included
        params["keywords"] = [k for k in params["keywords"] if k.lower() not in params["category"].lower().split()]

    # Extract brand (searching for brand name within product name/description)
    brand_match = re.search(r'by brand\s*(.+)', user_message)
    if brand_match:
        params["brand"] = brand_match.group(1).strip()
     
        params["keywords"] = [k for k in params["keywords"] if k.lower() not in params["brand"].lower().split()]

    # Extract price range
    under_price_match = re.search(r'under\s*(\d+)', user_message)
    if under_price_match:
        params["max_price"] = float(under_price_match.group(1))
    over_price_match = re.search(r'over\s*(\d+)', user_message)
    if over_price_match:
        params["min_price"] = float(over_price_match.group(1))
    between_price_match = re.search(r'between\s*(\d+)\s*and\s*(\d+)', user_message)
    if between_price_match:
        params["min_price"] = float(between_price_match.group(1))
        params["max_price"] = float(between_price_match.group(2))

    return params

def _perform_product_search(search_params):
    """Constructs and executes SQLAlchemy query based on search parameters."""
    products = Product.query

    if search_params["keywords"]:
        for keyword in search_params["keywords"]:
           
            products = products.filter(
                (Product.name.ilike(f'%{keyword}%')) |
                (Product.description.ilike(f'%{keyword}%'))
            )

    if search_params["category"]:
        products = products.filter(Product.category.ilike(f'%{search_params["category"]}%'))

    if search_params["brand"]:
        # Since Product model doesn't have a direct 'brand' column, search in name or description
        brand_keyword = search_params["brand"]
        products = products.filter(
            (Product.name.ilike(f'%{brand_keyword}%')) |
            (Product.description.ilike(f'%{brand_keyword}%'))
        )

    if search_params["min_price"] is not None:
        products = products.filter(Product.discounted_price >= search_params["min_price"])

    if search_params["max_price"] is not None:
        products = products.filter(Product.discounted_price <= search_params["max_price"])

    # Basic sorting (can be extended based on user query)
    products = products.order_by(Product.name.asc()) # Default sort

    return products.limit(20).all()

def _get_product_details_response(product, full_details=False):
    """Formats a response for a single product."""
    if not product:
        return "I couldn't find details for that product."

    # Safely access attributes, handling potential missing ones
    name = getattr(product, 'name', 'N/A')
    category = getattr(product, 'category', 'N/A')
    description = getattr(product, 'description', 'N/A')
    discounted_price = getattr(product, 'discounted_price', 'N/A')
    actual_price = getattr(product, 'actual_price', 'N/A')
    rating = getattr(product, 'rating', 'N/A')
    rating_count = getattr(product, 'rating_count', 'N/A')
    product_url = getattr(product, 'product_url', 'N/A')

    
    brand_from_name = name.split(' ')[0] if name and ' ' in name else 'N/A'
    
    # Format description, rating, and link only if they exist
    description_info = f"Description: {description}\n" if description != 'N/A' else ""
    rating_info = f"Rating: {rating} out of 5 ({int(rating_count)} ratings)\n" if rating != 'N/A' and rating_count != 'N/A' else ""
    product_url_info = f"Link: {product_url}\n" if product_url != 'N/A' else ""

    if full_details:
        return (
            f"Here are the details for {name} (Brand: {brand_from_name}):\n"
            f"Category: {category}\n"
            f"{description_info}"
            f"Price: ₹{discounted_price} (Original: ₹{actual_price})\n"
            f"{rating_info}"
            f"{product_url_info}"
        )
    else:
        return (
            f"Found {name} (Brand: {brand_from_name}). It's in the {category} category, "
            f"priced at ₹{discounted_price} with an average rating of {rating}."
        )


#  Main Chatbot Converse Route 

@chatbot_bp.route('/converse', methods=['POST'])
@jwt_required()
def converse():
    data = request.get_json()
    user_message = data.get('message', '').lower().strip()
    current_user_id = get_jwt_identity()

    # Initialize user session for conversational context (e.g., last shown products)
    # Access using current_app to ensure it's bound to the correct app context
    if not hasattr(current_app, 'chatbot_sessions'):
        current_app.chatbot_sessions = {}
        
    if current_user_id not in current_app.chatbot_sessions:
        current_app.chatbot_sessions[current_user_id] = {
            "last_products_shown": [],
            "last_intent": None
        }

    session_data = current_app.chatbot_sessions[current_user_id]
    response_message = "I'm not sure how to help with that. Can you rephrase or ask about a product?"
    products_to_send = [] 

    # 1. Basic Greetings & Utilities
    if "hello" in user_message or "hi" in user_message:
        response_message = "Hello! I'm your sales chatbot. How can I assist you with finding products today?"
        session_data["last_intent"] = "greeting"
    elif "thank you" in user_message or "thanks" in user_message:
        response_message = "You're welcome! Let me know if you need anything else."
        session_data["last_intent"] = "gratitude"
    elif "reset" in user_message or "start over" in user_message:
        current_app.chatbot_sessions[current_user_id] = {"last_products_shown": [], "last_intent": None} # Clear session data
        response_message = "Conversation reset. How can I assist you now?"
        products_to_send = [] # Clear frontend display

    # 2. Cart Management Intents
    elif any(phrase in user_message for phrase in ["add to cart", "buy this", "purchase this"]):
        product_identifier = user_message.replace("add to cart", "").replace("buy this", "").replace("purchase this", "").strip()
        product_to_add = None
        quantity = 1 

        num_match = re.search(r'the (\d+)(st|nd|rd|th) one', product_identifier)
        if num_match and session_data["last_products_shown"]:
            index = int(num_match.group(1)) - 1
            if 0 <= index < len(session_data["last_products_shown"]):
                product_to_add = session_data["last_products_shown"][index]
        elif product_identifier:
            # Try to find by name from DB
            product_to_add = Product.query.filter(Product.name.ilike(f'%{product_identifier}%')).first()

        if product_to_add:
            try:
                cart = _get_or_create_user_cart(current_user_id)
                cart_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_to_add.id).first()

                if cart_item:
                    cart_item.quantity += quantity
                    db.session.commit()
                    response_message = f"Updated quantity for '{product_to_add.name}' to {cart_item.quantity} in your cart!"
                else:
                    new_cart_item = CartItem(cart_id=cart.id, product_id=product_to_add.id, quantity=quantity)
                    db.session.add(new_cart_item)
                    db.session.commit()
                    response_message = f"Added '{product_to_add.name}' to your cart!"

                products_to_send = [product_to_add.to_dict()] # Show the added product
                session_data["last_intent"] = "add_to_cart"
            except Exception as e:
                db.session.rollback() # Rollback in case of error
                response_message = f"Sorry, I couldn't add that to your cart right now. Please try again. Error: {e}"
        else:
            response_message = "I couldn't identify which product to add to cart. Can you specify by name or number from my last search?"

    elif "view cart" in user_message or "show my cart" in user_message or "what's in my cart" in user_message:
        cart = Cart.query.filter_by(user_id=current_user_id).first()
        if not cart or not cart.items.first():
            response_message = "Your cart is empty."
        else:
            cart_items = cart.items.all()
            cart_summary = "Here's what's in your cart:\n"
            total_price = 0
            for i, item in enumerate(cart_items):
                product = item.product # Access the related product object
                cart_summary += f"{i+1}. {product.name} (Qty: {item.quantity}) - ₹{product.discounted_price * item.quantity}\n"
                total_price += product.discounted_price * item.quantity
                products_to_send.append(product.to_dict()) # Add product to display

            cart_summary += f"Total: ₹{round(total_price, 2)}"
            response_message = cart_summary
        session_data["last_intent"] = "view_cart"

    elif "remove from cart" in user_message or "delete from cart" in user_message:
        product_identifier = user_message.replace("remove from cart", "").replace("delete from cart", "").strip()
        cart_item_to_remove = None

        cart = _get_or_create_user_cart(current_user_id)
        if not cart.items.first():
            response_message = "Your cart is already empty."
        else:
            #
            num_match = re.search(r'the (\d+)(st|nd|rd|th) one', product_identifier)
            if num_match and session_data["last_products_shown"]:
                index = int(num_match.group(1)) - 1
                if 0 <= index < len(session_data["last_products_shown"]):
                    product_from_last_search = session_data["last_products_shown"][index]
                    cart_item_to_remove = CartItem.query.filter_by(
                        cart_id=cart.id, product_id=product_from_last_search.id
                    ).first()
            elif product_identifier:
                # Try to find by name directly in the cart
                for item in cart.items.all():
                    if item.product and product_identifier in item.product.name.lower():
                        cart_item_to_remove = item
                        break

            if cart_item_to_remove:
                product_name = cart_item_to_remove.product.name if cart_item_to_remove.product else "an item"
                db.session.delete(cart_item_to_remove)
                db.session.commit()
                response_message = f"Removed '{product_name}' from your cart."
                session_data["last_intent"] = "remove_from_cart"
            else:
                response_message = "I couldn't find that item in your cart. Please specify which item to remove."

    elif "clear cart" in user_message or "empty my cart" in user_message:
        cart = _get_or_create_user_cart(current_user_id)
        if not cart.items.first():
            response_message = "Your cart is already empty."
        else:
            for item in cart.items.all(): # Fetch all items to delete
                db.session.delete(item)
            db.session.commit()
            response_message = "Your cart has been cleared."
        session_data["last_intent"] = "clear_cart"

    elif "checkout" in user_message or "buy now" in user_message or "place order" in user_message:
        cart = _get_or_create_user_cart(current_user_id)
        if not cart or not cart.items.first():
            response_message = "Your cart is empty. Nothing to checkout."
        else:
            total_items = sum(item.quantity for item in cart.items.all())
            total_price = sum(item.product.discounted_price * item.quantity for item in cart.items.all())

       
            for item in cart.items.all():
                db.session.delete(item)
            db.session.commit()

            response_message = (
                f"Thank you for your order! Your purchase of {total_items} items "
                f"for a total of ₹{round(total_price, 2)} has been placed. (This is a simulated action)"
            )
            session_data["last_intent"] = "checkout"
            products_to_send = [] # Clear products after checkout


    # 3. Exploration Intents (Product Listing, Details)
    elif "list categories" in user_message or "show categories" in user_message:
        categories = db.session.query(Product.category).distinct().all()
        # Clean up categories which can be pipe-separated like "Category1|Subcategory2"
        all_unique_categories = set()
        for cat_tuple in categories:
            if cat_tuple[0]: # Ensure category string is not None or empty
                for c in cat_tuple[0].split('|'):
                    all_unique_categories.add(c.strip())

        category_list = sorted(list(all_unique_categories)) # Sort for better readability

        if category_list:
            response_message = "Available categories: " + ", ".join(category_list) + ".\nWhat product are you looking for within these?"
        else:
            response_message = "No categories found."
        session_data["last_intent"] = "list_categories"

    elif any(phrase in user_message for phrase in ["details about", "more about", "specs of", "tell me about"]):
        product_identifier = user_message.replace("details about", "").replace("more about", "").replace("specs of", "").replace("tell me about", "").strip()
        product = None

        num_match = re.search(r'the (\d+)(st|nd|rd|th) one', product_identifier)
        if num_match and session_data["last_products_shown"]:
            index = int(num_match.group(1)) - 1
            if 0 <= index < len(session_data["last_products_shown"]):
                product = session_data["last_products_shown"][index]
        elif product_identifier:
            product = Product.query.filter(Product.name.ilike(f'%{product_identifier}%')).first()

        if product:
            response_message = _get_product_details_response(product, full_details=True)
            products_to_send = [product.to_dict()]
            session_data["last_intent"] = "product_details"
        else:
            response_message = "I couldn't find specific details for that product. Can you be more precise or refer to a number from my last search?"

    # 4. Search Intent (Fallback if no other specific intent matches)
    elif any(keyword in user_message for keyword in ["search", "find", "look for", "show me"]):
        search_params = _extract_search_params(user_message)
        products_found = _perform_product_search(search_params)

        if products_found:
            response_message = "Here are some products I found:\n"
            for i, product in enumerate(products_found):
                response_message += f"{i+1}. {product.name} (₹{product.discounted_price})\n"
            products_to_send = [p.to_dict() for p in products_found]
            session_data["last_products_shown"] = products_found
            session_data["last_intent"] = "search"
        else:
            response_message = "I couldn't find any products matching your criteria. Try different keywords or filters."
            session_data["last_products_shown"] = []
            session_data["last_intent"] = "no_search_results"
    else:
        # Default response if no specific intent is recognized
        response_message = "I can help you search for products, view your cart, or get product details. Try asking 'Show me laptops' or 'What's in my cart?'."
        session_data["last_intent"] = "unrecognized"

    # Prepare the final response payload for the frontend
    response_payload = {
        "response": response_message,
        "products": products_to_send
    }

    return jsonify(response_payload), 200
