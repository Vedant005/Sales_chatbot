from app import db  # ✅ Import db from app package

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(500))
    category = db.Column(db.String(255))
    description = db.Column(db.Text)
    price = db.Column(db.Float)
    original_price = db.Column(db.Float)
    discount_percentage = db.Column(db.Float)
    rating = db.Column(db.Float)
    rating_count = db.Column(db.Integer)
    image_url = db.Column(db.Text)
    product_url = db.Column(db.Text)

    def to_dict(self):
        return {col.name: getattr(self, col.name) for col in self.__table__.columns}
