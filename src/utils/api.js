import axios from "axios";
import Cookies from "js-cookie"; 

const api = axios.create({
  // baseURL: "http://localhost:5001",
  // baseURL: "https://kine-server-dev.vercel.app",
  baseURL: "https://kine-milk-server-six.vercel.app",
  withCredentials: true,
});


api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("u_token"); 
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`; 
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
