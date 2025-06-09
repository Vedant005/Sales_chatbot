// src/pages/HomePage.tsx

import React from "react";
import Header from "../components/Header";
import { Link } from "react-router-dom"; // For navigation buttons

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-inter">
      <Header />

      <section className="relative bg-gradient-to-br from-blue-500 to-purple-600 text-white py-20 md:py-32 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-pattern opacity-10"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0 20v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-40v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm-20 40v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-20v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-20v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM60 20v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0 0V0h-2v4h-4v2h4v4h2V6h4V4h-4zm0 40v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM20 0v-4h-2v4h-4v2h4v4h2V6h4V4h-4zM0 20v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM0 0V-4h-2v4h-4v2h4v4h2V6h4V4h-4zM0 40v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        ></div>
        <div className="relative z-10 text-center max-w-4xl px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 animate-fade-in-down">
            Shop Smarter, Not Harder.
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in-up">
            Your ultimate E-commerce destination powered by a smart sales
            chatbot. Find what you need, effortlessly.
          </p>
          <div className="flex justify-center space-x-4 animate-scale-in">
            <Link
              to="/products"
              className="bg-white text-blue-600 hover:bg-blue-100 px-8 py-3 rounded-full text-lg font-semibold shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Start Shopping
            </Link>
            <Link
              to="/chatbot"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-full text-lg font-semibold shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Meet Our Chatbot
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Unlock a New Shopping Experience
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-100 transform hover:scale-105 transition-transform duration-300">
              <div className="text-blue-600 text-5xl mb-4 text-center">🔍</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3 text-center">
                Efficient Search
              </h3>
              <p className="text-gray-700 text-center">
                Quickly find products by name, category, brand, or even price
                range using natural language queries.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-100 transform hover:scale-105 transition-transform duration-300">
              <div className="text-purple-600 text-5xl mb-4 text-center">
                🤖
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3 text-center">
                Smart Chatbot
              </h3>
              <p className="text-gray-700 text-center">
                Converse with our AI assistant to get product details, add to
                cart, and manage your shopping list.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-100 transform hover:scale-105 transition-transform duration-300">
              <div className="text-green-600 text-5xl mb-4 text-center">🛒</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3 text-center">
                Seamless Cart
              </h3>
              <p className="text-gray-700 text-center">
                Easily add, update, and remove items from your cart, all
                integrated with the chatbot.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto">
            Dive into a smarter shopping experience. Explore our vast catalog or
            chat with our bot to find your perfect match.
          </p>
          <img
            src="https://placehold.co/1000x600/blue/white?text=Shop+Smarter+with+E-ShopBot" // Placeholder Image
            alt="E-commerce shopping experience"
            className="rounded-lg shadow-2xl mx-auto mb-12 w-full max-w-3xl border-4 border-white"
            style={{ maxWidth: "min(100%, 800px)" }} // Responsive image sizing
          />
          <Link
            to="/products"
            className="bg-blue-600 text-white hover:bg-blue-700 px-10 py-4 rounded-full text-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Browse Products Now!
          </Link>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="container mx-auto text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} E-ShopBot. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
