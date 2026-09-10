import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getAuthToken } from "../utils/getAuthToken";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { userToken } = useContext(AuthContext) ?? {};

  // Prefer context state, but fall back to storage: saveUserToken writes
  // localStorage synchronously, so this stays correct even if this guard
  // renders before the provider's state update lands.
  const token = userToken ?? getAuthToken();

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
