# app/routes/auth.py

from flask import Blueprint, request, jsonify, make_response, current_app
from app import db # Import your SQLAlchemy instance
from app.models.users import User # Import your User model
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required, # Now used for both access and refresh token protection
    get_jwt_identity,
    set_access_cookies,
    set_refresh_cookies,
    unset_jwt_cookies, # For logging out
    get_jwt # To get the unique ID (jti) of the token for blacklisting
)

auth_bp = Blueprint('auth', __name__)

# User registration logic remains the same
@auth_bp.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"message": "Missing username, email, or password"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"message": "Username already taken"}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already registered"}), 409

    new_user = User(username=username, email=email)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully", "user": new_user.to_dict()}), 201

# Login route modified to issue both access and refresh tokens
@auth_bp.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        # Create the tokens
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)

        # Prepare the response
        response_data = {
            "message": "Login successful",
            "user": user.to_dict(),
            "access_token": access_token # Send access token in body for client-side storage (e.g., localStorage)
        }
        response = jsonify(response_data)

        # Set refresh token (and optionally access token) in HttpOnly cookies for extra security
        set_access_cookies(response, access_token) # This sets an HttpOnly cookie for the access token
        set_refresh_cookies(response, refresh_token) # This sets an HttpOnly cookie for the refresh token

        return response, 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

# Refresh token route to get a new access token
@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True) # CHANGED: Use jwt_required with refresh=True
def refresh_access_token():
    # Access the identity of the current user with get_jwt_identity
    current_user_id = get_jwt_identity()

    # Create a new access token
    new_access_token = create_access_token(identity=current_user_id)

    # Set the new access token in a cookie and return it in the response body
    response_data = {"access_token": new_access_token}
    response = jsonify(response_data)
    set_access_cookies(response, new_access_token) # Update access token cookie

    return response, 200

# Logout route (access token based)
@auth_bp.route('/logout', methods=['POST'])
@jwt_required() # Requires a valid access token to perform logout
def logout_user():
    # Get the unique identifier of the access token being used
    jti = get_jwt()["jti"] # 'jti' is the JWT ID claim
    # Add the JTI to your blacklist.
    current_app.jwt_blacklist.add(jti) # Using app.jwt_blacklist set for demonstration

    response = jsonify({"message": "Successfully logged out (access token revoked)"})
    unset_jwt_cookies(response) # Clear both access and refresh cookies (if they were set by Flask-JWT-Extended)
    return response, 200

# Logout for refresh token (useful if refresh token is primarily stored in HttpOnly cookie)
@auth_bp.route('/logout_refresh', methods=['POST'])
@jwt_required(refresh=True) # CHANGED: Use jwt_required with refresh=True
def logout_refresh_token():
    jti = get_jwt()["jti"]
    current_app.jwt_blacklist.add(jti) # Blacklist the refresh token's jti

    response = jsonify({"message": "Refresh token successfully revoked"})
    unset_jwt_cookies(response)
    return response, 200

# A protected route that requires an access token
@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected_route():
    current_user_id = get_jwt_identity() # Get the user's identity from the token
    user = User.query.get(current_user_id) # Fetch user details if needed
    if user:
        return jsonify(
            message=f"Hello, {user.username}! You accessed a protected route.",
            user_id=current_user_id
        ), 200
    return jsonify({"message": "User not found."}), 404