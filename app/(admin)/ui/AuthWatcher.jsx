import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthWatcher = () => {
  function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    // invalid token format
    return true;
  }
}
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.log("ℹ️ No auth token found");
      return;
    }

    if (isTokenExpired(token)) {
      console.log("🔒 Token expired");

      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      navigate("/login", { replace: true });
    } else {
      // console.log("✅ Token is valid");
    }
  }, [navigate]);

  return null; // no UI
};

export default AuthWatcher;