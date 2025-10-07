import axios from "axios";

/* -------------------------------------------------------------------
 🌍 GLOBAL AXIOS INSTANCE (Render + Vercel Compatible)
------------------------------------------------------------------- */

const API = axios.create({
  // ✅ Use environment variable from .env file
  baseURL: `${import.meta.env.VITE_API_URL}/api`, // example: https://toss-backend-g6ab.onrender.com/api
  timeout: 15000, // 15s timeout for slow networks
});

/* -------------------------------------------------------------------
 🔐 ATTACH TOKEN WITH EVERY REQUEST
------------------------------------------------------------------- */

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("userToken"); // ✅ consistent key (same as login)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* -------------------------------------------------------------------
 ⚠️ GLOBAL ERROR HANDLING
------------------------------------------------------------------- */

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized or expired token globally
    if (error.response?.status === 401) {
      console.warn("Session expired or unauthorized user 🚫");
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      // Optional: auto-redirect to login
      // window.location.href = "/login";
    }

    // Log meaningful message for debugging
    console.error(
      "❌ API Error:",
      error.response?.data?.message || error.message
    );

    return Promise.reject(error);
  }
);

/* -------------------------------------------------------------------
 🧩 BET SERVICES (Reusable Across Components)
------------------------------------------------------------------- */

// 🎯 Place a new bet
export const placeBet = async (data) => {
  const res = await API.post("/bets", data);
  return res.data;
};

// 👤 Get all bets of the logged-in user
export const getMyBets = async () => {
  const res = await API.get("/bets/me");
  return res.data;
};

// 🕹️ Get completed tosses (user’s toss history)
export const getTossHistory = async () => {
  const res = await API.get("/bets/history");
  return res.data;
};

// 🧾 Get all bets (for admin)
export const getAllBets = async (query = "") => {
  const res = await API.get(`/bets${query}`);
  return res.data;
};

/* -------------------------------------------------------------------
 📦 EXPORT DEFAULT INSTANCE (for direct API calls)
------------------------------------------------------------------- */
export default API;
