
import { createContext, useContext, useEffect, useState } from "react";
import { fetchCurrentUser, logoutUser } from "../services/api";

const UserContext = createContext(null);

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
}

function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

export { UserProvider, useUser };
