import { createContext, useContext, useEffect, useState } from "react";
import { fetchCurrentUser } from "../services/api";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const login = (userData, token) => {
    setUser(userData);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const getUser = async () => {
      if (token) {
        try {
          const currentUser = await fetchCurrentUser();
          console.log("Fetched user:", currentUser);
          setUser(currentUser);
        } catch (error) {
          console.error("Failed to fetch current user:", error);
          logout();
        }
      }
    };
    getUser();
  }, [token]);

  return (
    <UserContext.Provider value={{ user, token, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
