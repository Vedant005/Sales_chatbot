// src/stores/useProductStore.ts
import { create } from "zustand";
import axios from "axios";

// --- Interfaces ---

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
  // brand?: string; // Add if your Product model has this
}

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  totalProducts: number; // NEW: Total count of products matching filters
  currentPage: number; // NEW: Current page number
  productsPerPage: number; // NEW: Number of products per page
  isLoading: boolean;
  error: string | null;
}

interface ProductActions {
  fetchProducts: (params?: {
    name?: string;
    category?: string;
    page?: number; // NEW: Page number to fetch
    per_page?: number; // NEW: Items per page
  }) => Promise<void>;
  fetchSingleProduct: (productId: number) => Promise<void>;
  clearSelectedProduct: () => void;
  clearError: () => void;
  setCurrentPage: (page: number) => void; // NEW: Action to update current page
  setProductsPerPage: (perPage: number) => void; // NEW: Action to update products per page
}

// --- API Base URL ---
const API_BASE_URL = "http://127.0.0.1:5000"; // Make sure this matches your Flask backend URL

// --- Product Store ---
export const useProductStore = create<ProductState & ProductActions>(
  (set, get) => ({
    // Initial State
    products: [],
    selectedProduct: null,
    totalProducts: 0, // Initialize
    currentPage: 1, // Start on page 1
    productsPerPage: 12, // Default products per page
    isLoading: false,
    error: null,

    // Actions
    fetchProducts: async (params = {}) => {
      set({ isLoading: true, error: null });
      try {
        // Merge current pagination state with incoming params
        const currentState = get();
        const fetchParams = {
          page:
            params.page !== undefined ? params.page : currentState.currentPage,
          per_page:
            params.per_page !== undefined
              ? params.per_page
              : currentState.productsPerPage,
          ...params, // Overwrite with any specific params from the call
        };

        const response = await axios.get(`${API_BASE_URL}/products/`, {
          params: fetchParams,
        });

        // Update state with paginated data and total count
        set({
          products: response.data.products || [],
          totalProducts: response.data.total_products,
          currentPage: response.data.page,
          productsPerPage: response.data.per_page,
          isLoading: false,
          error: null,
        });
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch products.";
        set({ isLoading: false, error: errorMessage });
        console.error("Fetch products error:", errorMessage);
      }
    },

    fetchSingleProduct: async (productId: number) => {
      set({ isLoading: true, error: null });
      try {
        const response = await axios.get(
          `${API_BASE_URL}/products/${productId}`
        );
        set({ selectedProduct: response.data, isLoading: false });
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          `Failed to fetch product ${productId}.`;
        set({ isLoading: false, error: errorMessage });
        console.error("Fetch single product error:", errorMessage);
      }
    },

    clearSelectedProduct: () => set({ selectedProduct: null }),
    clearError: () => set({ error: null }),
    setCurrentPage: (page: number) => set({ currentPage: page }),
    setProductsPerPage: (perPage: number) => set({ productsPerPage: perPage }),
  })
);
