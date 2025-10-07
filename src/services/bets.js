import axios from "axios";

// ✅ Base configuration for all API calls
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// ✅ Automatically attach token with every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ✅ Handle API errors gracefully
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // optional: handle token expiration globally
    if (error.response?.status === 401) {
      console.warn("Session expired or unauthorized");
    }
    return Promise.reject(error);
  }
);

/* -------------------------------------------------------------------
 🧩 BET SERVICES
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
