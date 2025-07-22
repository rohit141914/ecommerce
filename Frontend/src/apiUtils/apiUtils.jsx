import API from "../axios";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * API utility functions for all API calls in the application
 */
export const apiUtils = {
  // Product related API calls
  products: {
    // Get all products
    getAllProducts: async () => {
      try {
        const response = await API.get("/products");
        return response.data;
      } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
    },

    // Get product by ID
    getProductById: async (id) => {
      try {
        const response = await API.get(`/product/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching product with ID ${id}:`, error);
        throw error;
      }
    },

    // Get product image by product ID
    getProductImage: async (productId) => {
      try {
        const response = await API.get(`/product/${productId}/image`, {
          responseType: "blob",
        });
        return URL.createObjectURL(response.data);
      } catch (error) {
        console.error(
          `Error fetching image for product ID ${productId}:`,
          error
        );
        throw error;
      }
    },

    // Add a new product
    addProduct: async (product, imageFile) => {
      try {

        // Use direct axios call with proper FormData handling
        const formData = new FormData();

        // Create a Blob with proper content type
        const productBlob = new Blob([JSON.stringify(product)], {
          type: "application/json",
        });

        formData.append("product", productBlob);
        formData.append("imageFile", imageFile);

        // Get token from localStorage for authentication
        const token = localStorage.getItem("token");

        // Use direct axios with BACKEND_URL to bypass interceptors that might be causing issues
        const response = await axios.post(
          `${BACKEND_URL}/api/product`,
          formData,
          {
            headers: {
              // Let the browser set the Content-Type boundary automatically
              "Content-Type": "multipart/form-data",
              // Add token to headers if available
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error("Error adding product:", error);
        throw error;
      }
    },

    // Update an existing product
    updateProduct: async (id, product, imageFile) => {
      try {
        // Use direct axios call with proper FormData handling
        const formData = new FormData();

        // Create a Blob with proper content type
        const productBlob = new Blob([JSON.stringify(product)], {
          type: "application/json",
        });

        formData.append("product", productBlob);

        // Only append image if it exists
        if (imageFile) {
          formData.append("imageFile", imageFile);
        }

        // Get token from localStorage for authentication
        const token = localStorage.getItem("token");

        // Use direct axios with BACKEND_URL to bypass interceptors that might be causing issues
        const response = await axios.put(
          `${BACKEND_URL}/api/product/${id}`,
          formData,
          {
            headers: {
              // Let the browser set the Content-Type boundary automatically
              "Content-Type": "multipart/form-data",
              // Add token to headers if available
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error(`Error updating product with ID ${id}:`, error);
        console.error("Error details:", error.response?.data || error.message);
        throw error;
      }
    },

    // Delete a product
    deleteProduct: async (id) => {
      try {
        const response = await API.delete(`/product/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error deleting product with ID ${id}:`, error);
        throw error;
      }
    },

    // Search products by keyword
    searchProducts: async (keyword) => {
      try {
        const response = await API.get(`/products/search?keyword=${keyword}`);
        return response.data;
      } catch (error) {
        console.error(
          `Error searching products with keyword "${keyword}":`,
          error
        );
        throw error;
      }
    },
  },

  // Authentication related API calls
  auth: {
    // User login
    login: async (credentials) => {
      try {
        const response = await axios.post(
          `${BACKEND_URL}/api/auth/login`,
          credentials
        );
        // Store the token in localStorage
        localStorage.setItem("token", response.data);
        return response.data;
      } catch (error) {
        console.error("Error during login:", error);
        throw error;
      }
    },

    // User registration
    register: async (userData) => {
      try {
        const response = await axios.post(
          `${BACKEND_URL}/api/auth/register`,
          userData
        );
        return response.data;
      } catch (error) {
        console.error("Error during registration:", error);
        throw error;
      }
    },

    // Logout - clear token
    logout: () => {
      localStorage.removeItem("token");
    },

    // Check if user is logged in
    isLoggedIn: () => {
      return localStorage.getItem("token") !== null;
    },
  },
};

export default apiUtils;
