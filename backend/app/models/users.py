
from app import db 
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False) 
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
 

    def set_password(self, password):
      
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        
        return check_password_hash(self.password_hash, password)

    def to_dict(self, include_email=False):
        """
        Converts the User object to a dictionary for serialization.
        Exclude sensitive information like password hash.
        """
        data = {
            'id': self.id,
            'username': self.username,
            'created_at': self.created_at.isoformat() + 'Z', 
            'updated_at': self.updated_at.isoformat() + 'Z'
        }
        if include_email:
            data['email'] = self.email
        return data

    def __repr__(self):
        return f'<User {self.username}>'