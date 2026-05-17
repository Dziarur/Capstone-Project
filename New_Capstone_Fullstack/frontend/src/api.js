import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:5000/api" });

// Auto-attach token ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (username, email, password) =>
    api.post("/register", { username, email, password }),
  login: (username, password) => api.post("/login", { username, password }),
};

export const quizAPI = {
  submit: (answers) => api.post("/quiz/submit", { answers }),
  getHistory: () => api.get("/quiz/history"),
};

export default api;
