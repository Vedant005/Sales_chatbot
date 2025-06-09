// src/components/ChatbotSidebar.tsx

import React, { useState, useEffect, useRef } from "react";
import { useChatbotStore } from "../stores/useChatbotStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";

// Interface for product data received in chat messages
interface ChatbotProductDisplay {
  id: number;
  name: string;
  image_url: string;
  discounted_price: number;
}

// Represents a single chat message
interface ChatMessage {
  id: string;
  sender: "user" | "chatbot";
  text: string;
  products?: ChatbotProductDisplay[];
  timestamp: string;
}

const ChatbotSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); // State to control sidebar visibility
  const [inputMessage, setInputMessage] = useState("");

  const { messages, isLoading, isTyping, error, sendMessage, clearChat } =
    useChatbotStore();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const navigate = useNavigate();

  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling
  const chatContainerRef = useRef<HTMLDivElement>(null); // Ref for closing on outside click

  // Auto-scroll to bottom of chat messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      await sendMessage(inputMessage);
      setInputMessage("");
    }
  };

  // Handle closing sidebar on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatContainerRef.current &&
        !chatContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const renderMessageContent = (msg: ChatMessage) => {
    return (
      <>
        <p>{msg.text}</p>
        {msg.products && msg.products.length > 0 && (
          <div className="mt-2 grid grid-cols-1 gap-2">
            {msg.products.map((product) => (
              <div
                key={product.id}
                className="flex items-center p-2 bg-white rounded-md shadow-sm"
              >
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded-md mr-2"
                  onError={(e) => {
                    e.currentTarget.src = `https://placehold.co/50x50/cccccc/333333?text=No+Img`;
                  }}
                />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {product.name}
                  </p>
                  <p className="text-gray-700 text-xs">
                    ₹{product.discounted_price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1 text-right">
          {new Date(msg.timestamp).toLocaleTimeString()}
        </p>
      </>
    );
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 z-[1000]"
        aria-label={isOpen ? "Close Chatbot" : "Open Chatbot"}
      >
        {isOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            ></path>
          </svg>
        )}
      </button>

      {/* Chatbot Sidebar */}
      <div
        ref={chatContainerRef}
        className={`fixed bottom-0 right-0 h-full max-h-[calc(100vh-2rem)] w-full sm:w-[380px] bg-white shadow-2xl rounded-lg flex flex-col transform transition-transform duration-300 ease-in-out z-[999]
                    ${isOpen ? "translate-x-0" : "translate-x-full"} m-4`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-bold">E-ShopBot Assistant</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
            aria-label="Close Chatbot"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
          {authLoading ? (
            <div className="text-center text-gray-600">
              Checking authentication...
            </div>
          ) : !isAuthenticated ? (
            <div className="text-center text-gray-700 p-4">
              <p className="mb-4">Please log in to chat with the E-ShopBot.</p>
              <button
                onClick={() => {
                  navigate("/login");
                  setIsOpen(false);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Go to Login
              </button>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[80%] ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-300 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {renderMessageContent(msg)}
                </div>
              </div>
            ))
          )}
          {isTyping && isAuthenticated && (
            <div className="flex justify-start">
              <div className="bg-gray-300 text-gray-800 p-3 rounded-lg max-w-[80%] rounded-bl-none">
                <p>E-ShopBot is typing...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} /> {/* For auto-scrolling */}
        </div>

        {/* Error Display */}
        {error && isAuthenticated && (
          <div className="p-3 text-red-600 bg-red-100 border-t border-red-300">
            Error: {error}
          </div>
        )}

        {/* Chat Input Form */}
        {isAuthenticated && (
          <form
            onSubmit={handleSendMessage}
            className="p-4 bg-white border-t flex items-center rounded-b-lg"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow border border-gray-300 rounded-md px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isLoading}
            >
              Send
            </button>
            <button
              type="button"
              onClick={clearChat}
              className="ml-2 bg-gray-300 text-gray-800 px-3 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isLoading}
              title="Clear Chat History"
            >
              Clear
            </button>
          </form>
        )}
      </div>
    </>
  );
};

export default ChatbotSidebar;
