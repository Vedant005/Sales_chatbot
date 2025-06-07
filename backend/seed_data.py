import pandas as pd
from app import create_app, db
from app.models.product import Product  
import os

app = create_app()

def load_data():
    csv_path = "cleaned_amazon_products.csv"  #
    if not os.path.exists(csv_path):
        print("CSV file not found.")
        return

    df = pd.read_csv(csv_path)

    with app.app_context():
        db.drop_all()     
        db.create_all()   

        for _, row in df.iterrows():
            product = Product(
                name=row["name"],
                category=row["category"],
                description=row["description"],
                price=row["discounted_price"],
                original_price=row["actual_price"],
                discount_percentage=row["discount_percentage"],
                rating=row["rating"],
                rating_count=row["rating_count"],
                image_url=row["image_url"],
                product_url=row["product_url"]
            )
            db.session.add(product)
        db.session.commit()
        print(f"Inserted {len(df)} products.")

if __name__ == "__main__":
    load_data()
