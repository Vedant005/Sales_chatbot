// src/components/ProductCard.tsx
import React from "react";
import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  original_price: number;
  discount_percentage: number;
  rating: number | null;
  rating_count: number | null;
  image_url: string;
  product_url: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    addToCart,
    isLoading: isAddingToCart,
    error: cartError,
  } = useCartStore();

  const handleAddToCart = async () => {
    const success = await addToCart(product.id, 1);
    if (success) {
      alert(`Added "${product.name}" to cart!`);
    } else {
      alert(`Failed to add "${product.name}" to cart: ${cartError}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden transform transition-transform duration-300 hover:scale-105 border border-gray-100">
      {/* Product Image */}
      <Link to={`/products/${product.id}`} className="block relative">
        <img
          src={product?.image_url}
          alt={product.name}
          className="w-full h-48 object-contain p-4 bg-gray-50"
          onError={(e) => {
            e.currentTarget.src = `https://placehold.co/200x200/cccccc/333333?text=No+Image`;
          }}
        />
        {product.discount_percentage && product.discount_percentage > 0 && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {Math.round(product.discount_percentage)}% OFF
          </span>
        )}
      </Link>

      {/* Product Details */}
      <div className="p-4">
        <Link to={`/products/${product.id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-2 hover:text-blue-600 transition-colors duration-200 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mb-2 line-clamp-1">
          {product.category}
        </p>

        <div className="flex items-baseline mb-3">
          <span className="text-xl font-bold text-gray-900 mr-2">
            ₹{product.price}
          </span>
          {product.original_price > product.price && (
            <span className="text-sm text-gray-500 line-through">
              ₹{product.original_price}
            </span>
          )}
        </div>

        {/* Rating and Rating Count */}
        {product.rating !== null && product.rating_count !== null && (
          <div className="flex items-center text-sm text-gray-700 mb-4">
            <span className="flex text-yellow-400">
              {"★".repeat(Math.floor(product.rating))}
              {"☆".repeat(5 - Math.floor(product.rating))}
            </span>
            <span className="ml-2">({product.rating_count} reviews)</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isAddingToCart}
          >
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
