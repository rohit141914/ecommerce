import React, { useContext, useState, useEffect, useRef } from "react";
import AppContext from "../Context/Context";
import axios from "axios";
import CheckoutPopup from "./CheckoutPopup";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Cart = () => {
  const { cart, removeFromCart, clearCart } = useContext(AppContext);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const imageCache = useRef({}); // cache for imageUrl and imageFile

  // Load cart items and fetch their images when cart changes
  useEffect(() => {
    const fetchImagesAndUpdateCart = async () => {
      try {
        // Verify we have items in the cart
        if (!cart || cart.length === 0) {
          setCartItems([]);
          return;
        }

        // Get all products to validate cart items exist
        const response = await axios.get(`${BACKEND_URL}/api/products`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const backendProductIds = response.data.map((product) => product.id);

        const updatedCartItems = cart.filter((item) =>
          backendProductIds.includes(item.id)
        );

        const cartItemsWithImages = await Promise.all(
          updatedCartItems.map(async (item) => {
            if (imageCache.current[item.id]) {
              // use cached image info
              return {
                ...item,
                imageUrl: imageCache.current[item.id].imageUrl,
              };
            }
            try {
              const response = await axios.get(
                `${BACKEND_URL}/api/product/${item.id}/image`,
                {
                  responseType: "blob",
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
              const imageUrl = URL.createObjectURL(response.data);
              const imageFile = await convertUrlToFile(
                response.data,
                item.imageName || "default.png"
              );
              imageCache.current[item.id] = { imageUrl, imageFile };
              return { ...item, imageUrl };
            } catch (error) {
              console.error("Error fetching image:", error);
              return { ...item, imageUrl: "placeholder-image-url" };
            }
          })
        );
        setCartItems(cartItemsWithImages);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    // Fetch images when cart changes
    fetchImagesAndUpdateCart();

    // Also fetch when component mounts
    return () => {
      // Clean up any pending image URLs when component unmounts
      Object.values(imageCache.current).forEach((cache) => {
        if (cache.imageUrl) URL.revokeObjectURL(cache.imageUrl);
      });
    };
  }, [cart]);

  useEffect(() => {
    const total = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
  }, [cartItems]);

  // Renamed helper function for clarity:
  const convertUrlToFile = async (blobData, fileName) => {
    const file = new File([blobData], fileName, { type: blobData.type });
    return file;
  };

  const handleIncreaseQuantity = (itemId) => {
    const cartItem = cartItems.find((item) => item.id === itemId);

    if (cartItem && cartItem.quantity < cartItem.stockQuantity) {
      // Update local state
      const newCartItems = cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      );
      setCartItems(newCartItems);

      // Update localStorage directly to ensure sync
      const localStorageCart = JSON.parse(localStorage.getItem("cart")) || [];
      const updatedLocalStorageCart = localStorageCart.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      );
      localStorage.setItem("cart", JSON.stringify(updatedLocalStorageCart));
    } else {
      toast.error("Cannot add more than available stock", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }
  };

  const handleDecreaseQuantity = (itemId) => {
    // Find the item in the cart
    const cartItem = cartItems.find((item) => item.id === itemId);

    if (cartItem) {
      const newQuantity = Math.max(cartItem.quantity - 1, 1);

      // Update local state
      const newCartItems = cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(newCartItems);

      // Update localStorage directly to ensure sync
      const localStorageCart = JSON.parse(localStorage.getItem("cart")) || [];
      const updatedLocalStorageCart = localStorageCart.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      localStorage.setItem("cart", JSON.stringify(updatedLocalStorageCart));
    }
  };

  const handleRemoveFromCart = (itemId) => {
    removeFromCart(itemId);
    const newCartItems = cartItems.filter((item) => item.id !== itemId);
    setCartItems(newCartItems);
  };

  const handleCheckout = async () => {
    try {
      // Show loading toast
      const toastId = toast.loading("Processing checkout...");

      for (const item of cartItems) {
        const { imageUrl, imageName, imageData, imageType, quantity, ...rest } =
          item;
        const updatedStockQuantity = item.stockQuantity - item.quantity;

        const updatedProductData = {
          ...rest,
          stockQuantity: updatedStockQuantity,
        };

        const cartProduct = new FormData();
        // Retrieve the cached image file (if missing, fallback to a placeholder or skip appending)
        const imageFile = imageCache.current[item.id]?.imageFile;
        if (imageFile) {
          cartProduct.append("imageFile", imageFile);
        }
        cartProduct.append(
          "product",
          new Blob([JSON.stringify(updatedProductData)], {
            type: "application/json",
          })
        );

        await axios.put(`${BACKEND_URL}/api/product/${item.id}`, cartProduct, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      }
      clearCart();
      setCartItems([]);
      setShowModal(false);
    } catch (error) {
      console.log("error during checkout", error);
    }
  };

  return (
    <div className="cart-container">
      <div className="shopping-cart">
        <div className="title">Shopping Bag</div>
        {cartItems.length === 0 ? (
          <div className="empty" style={{ textAlign: "left", padding: "2rem" }}>
            <h4>Your cart is empty</h4>
          </div>
        ) : (
          <>
            {cartItems.map((item) => (
              <li key={item.id} className="cart-item">
                <div
                  className="item"
                  style={{ display: "flex", alignContent: "center" }}
                  key={item.id}
                >
                  <div>
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="cart-item-image"
                    />
                  </div>
                  <div className="description">
                    <span>{item.brand}</span>
                    <span>{item.name}</span>
                  </div>

                  <div className="quantity">
                    <button
                      className="plus-btn"
                      type="button"
                      name="button"
                      onClick={() => handleIncreaseQuantity(item.id)}
                    >
                      <i className="bi bi-plus-square-fill"></i>
                    </button>
                    <input
                      type="button"
                      name="name"
                      value={item.quantity}
                      readOnly
                    />
                    <button
                      className="minus-btn"
                      type="button"
                      name="button"
                      onClick={() => handleDecreaseQuantity(item.id)}
                    >
                      <i className="bi bi-dash-square-fill"></i>
                    </button>
                  </div>

                  <div className="total-price " style={{ textAlign: "center" }}>
                    ${item.price * item.quantity}
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveFromCart(item.id)}
                  >
                    <i className="bi bi-trash3-fill"></i>
                  </button>
                </div>
              </li>
            ))}
            <div className="total">Total: ${totalPrice}</div>
            <Button
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={() => setShowModal(true)}
            >
              Checkout
            </Button>
          </>
        )}
      </div>
      <CheckoutPopup
        show={showModal}
        handleClose={() => setShowModal(false)}
        cartItems={cartItems}
        totalPrice={totalPrice}
        handleCheckout={handleCheckout}
      />
    </div>
  );
};

export default Cart;
