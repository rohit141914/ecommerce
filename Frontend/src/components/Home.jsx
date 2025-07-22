import React, { useContext, useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import AppContext from "../Context/Context";
import unplugged from "../assets/unplugged.png";
import { toast } from "react-toastify";
import apiUtils from "../apiUtils/apiUtils";

const Home = ({ selectedCategory }) => {
  const { data, isError, addToCart, refreshData } = useContext(AppContext);
  const [products, setProducts] = useState([]);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showColdStartMsg, setShowColdStartMsg] = useState(false);
  const imageCache = useRef({});

  useEffect(() => {
    if (!isDataFetched) {
      refreshData();
      setIsDataFetched(true);
    }
  }, [refreshData, isDataFetched]);

  useEffect(() => {
    let timer;
    if (isLoading) {
      setShowColdStartMsg(false);
      timer = setTimeout(() => {
        setShowColdStartMsg(true);
      }, 5000);
    } else {
      setShowColdStartMsg(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    if (data && data.length > 0) {
      setIsLoading(true);
      const fetchImagesAndUpdateProducts = async () => {
        const updatedProducts = await Promise.all(
          data.map(async (product) => {
            // Check if image is cached
            if (imageCache.current[product.id]) {
              return { ...product, imageUrl: imageCache.current[product.id] };
            }
            try {
              const imageUrl = await apiUtils.products.getProductImage(product.id);
              // Cache the image URL
              imageCache.current[product.id] = imageUrl;
              return { ...product, imageUrl };
            } catch (error) {
              console.error(
                "Error fetching image for product ID:",
                product.id,
                error
              );
              return { ...product, imageUrl: "placeholder-image-url" };
            }
          })
        );
        setProducts(updatedProducts);
        setIsLoading(false);
      };
      fetchImagesAndUpdateProducts();
    } else {
      setIsLoading(false);
    }
  }, [data]);

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  // if (isError) {
  //   return (
  //     <h2 className="text-center" style={{ padding: "18rem" }}>
  //       <img
  //         src={unplugged}
  //         alt="Error"
  //         style={{ width: "100px", height: "100px" }}
  //       />
  //     </h2>
  //   );
  // }
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ width: "4rem", height: "4rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <div
          style={{
            marginTop: "2rem",
            fontSize: "1.2rem",
            color: "#555",
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          <b>Loading products...</b>
          <br />
          {showColdStartMsg && (
            <span>
              This may take up to 1 minute due to free tier backend cold start.
              <br />
              Please wait...
            </span>
          )}
        </div>
      </div>
    );
  }
  return (
    <>
      <div
        className="grid"
        style={{
          marginTop: "64px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          padding: "20px",
        }}
      >
        {filteredProducts.length === 0 ? (
          <h2
            className="text-center"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            No Products Available
          </h2>
        ) : (
          filteredProducts.map((product) => {
            const { id, brand, name, price, stockQuantity, imageUrl } = product;
            const cardStyle = {
              width: "18rem",
              height: "12rem",
              boxShadow: "rgba(0, 0, 0, 0.24) 0px 2px 3px",
              backgroundColor: stockQuantity ? "#fff" : "#ccc",
            };
            return (
              <div
                className="card mb-3"
                style={{
                  width: "250px",
                  height: "360px",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  borderRadius: "10px",
                  overflow: "hidden",
                  backgroundColor: stockQuantity ? "#fff" : "#ccc",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "stretch",
                }}
                key={id}
              >
                <Link
                  to={`/product/${id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <img
                    src={imageUrl}
                    alt={name}
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                      padding: "5px",
                      margin: "0",
                      borderRadius: "10px 10px 10px 10px",
                    }}
                  />
                  <div
                    className="card-body"
                    style={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      padding: "10px",
                    }}
                  >
                    <div>
                      <h5
                        className="card-title"
                        style={{ margin: "0 0 10px 0", fontSize: "1.2rem" }}
                      >
                        {name.toUpperCase()}
                      </h5>
                      <i
                        className="card-brand"
                        style={{ fontStyle: "italic", fontSize: "0.8rem" }}
                      >
                        {"~ " + brand}
                      </i>
                    </div>
                    <hr className="hr-line" style={{ margin: "10px 0" }} />
                    <div className="home-cart-price">
                      <h5
                        className="card-text"
                        style={{
                          fontWeight: "600",
                          fontSize: "1.1rem",
                          marginBottom: "5px",
                        }}
                      >
                        <i className="bi bi-currency-rupee"></i>
                        {price}
                      </h5>
                    </div>
                    <button
                      className="btn-hover color-9"
                      style={{ margin: "10px 25px 0px " }}
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
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
                      }}
                      disabled={!stockQuantity}
                    >
                      {stockQuantity ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </div>
                </Link>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default Home;
