import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getAuthToken } from "../utils/getAuthToken";
import { UserContext } from "./UserContext";

export const AuthContext = createContext();

// The token has historically been written under a few different keys
// (see utils/getAuthToken.js). "token" is the canonical one we write now;
// the others are only read/cleared so existing sessions keep working.
const TOKEN_KEY = "token";
const LEGACY_TOKEN_KEYS = ["user-token", "user_token"];

function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  LEGACY_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
}

function decodeToken(token) {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

export default function AuthProvider({ children }) {
  const { clearUser } = useContext(UserContext) ?? {};

  const [userToken, setUserToken] = useState(() => {
    // Read through getAuthToken so a session stored under a legacy key is
    // still recognised on load instead of silently logging the user out.
    const stored = getAuthToken();
    if (!stored) return null;
    // A malformed token would blow up every decode downstream, so discard it
    // now and fall back to the login page.
    if (!decodeToken(stored)) {
      clearTokens();
      return null;
    }
    return stored;
  });

  // Derived, not stored in state: consumers read userData for ownership
  // checks, so it has to be correct on the first render rather than arriving
  // one render late via an effect.
  const userData = useMemo(
    () => (userToken ? decodeToken(userToken) : null),
    [userToken]
  );

  const saveUserToken = useCallback((token) => {
    // Write storage first, then state: ProtectedRoute falls back to reading
    // storage, so the token must be present before any re-render.
    localStorage.setItem(TOKEN_KEY, token);
    LEGACY_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
    setUserToken(token);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUserToken(null);
    // Also drop the cached profile, otherwise the previous account's name and
    // avatar survive the logout and show up in the next session on a
    // shared device.
    if (clearUser) {
      clearUser();
    } else {
      // Fallback if UserProvider is not an ancestor: at least clear storage.
      localStorage.removeItem("user");
    }
  }, [clearUser]);

  const value = useMemo(
    () => ({ userToken, userData, saveUserToken, logout }),
    [userToken, userData, saveUserToken, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
