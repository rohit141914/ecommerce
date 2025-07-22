import axios from "axios";
import { toast } from "react-toastify";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const API = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

// Add a request interceptor to include the JWT token in requests
API.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized errors
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If the error status is 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      // Clear token if it exists (likely expired or invalid)
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        
        // Dispatch custom event to notify components of auth change
        window.dispatchEvent(new Event('auth-changed'));
      }
      
      // Show notification if not already on signin page
      if (!window.location.pathname.includes('/signin')) {
        toast.error("Session expired. Please sign in again.", { theme: "colored" });
        
        // Navigate to signin page (with a slight delay to allow the toast to show)
        setTimeout(() => {
          window.location.href = '/signin';
        }, 1500);
      }
    }
    return Promise.reject(error);
  }
);

export default API;
