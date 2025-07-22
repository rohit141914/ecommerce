import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiUtils from "../apiUtils/apiUtils";

const Signup = () => {
  const navigator = useNavigate();
  const [form, setForm] = useState({
    username: "",
    isAdmin: false,
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiUtils.auth.register(form);
      toast.success("Signup successful!", { theme: "colored" });
      navigator("/signin"); // Redirect to signin page after successful signup
    } catch (err) {
      toast.error(err.response?.data || "Signup failed!", {
        theme: "colored",
      });
    }
    setLoading(false);
  };

  return (
    <div
      className="container"
      style={{
        maxWidth: 400,
        margin: "80px auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2 className="mb-4 text-center">Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label
            className="form-label adaptive-label"
            htmlFor="signup-username"
          >
            Username
          </label>
          <input
            type="text"
            className="form-control"
            id="signup-username"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3 form-check">
          <input
            type="checkbox"
            className="form-check-input"
            name="isAdmin"
            checked={form.isAdmin}
            onChange={handleChange}
            id="signup-isAdminCheck"
          />
          <label
            className="form-check-label adaptive-label"
            htmlFor="signup-isAdminCheck"
          >
            Is Admin
          </label>
        </div>
        <div className="mb-3">
          <label className="form-label adaptive-label" htmlFor="signup-email">
            Email
          </label>
          <input
            type="email"
            className="form-control"
            id="signup-email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label
            className="form-label adaptive-label"
            htmlFor="signup-password"
          >
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="signup-password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <span>Already have an account?</span>
          <br />
          <a href="/signin" className="btn btn-link">
            Sign In
          </a>
        </div>
      </form>
    </div>
  );
};

export default Signup;
