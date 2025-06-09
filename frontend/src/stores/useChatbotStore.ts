import { create } from "zustand";
import axios from "axios";

// --- Interfaces ---

interface ChatMessageProduct {
  id: number;
  name: string;
  image_url: string;
  discounted_price: number;
  // Add other fields relevant for displaying in the chat
}

interface ChatMessage {
  id: string; // Unique ID for the message (e.g., timestamp or UUID)
  sender: "user" | "chatbot";
  text: string;
  products?: ChatMessageProduct[]; // Optional products returned by chatbot
  timestamp: string;
}

interface ChatbotState {
  messages: ChatMessage[];
  isTyping: boolean; // For chatbot's "typing..." indicator
  isLoading: boolean; // For overall API request loading
  error: string | null;
}

interface ChatbotActions {
  sendMessage: (userMessage: string) => Promise<void>;
  clearChat: () => void;
  clearError: () => void;
}

// --- API Base URL ---
const API_BASE_URL = "http://127.0.0.1:5000"; // Make sure this matches your Flask backend URL

// --- Chatbot Store ---
export const useChatbotStore = create<ChatbotState & ChatbotActions>(
  (set, get) => ({
    // Initial State
    messages: [],
    isTyping: false,
    isLoading: false,
    error: null,

    // Actions
    sendMessage: async (userMessage: string) => {
      const newMessageId = Date.now().toString(); // Simple ID for messages
      const userChatMessage: ChatMessage = {
        id: newMessageId,
        sender: "user",
        text: userMessage,
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, userChatMessage],
        isLoading: true,
        isTyping: true, // Show typing indicator while waiting for response
        error: null,
      }));

      try {
        const response = await axios.post(`${API_BASE_URL}/chatbot/converse`, {
          message: userMessage,
        });
        const { response: chatbotText, products } = response.data;

        const chatbotMessage: ChatMessage = {
          id: Date.now().toString() + "-bot",
          sender: "chatbot",
          text: chatbotText,
          products: products || [], // Ensure products is an array
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          messages: [...state.messages, chatbotMessage],
          isLoading: false,
          isTyping: false,
        }));
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.response ||
          err.response?.data?.message ||
          err.message ||
          "Failed to get chatbot response.";
        const errorMessageToUser: ChatMessage = {
          id: Date.now().toString() + "-error",
          sender: "chatbot",
          text: `Error: ${errorMessage}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          messages: [...state.messages, errorMessageToUser],
          isLoading: false,
          isTyping: false,
          error: errorMessage,
        }));
        console.error("Chatbot API error:", errorMessage);
      }
    },

    clearChat: () => {
      set({ messages: [], error: null });
      // Optionally, send a 'reset' message to the backend to clear server-side context
      // This could be a separate action if you want to differentiate client-side clear from full reset.
      // get().sendMessage('reset'); // This would cause a loop if not handled carefully
    },

    clearError: () => set({ error: null }),
  })
);
