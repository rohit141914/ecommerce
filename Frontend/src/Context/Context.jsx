import { useState, useEffect, createContext } from "react";
import apiUtils from "../apiUtils/apiUtils";

const AppContext = createContext({
  data: [],
  isError: "",
  cart: [],
  addToCart: (product) => {},
  removeFromCart: (productId) => {},
  refreshData: () => {},
  updateStockQuantity: (productId, newQuantity) => {},
});

export const AppProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [isError, setIsError] = useState("");
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("cart")) || []
  );

  const addToCart = (product) => {
    const existingProductIndex = cart.findIndex(
      (item) => item.id === product.id
    );
    if (existingProductIndex !== -1) {
      const updatedCart = cart.map((item, index) =>
        index === existingProductIndex
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    } else {
      const updatedCart = [...cart, { ...product, quantity: 1 }];
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    }
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const refreshData = async () => {
    try {
      const productsData = await apiUtils.products.getAllProducts();
      setData(productsData);
    } catch (error) {
      setIsError(error.message);
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.setItem("cart", JSON.stringify([]));
  };

  // Load initial data and listen for auth changes
  useEffect(() => {
    // Initial data load
    refreshData();

    // Listen for auth changes to refresh data
    const handleAuthChange = () => refreshData();
    window.addEventListener("auth-changed", handleAuthChange);

    // Cleanup
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, []);

  // Sync cart with localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  return (
    <AppContext.Provider
      value={{
        data,
        isError,
        cart,
        addToCart,
        removeFromCart,
        refreshData,
        clearCart,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
