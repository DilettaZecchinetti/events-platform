import { createContext, useContext, useEffect, useState } from "react";
import { fetchCurrentUser } from "../services/api"

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const getUser = async () => {
      if (token) {
        const currentUser = await fetchCurrentUser();
        console.log("Fetched user:", currentUser);
        setUser(currentUser);
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