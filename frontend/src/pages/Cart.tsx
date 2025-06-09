// src/pages/CartPage.tsx

import React, { useEffect } from "react";
import Header from "../components/Header";
import { useCartStore } from "../stores/useCartStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";

const CartPage: React.FC = () => {
  const {
    cartItems,
    totalPrice,
    isLoading,
    error,
    fetchCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    checkout,
  } = useCartStore();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const navigate = useNavigate();

  // Fetch cart items on component mount and whenever auth state or cart state changes
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        // If not authenticated, redirect to login (or show a message)
        navigate("/login");
      } else {
        fetchCart();
      }
    }
  }, [fetchCart, isAuthenticated, authLoading, navigate]);

  // Handle quantity change from input
  const handleQuantityChange = async (
    itemId: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (!isNaN(newQuantity) && newQuantity >= 0) {
      // Allow 0 to remove item
      await updateCartItemQuantity(itemId, newQuantity);
    }
  };

  // Show loading state for authentication or cart actions
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
        <p className="text-lg font-semibold text-gray-700">Loading cart...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-inter">
      <Header />
      <main className="container mx-auto p-6 flex-grow">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Your Shopping Cart
        </h1>

        {error && error !== "Your cart is empty." && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="text-gray-600 text-center text-lg p-8 bg-white rounded-lg shadow-md">
            <p>Your cart is empty. Start shopping!</p>
            <button
              onClick={() => navigate("/products")}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
                Items
              </h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-center justify-between border-b last:border-b-0 pb-4 mb-4"
                  >
                    <div className="flex items-center w-full sm:w-auto mb-4 sm:mb-0">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-md mr-4 border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = `https://placehold.co/100x100/cccccc/333333?text=No+Image`; // Placeholder on error
                        }}
                      />
                      <div className="flex-grow">
                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                          {item.product.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          ₹{item.product.discounted_price.toFixed(2)} each
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <label
                        htmlFor={`quantity-${item.id}`}
                        className="sr-only"
                      >
                        Quantity
                      </label>
                      <input
                        type="number"
                        id={`quantity-${item.id}`}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, e)}
                        min="0"
                        className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center focus:ring-blue-500 focus:border-blue-500"
                        disabled={isLoading}
                      />
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200 disabled:opacity-50"
                        disabled={isLoading}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
                Order Summary
              </h2>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium text-gray-700">
                  Total Price:
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{totalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
                <button
                  onClick={checkout}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || cartItems.length === 0}
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={clearCart}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || cartItems.length === 0}
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="bg-gray-800 text-white py-4 mt-auto">
        <div className="container mx-auto text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} E-ShopBot. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CartPage;
