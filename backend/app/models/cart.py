# app/models/cart.py

from app import db
from datetime import datetime

class Cart(db.Model):
    """
    Represents a user's shopping cart.
    Each user has one cart.
    """
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship to User: A cart belongs to one user
    user = db.relationship('User', backref=db.backref('cart', uselist=False), lazy=True)
    # Relationship to CartItem: A cart can have many items
    items = db.relationship('CartItem', backref='cart', lazy='dynamic', cascade="all, delete-orphan")

    def to_dict(self):
        """Converts the cart object to a dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() + 'Z',
            'updated_at': self.updated_at.isoformat() + 'Z',
            'items': [item.to_dict() for item in self.items.all()] # Include cart items
        }

    def __repr__(self):
        return f'<Cart {self.id} for User {self.user_id}>'

class CartItem(db.Model):
    """
    Represents a single product item within a shopping cart.
    """
    id = db.Column(db.Integer, primary_key=True)
    cart_id = db.Column(db.Integer, db.ForeignKey('cart.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1, nullable=False)
    added_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

   
    product = db.relationship('Product', lazy=True) # Eager load product details when retrieving cart items

    def to_dict(self):
        """Converts the cart item object to a dictionary, including product details."""
        product_data = self.product.to_dict() if self.product else None
        return {
            'id': self.id,
            'cart_id': self.cart_id,
            'product_id': self.product_id,
            'quantity': self.quantity,
            'added_at': self.added_at.isoformat() + 'Z',
            'product': { # Include essential product details here
                'id': product_data.get('id'),
                'name': product_data.get('name'),
                'image_url': product_data.get('image_url'),
                'discounted_price': product_data.get('discounted_price')
            } if product_data else None
        }

    def __repr__(self):
        return f'<CartItem {self.id} (Product {self.product_id}) for Cart {self.cart_id} Qty: {self.quantity}>'

