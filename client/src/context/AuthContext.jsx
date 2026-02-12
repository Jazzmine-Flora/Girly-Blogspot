import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { disconnectSocket } from "../services/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const login = useCallback((token, userId) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    setUser({ id: userId });
  }, []);

  const logout = useCallback(() => {
    disconnectSocket();
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setUser(null);
  }, []);

  useEffect(() => {
    setUser(userId ? { id: userId } : null);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    const onStorage = () => {
      const newUserId = localStorage.getItem("userId");
      setUser(newUserId ? { id: newUserId } : null);
    };
    const onUnauthorized = () => {
      disconnectSocket();
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      setUser(null);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth:unauthorized", onUnauthorized);
    };
  }, []);

  const value = {
    user,
    userId,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
