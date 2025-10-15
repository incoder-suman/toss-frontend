import axios from "axios";

/* -------------------------------------------------------------------
 🌍 GLOBAL AXIOS INSTANCE (Render + Vercel Compatible)
------------------------------------------------------------------- */

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`,
  timeout: 15000,
});

/* -------------------------------------------------------------------
 🔐 ATTACH TOKEN WITH EVERY REQUEST
------------------------------------------------------------------- */

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("userToken"); // ✅ must match login key
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No token found in localStorage");
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
    if (error.response?.status === 401) {
      console.warn("Session expired or unauthorized user 🚫");
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      // window.location.href = "/login"; // uncomment for auto-redirect
    }

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
  const res = await API.get("/bets/my");
  return res.data;
};

// 🕹️ Get completed tosses (user’s toss history)
export const getTossHistory = async () => {
  const res = await API.get("/bets/history"); // check backend route
  console.log("Fetched Toss History:", res.data);
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
