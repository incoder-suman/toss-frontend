import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; // ✅ Render-connected axios instance

export default function Login() {
  const [form, setForm] = useState({ userId: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ⚙️ send both email/name as `identifier` to backend
      const res = await api.post("/auth/login", {
        identifier: form.userId.trim(), // can be email or username
        password: form.password.trim(),
      });

      // ✅ Save token + user
      localStorage.setItem("userToken", res.data.token);
      localStorage.setItem("userData", JSON.stringify(res.data.user));

      // ✅ Redirect to home
      navigate("/");
    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-4">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-6 sm:p-8 transition-transform duration-300 hover:scale-[1.01]">
        <h1 className="text-3xl font-extrabold text-center text-blue-600 mb-6">
          User Login
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 text-sm p-2 mb-4 rounded-md text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* User ID Input (can be name or email) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID or Email
            </label>
            <input
              type="text"
              name="userId"
              value={form.userId}
              onChange={handleChange}
              placeholder="Enter your User ID or Email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition duration-200 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          © {new Date().getFullYear()} TOSSBOOK — Secure User Portal
        </p>
      </div>
    </div>
  );
}
