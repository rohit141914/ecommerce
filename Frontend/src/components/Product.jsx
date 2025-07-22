import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect } from "react";
import { useState } from "react";
import AppContext from "../Context/Context";
import UpdateProduct from "./UpdateProduct";
import { toast } from "react-toastify";
import apiUtils from "../apiUtils/apiUtils";
const Product = () => {
  const { id } = useParams();
  const { addToCart, removeFromCart, refreshData } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await apiUtils.products.getProductById(id);
        setProduct(productData);
        if (productData.imageName) {
          fetchImage();
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    const fetchImage = async () => {
      try {
        const imageUrl = await apiUtils.products.getProductImage(id);
        setImageUrl(imageUrl);
      } catch (error) {
        console.error("Error fetching product image:", error);
      }
    };

    fetchProduct();
  }, [id]);

  const deleteProduct = async () => {
    try {
      await apiUtils.products.deleteProduct(id);
      removeFromCart(id);
      toast.success("Product deleted successfully", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      refreshData();
      navigate("/");
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleEditClick = () => {
    navigate(`/product/update/${id}`);
  };

  const handleAddToCart = () => {
    // Check if product is in stock before adding to cart
    if (!product || product.stockQuantity <= 0) {
      toast.error("This product is out of stock", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });
      return;
    }

    // Add to cart with all necessary product details
    // Make sure to include ALL required properties
    const productToAdd = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      stockQuantity: product.stockQuantity,
      category: product.category,
      description: product.description,
      available: product.available,
      imageName: product.imageName,
      imageType: product.imageType,
      releaseDate: product.releaseDate,
    };

    try {
      // Add to cart context
      addToCart(productToAdd);

      // Force update local storage as a backup
      const currentCart = JSON.parse(localStorage.getItem("cart")) || [];
      const existingItemIndex = currentCart.findIndex(
        (item) => item.id === productToAdd.id
      );

      if (existingItemIndex >= 0) {
        currentCart[existingItemIndex].quantity += 1;
      } else {
        currentCart.push({ ...productToAdd, quantity: 1 });
      }

      localStorage.setItem("cart", JSON.stringify(currentCart));

      toast.success("Added to cart!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });
    }
  };
  if (!product) {
    return (
      <h2 className="text-center" style={{ padding: "10rem" }}>
        Loading...
      </h2>
    );
  }
  return (
    <>
      <div className="containers" style={{ display: "flex" }}>
        <img
          className="left-column-img"
          src={imageUrl}
          alt={product.imageName}
          style={{ width: "50%", height: "auto" }}
        />

        <div className="right-column" style={{ width: "50%" }}>
          <div className="product-description">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "1.2rem", fontWeight: "lighter" }}>
                {product.category}
              </span>
              <p className="release-date" style={{ marginBottom: "2rem" }}>
                <h6>
                  Listed :{" "}
                  <span>
                    {" "}
                    <i> {new Date(product.releaseDate).toLocaleDateString()}</i>
                  </span>
                </h6>
                {/* <i> {new Date(product.releaseDate).toLocaleDateString()}</i> */}
              </p>
            </div>

            <h1
              style={{
                fontSize: "2rem",
                marginBottom: "0.5rem",
                textTransform: "capitalize",
                letterSpacing: "1px",
              }}
            >
              {product.name}
            </h1>
            <i style={{ marginBottom: "3rem" }}>{product.brand}</i>
            <p
              style={{
                fontWeight: "bold",
                fontSize: "1rem",
                margin: "10px 0px 0px",
              }}
            >
              PRODUCT DESCRIPTION :
            </p>
            <p style={{ marginBottom: "1rem" }}>{product.description}</p>
          </div>

          <div className="product-price">
            <span style={{ fontSize: "2rem", fontWeight: "bold" }}>
              {"$" + product.price}
            </span>
            <button
              className={`cart-btn ${
                !product.stockQuantity ? "disabled-btn" : ""
              }`}
              onClick={handleAddToCart}
              disabled={!product.stockQuantity}
              style={{
                padding: "1rem 2rem",
                fontSize: "1rem",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginBottom: "1rem",
              }}
            >
              {product.stockQuantity ? "Add to cart" : "Out of Stock"}
            </button>
            <h6 style={{ marginBottom: "1rem" }}>
              Stock Available :{" "}
              <i style={{ color: "green", fontWeight: "bold" }}>
                {product.stockQuantity}
              </i>
            </h6>
          </div>
          <div
            className="update-button"
            style={{ display: "flex", gap: "1rem" }}
          >
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleEditClick}
              style={{
                padding: "1rem 2rem",
                fontSize: "1rem",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Update
            </button>
            {/* <UpdateProduct product={product} onUpdate={handleUpdate} /> */}
            <button
              className="btn btn-primary"
              type="button"
              onClick={deleteProduct}
              style={{
                padding: "1rem 2rem",
                fontSize: "1rem",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Product;
