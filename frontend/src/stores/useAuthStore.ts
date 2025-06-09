import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";

interface UserProfile {
  id: string;
  username: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  accessToken: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  // Authentication actions
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;

  // Utility actions
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

const API_BASE_URL = "http://127.0.0.1:5000";

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // --- Actions ---

      // Login Action
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/login`,
            credentials
          );
          const { access_token, user, message } = response.data;

          if (access_token && user) {
            set({
              accessToken: access_token,
              user: user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            console.log("Login successful:", message);
            return true;
          } else {
            set({
              isLoading: false,
              error: "Login failed: No access token or user data received.",
            });
            return false;
          }
        } catch (err: any) {
          const errorMessage =
            err.response?.data?.message || err.message || "Login failed.";
          set({ isLoading: false, error: errorMessage });
          console.error("Login error:", errorMessage);
          return false;
        }
      },

      // Register Action
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/register`,
            userData
          );
          const { message, user } = response.data;

          if (message && response.status === 201) {
            set({ isLoading: false, error: null }); // Just clear loading/error for now
            console.log("Registration successful:", message, user);
            return true;
          } else {
            set({
              isLoading: false,
              error: "Registration failed: Unexpected response.",
            });
            return false;
          }
        } catch (err: any) {
          const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "Registration failed.";
          set({ isLoading: false, error: errorMessage });
          console.error("Registration error:", errorMessage);
          return false;
        }
      },

      // Logout Action
      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          const currentAccessToken = get().accessToken;
          if (currentAccessToken) {
            await axios.post(
              `${API_BASE_URL}/auth/logout`,
              {},
              {
                headers: { Authorization: `Bearer ${currentAccessToken}` },
              }
            );
          }
          // For refresh token logout, also send to /auth/logout_refresh if needed

          await axios.post(`${API_BASE_URL}/auth/logout_refresh`, {}); // Browser sends refresh cookie automatically
        } catch (err: any) {
          console.warn(
            "Logout backend call failed (may be token already invalid or network issue):",
            err.response?.data?.message || err.message
          );
        } finally {
          set({
            accessToken: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          console.log("User logged out (client-side state cleared).");
        }
      },

      // Refresh Access Token Action
      refreshAccessToken: async () => {
        set({ isLoading: true, error: null });
        try {
          // The browser will automatically send the HttpOnly refresh_token_cookie
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`);
          const { access_token } = response.data;

          if (access_token) {
            set({
              accessToken: access_token,
              isAuthenticated: true, // User is still authenticated
              isLoading: false,
              error: null,
            });
            console.log("Access token refreshed successfully.");
            return true;
          } else {
            set({
              isLoading: false,
              error: "Failed to refresh token: No new token received.",
            });
            return false;
          }
        } catch (err: any) {
          const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "Failed to refresh token.";
          set({
            accessToken: null, // Clear tokens on refresh failure, forcing re-login
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          console.error("Refresh token error:", errorMessage);
          return false;
        }
      },

      // Utility to clear error messages
      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: "auth-storage", // name of the item in localStorage
      storage: createJSONStorage(() => localStorage), // Use localStorage
      // Partialize state to only store accessToken and user
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// --- Axios Interceptor for Automatic Token Attachment and Refresh ---
axios.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Axios Interceptor for handling 401 Unauthorized errors (token expiration)
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Check if the error is 401 Unauthorized and it's not the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== `${API_BASE_URL}/auth/refresh`
    ) {
      originalRequest._retry = true; // Mark request to prevent infinite loops

      console.warn(
        "Access token expired or unauthorized. Attempting to refresh..."
      );
      const store = useAuthStore.getState();

      if (!store.isAuthenticated || store.isLoading) {
        // If not authenticated or already refreshing, don't re-attempt
        return Promise.reject(error);
      }

      // Set loading state for refresh
      store.setLoading(true);

      try {
        const refreshed = await store.refreshAccessToken();
        store.setLoading(false);

        if (refreshed) {
          // Retry the original request with the new token
          originalRequest.headers["Authorization"] = `Bearer ${
            useAuthStore.getState().accessToken
          }`;
          return axios(originalRequest);
        } else {
          // If refresh failed, force logout (state already handled by refreshAccessToken)
          console.error("Failed to refresh token, logging out.");
          // Optionally, redirect to login page here in a React component or router guard
          return Promise.reject(error);
        }
      } catch (refreshError) {
        store.setLoading(false);
        console.error("Error during token refresh or retry:", refreshError);
        // Force logout if refresh failed (state already handled by refreshAccessToken)
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
