import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BE_PUSHBIKEWEB_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API Error:", err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default api;
