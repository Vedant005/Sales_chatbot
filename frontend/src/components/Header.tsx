import React from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="flex items-center space-x-2">
          <Link
            to="/"
            className="text-3xl font-extrabold tracking-tight hover:text-blue-200 transition-colors duration-300"
          >
            🛒 E-ShopBot
          </Link>
        </div>

        <nav>
          <ul className="flex items-center space-x-6 text-lg">
            <li>
              <Link
                to="/products"
                className="hover:text-blue-200 transition-colors duration-300 transform hover:scale-105 inline-block py-2 px-3 rounded-md hover:bg-white hover:bg-opacity-20"
              >
                Shop
              </Link>
            </li>
            <li>
              <Link
                to="/chatbot"
                className="hover:text-blue-200 transition-colors duration-300 transform hover:scale-105 inline-block py-2 px-3 rounded-md hover:bg-white hover:bg-opacity-20"
              >
                Chatbot
              </Link>
            </li>
            <li>
              {isAuthenticated ? (
                <Link
                  to="/profile"
                  className="hover:text-blue-200 transition-colors duration-300 transform hover:scale-105 inline-block py-2 px-3 rounded-md hover:bg-white hover:bg-opacity-20"
                >
                  {user?.username || "Profile"}{" "}
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="hover:text-blue-200 transition-colors duration-300 transform hover:scale-105 inline-block py-2 px-3 rounded-md hover:bg-white hover:bg-opacity-20"
                >
                  Login/Signup
                </Link>
              )}
            </li>
            <li>
              <Link
                to="/cart"
                className="relative hover:text-blue-200 transition-colors duration-300 transform hover:scale-105 inline-block py-2 px-3 rounded-md hover:bg-white hover:bg-opacity-20"
              >
                <span className="mr-1">🛒</span> Cart
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
