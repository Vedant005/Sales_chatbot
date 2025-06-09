import { create } from "zustand";
import axios from "axios";

interface ChatMessageProduct {
  id: number;
  name: string;
  image_url: string;
  discounted_price: number;
}

interface ChatMessage {
  id: string;
  sender: "user" | "chatbot";
  text: string;
  products?: ChatMessageProduct[];
  timestamp: string;
}

interface ChatbotState {
  messages: ChatMessage[];
  isTyping: boolean;
  isLoading: boolean;
  error: string | null;
}

interface ChatbotActions {
  sendMessage: (userMessage: string) => Promise<void>;
  clearChat: () => void;
  clearError: () => void;
}

const API_BASE_URL = "http://127.0.0.1:5000";
URL;

export const useChatbotStore = create<ChatbotState & ChatbotActions>(
  (set, get) => ({
    // Initial State
    messages: [],
    isTyping: false,
    isLoading: false,
    error: null,

    // Actions
    sendMessage: async (userMessage: string) => {
      const newMessageId = Date.now().toString();
      const userChatMessage: ChatMessage = {
        id: newMessageId,
        sender: "user",
        text: userMessage,
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, userChatMessage],
        isLoading: true,
        isTyping: true,
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
          products: products || [],
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
    },

    clearError: () => set({ error: null }),
  })
);
