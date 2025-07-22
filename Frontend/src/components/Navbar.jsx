import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Home from "./Home";
import apiUtils from "../apiUtils/apiUtils";
import { toast } from "react-toastify";

const Navbar = ({ onSelectCategory, onSearch }) => {
  const navigate = useNavigate();

  const getInitialTheme = () => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme ? storedTheme : "light-theme";
  };

  const [selectedCategory, setSelectedCategory] = useState("");
  const [theme, setTheme] = useState(getInitialTheme());
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Function to check if user is logged in
  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    const isAuthenticated = token !== null;
    setIsLoggedIn(isAuthenticated);
    return isAuthenticated;
  };

  // Check authentication status when component mounts
  useEffect(() => {
    // Check immediately when component mounts
    checkAuthStatus();

    // Set up event listeners for auth state changes
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        checkAuthStatus();
      }
    };

    // Handle the custom auth-changed event from axios interceptor
    const handleAuthChanged = () => {
      checkAuthStatus();
    };

    // Add event listeners
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", checkAuthStatus);
    window.addEventListener("auth-changed", handleAuthChanged);

    // Check auth status periodically (every 2 seconds during development)
    const interval = setInterval(checkAuthStatus, 2000);

    // Cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", checkAuthStatus);
      window.removeEventListener("auth-changed", handleAuthChanged);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const products = await apiUtils.products.getAllProducts();
        setAllProducts(products);
        setSearchResults(products);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (value) => {
    setInput(value);
    if (value.length >= 1) {
      setShowSearchResults(true);
      const filtered = allProducts.filter((product) =>
        product.name.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(filtered);
      setNoResults(filtered.length === 0);
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
      setNoResults(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    onSelectCategory(category);
  };
  const toggleTheme = () => {
    const newTheme = theme === "dark-theme" ? "light-theme" : "dark-theme";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Handle sign in button click
  const handleSignInClick = () => {
    navigate("/signin");
  };

  // Handle sign out button click
  const handleSignOutClick = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");

    // Update state
    setIsLoggedIn(false);

    // Show toast notification
    toast.success("Signed out successfully", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });

    // Navigate to sign in page
    navigate("/signin");
  };

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const categories = [
    "Laptop",
    "Headphone",
    "Mobile",
    "Electronics",
    "Toys",
    "Fashion",
  ];
  return (
    <>
      <header>
        <nav className="navbar navbar-expand-lg fixed-top">
          <div className="container-fluid">
            <a className="navbar-brand" href="/signup">
              Ecommerce
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <a className="nav-link active" aria-current="page" href="/">
                    Home
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/add_product">
                    Add Product
                  </a>
                </li>

                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="/"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Categories
                  </a>

                  <ul className="dropdown-menu">
                    {categories.map((category) => (
                      <li key={category}>
                        <button
                          className="dropdown-item"
                          onClick={() => handleCategorySelect(category)}
                        >
                          {category}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>

                <li className="nav-item"></li>
              </ul>
              <button className="theme-btn" onClick={() => toggleTheme()}>
                {theme === "dark-theme" ? (
                  <i className="bi bi-moon-fill"></i>
                ) : (
                  <i className="bi bi-sun-fill"></i>
                )}
              </button>

              {/* Sign in/out button */}
              {/* <button
                className="btn btn-outline-primary mx-2"
                onClick={isLoggedIn ? handleSignOutClick : handleSignInClick}
              >
                {isLoggedIn ? (
                  <>
                    <i className="bi bi-box-arrow-right me-1"></i>Sign Out
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-1"></i>Sign In
                  </>
                )}
              </button> */}

              <div className="d-flex align-items-center cart gap-1">
                <a href="/cart" className="nav-link text-dark">
                  <i
                    className="bi bi-cart me-3 ms-2"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    Cart
                  </i>
                </a>
                <input
                  className="form-control me-2"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                  value={input}
                  onChange={(e) => handleChange(e.target.value)}
                  onFocus={() => setSearchFocused(true)} // Set searchFocused to true when search bar is focused
                  onBlur={() => setSearchFocused(false)} // Set searchFocused to false when search bar loses focus
                />
                {showSearchResults && (
                  <ul className="list-group">
                    {searchResults.length > 0
                      ? searchResults.map((result) => (
                          <li key={result.id} className="list-group-item">
                            <a
                              href={`/product/${result.id}`}
                              className="search-result-link"
                            >
                              <span>{result.name}</span>
                            </a>
                          </li>
                        ))
                      : noResults && (
                          <p className="no-results-message">
                            No Product with such Name
                          </p>
                        )}
                  </ul>
                )}
                <div />

                <button
                  className={`btn ${
                    isLoggedIn ? "btn-danger" : "btn-primary"
                  } mx-2`}
                  onClick={isLoggedIn ? handleSignOutClick : handleSignInClick}
                  style={{ minWidth: "112px" }}
                >
                  {isLoggedIn ? (
                    <>
                      <i className="bi bi-box-arrow-right me-1 w-6"></i>Sign Out
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-1"></i>Sign In
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Navbar;
