import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Read initial values from localStorage
  const storedUser = localStorage.getItem("auth_user");
  const storedIsAuth = localStorage.getItem("auth_isAuthenticated") === "true";

  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);
  const [isAuthenticated, setIsAuthenticated] = useState(storedIsAuth);

  const login = (username, password) => {
    // Simple authentication - in production, call an API instead
    if (username && password) {
      const loggedInUser = { username };

      // Update state
      setUser(loggedInUser);
      setIsAuthenticated(true);

      // Persist in localStorage
      localStorage.setItem("auth_user", JSON.stringify(loggedInUser));
      localStorage.setItem("auth_isAuthenticated", "true");

      return true;
    }
    return false;
  };

  const logout = () => {
    // Clear state
    setUser(null);
    setIsAuthenticated(false);

    // Remove from localStorage
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_isAuthenticated");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
