import { createContext, useState } from "react";

export const UserContext = createContext();

const USER_KEY = "user";

export default function UserProvider({ children }) {

  const [user, setUser] = useState(() => {
    // A corrupt value here used to throw during mount and take down the whole
    // app with no way to recover, so treat unparseable data as "no user".
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  });

  function saveUser(userData) {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }

  function clearUser() {
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }

  return (
    <UserContext.Provider value={{ user, saveUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}