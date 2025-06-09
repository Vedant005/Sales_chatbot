// src/stores/useCartStore.ts
import { create } from "zustand";
import axios from "axios";

interface CartProductDetails {
  id: number;
  name: string;
  image_url: string;
  discounted_price: number;
}

interface CartItem {
  id: number; // cart_item_id
  cart_id: number;
  product_id: number;
  quantity: number;
  added_at: string;
  product: CartProductDetails;
}

interface CartState {
  cartItems: CartItem[];
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
}

interface CartActions {
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<boolean>;
  updateCartItemQuantity: (
    itemId: number,
    newQuantity: number
  ) => Promise<boolean>;
  removeFromCart: (itemId: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  checkout: () => Promise<boolean>;
  clearError: () => void;
}

// --- API Base URL ---
const API_BASE_URL = "http://127.0.0.1:5000"; // Make sure this matches your Flask backend URL

// --- Cart Store ---
export const useCartStore = create<CartState & CartActions>((set, get) => ({
  // Initial State
  cartItems: [],
  totalPrice: 0,
  isLoading: false,
  error: null,

  // Actions
  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/api/cart`);
      const { items, total_price, message } = response.data;
      if (items) {
        set({ cartItems: items, totalPrice: total_price, isLoading: false });
      } else {
        // Handle empty cart message
        set({ cartItems: [], totalPrice: 0, isLoading: false, error: message });
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch cart.";
      set({ isLoading: false, error: errorMessage });
      console.error("Fetch cart error:", errorMessage);
    }
  },

  addToCart: async (productId, quantity = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_BASE_URL}/api/cart/add`, {
        product_id: productId,
        quantity,
      });
      // After successful add, refresh the cart state
      await get().fetchCart();
      console.log("Added to cart:", response.data.message);
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to add to cart.";
      set({ isLoading: false, error: errorMessage });
      console.error("Add to cart error:", errorMessage);
      return false;
    }
  },

  updateCartItemQuantity: async (itemId, newQuantity) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/cart/update/${itemId}`,
        { quantity: newQuantity }
      );
      await get().fetchCart(); // Refresh cart after update
      console.log("Cart item quantity updated:", response.data.message);
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update cart item.";
      set({ isLoading: false, error: errorMessage });
      console.error("Update cart item error:", errorMessage);
      return false;
    }
  },

  removeFromCart: async (itemId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/cart/remove/${itemId}`
      );
      await get().fetchCart(); // Refresh cart after removal
      console.log("Cart item removed:", response.data.message);
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to remove from cart.";
      set({ isLoading: false, error: errorMessage });
      console.error("Remove from cart error:", errorMessage);
      return false;
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/cart/clear`);
      await get().fetchCart(); // Clear state by fetching empty cart
      console.log("Cart cleared:", response.data.message);
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to clear cart.";
      set({ isLoading: false, error: errorMessage });
      console.error("Clear cart error:", errorMessage);
      return false;
    }
  },

  checkout: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_BASE_URL}/api/checkout`);
      // After checkout, the cart should be empty
      set({ cartItems: [], totalPrice: 0, isLoading: false });
      console.log("Checkout successful:", response.data.message);
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Checkout failed.";
      set({ isLoading: false, error: errorMessage });
      console.error("Checkout error:", errorMessage);
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
