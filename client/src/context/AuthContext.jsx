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
  const storedIsAdmin = typeof window !== "undefined" ? localStorage.getItem("isAdmin") : null;

  const login = useCallback((token, userId, isAdmin = false) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("isAdmin", isAdmin ? "true" : "false");
    const payload = token ? parseJwt(token) : null;
    const resolvedIsAdmin = typeof isAdmin === "boolean" ? isAdmin : !!payload?.isAdmin;
    setUser({ id: userId, isAdmin: resolvedIsAdmin });
  }, []);

  const logout = useCallback(() => {
    disconnectSocket();
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("isAdmin");
    setUser(null);
  }, []);

  useEffect(() => {
    const payload = token ? parseJwt(token) : null;
    const fallbackIsAdmin = storedIsAdmin === "true";
    const resolvedIsAdmin = typeof payload?.isAdmin === "boolean" ? payload.isAdmin : fallbackIsAdmin;
    setUser(userId ? { id: userId, isAdmin: resolvedIsAdmin } : null);
    setLoading(false);
  }, [userId, token, storedIsAdmin]);

  useEffect(() => {
    let isMounted = true;
    if (!userId || !token) return;
    getUserProfile(userId)
      .then((data) => {
        if (!isMounted) return;
        if (typeof data?.isAdmin === "boolean") {
          localStorage.setItem("isAdmin", data.isAdmin ? "true" : "false");
        }
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
      const newIsAdmin = localStorage.getItem("isAdmin") === "true";
      const payload = newToken ? parseJwt(newToken) : null;
      const resolvedIsAdmin = typeof payload?.isAdmin === "boolean" ? payload.isAdmin : newIsAdmin;
      setUser(newUserId ? { id: newUserId, isAdmin: resolvedIsAdmin } : null);
    };
    const onUnauthorized = () => {
      disconnectSocket();
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("isAdmin");
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
