import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("bv-token");
    if (!token) { setLoading(false); return; }
    api.get("/auth/profile").then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem("bv-token")).finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    user, loading,
    async login(credentials) {
      const { data } = await api.post("/auth/login", credentials);
      localStorage.setItem("bv-token", data.token);
      setUser(data.user);
      return data.user;
    },
    async register(details) {
      const { data } = await api.post("/auth/register", details);
      localStorage.setItem("bv-token", data.token);
      setUser(data.user);
      return data.user;
    },
    updateWalletAddress(walletAddress) {
      setUser((current) => current ? { ...current, walletAddress } : current);
    },
    logout() { localStorage.removeItem("bv-token"); setUser(null); }
  }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
