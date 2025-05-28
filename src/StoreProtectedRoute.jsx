import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const StoreProtectedRoute = ({ children }) => {
  const token = Cookies.get("u_token");
  const storedRole = Cookies.get("role");
  const location = useLocation(); // Get current route

  if (!token) {
    return <Navigate to="/" />;
  }

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds

    if (decodedToken.exp < currentTime) {
      Cookies.remove("u_token"); // Remove expired token
      Cookies.remove("role");
      return <Navigate to="/" />;
    }

    // Ensure only store role is allowed
    if (storedRole !== "store") {
      Cookies.remove("u_token");
      Cookies.remove("role");
      return <Navigate to="/" />;
    }

  } catch (error) {
    console.error("Invalid token:", error);
    Cookies.remove("u_token");
    Cookies.remove("role");
    return <Navigate to="/" />;
  }

  return children;
};

export default StoreProtectedRoute;
