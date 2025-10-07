import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ✅ single comma
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("userToken"); // user ke liye alag key rakho
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
