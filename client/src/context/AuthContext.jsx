import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { disconnectSocket } from "../services/socket";
import { getUserProfile } from "../api";

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    let base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padding = base64.length % 4;
    if (padding) base64 += "=".repeat(4 - padding);
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const login = useCallback((token, userId) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    const payload = token ? parseJwt(token) : null;
    setUser({ id: userId, isAdmin: !!payload?.isAdmin });
  }, []);

  const logout = useCallback(() => {
    disconnectSocket();
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setUser(null);
  }, []);

  useEffect(() => {
    const payload = token ? parseJwt(token) : null;
    setUser(userId ? { id: userId, isAdmin: !!payload?.isAdmin } : null);
    setLoading(false);
  }, [userId, token]);

  useEffect(() => {
    let isMounted = true;
    if (!userId || !token) return;
    getUserProfile(userId)
      .then((data) => {
        if (!isMounted) return;
        setUser((prev) => ({
          ...(prev || {}),
          id: userId,
          isAdmin: !!data?.isAdmin,
        }));
      })
      .catch(() => {
        // ignore profile fetch errors
      });
    return () => {
      isMounted = false;
    };
  }, [userId, token]);

  useEffect(() => {
    const onStorage = () => {
      const newUserId = localStorage.getItem("userId");
      const newToken = localStorage.getItem("token");
      const payload = newToken ? parseJwt(newToken) : null;
      setUser(newUserId ? { id: newUserId, isAdmin: !!payload?.isAdmin } : null);
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
    isAdmin: !!user?.isAdmin,
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
