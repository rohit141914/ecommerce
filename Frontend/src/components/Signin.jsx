import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiUtils from "../apiUtils/apiUtils";

const Signin = () => {
  const navigator = useNavigate();
  const [form, setForm] = useState({
    email: "rohitnainindian@gmail.com",
    password: "testtest",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await apiUtils.auth.login(form);
      toast.success("Signin successful!", { theme: "colored" });
      navigator("/"); // Redirect to home page after successful signin
    } catch (err) {
      console.error("Signin error:", err.response);
      toast.error(err.response?.data || "Signin failed!", {
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
      <h2 className="mb-4 text-center">Sign In</h2>
        <div className="alert alert-info mb-3" role="alert">
        <small>
          <strong>Test Credentials:</strong> Email and password are pre-filled for testing purposes.
          Just click "Sign In" to try the app.
        </small>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label adaptive-label" htmlFor="signin-email">
            Email
          </label>
          <input
            type="email"
            className="form-control"
            id="signin-email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label
            className="form-label adaptive-label"
            htmlFor="signin-password"
          >
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="signin-password"
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
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        <span>Don't have an account?</span>
        <br />
        <a href="/signup" className="btn btn-link">
          Sign Up
        </a>
      </div>
    </div>
  );
};

export default Signin;
