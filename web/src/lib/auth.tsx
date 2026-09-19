"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Lang } from "./i18n";

export interface Farmer {
  id: number;
  phone: string;
  name: string;
  language: Lang;
  state: string;
  district: string;
  village?: string | null;
  lat: number;
  lng: number;
}

interface StoredAuth {
  token: string;
  farmer: Farmer;
}

const STORAGE_KEY = "sasyamedha_auth";

interface AuthContextValue {
  token: string | null;
  farmer: Farmer | null;
  ready: boolean;
  setAuth: (auth: StoredAuth) => void;
  updateFarmer: (farmer: Farmer) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredAuth;
        setToken(parsed.token);
        setFarmer(parsed.farmer);
      }
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  const setAuth = useCallback((auth: StoredAuth) => {
    setToken(auth.token);
    setFarmer(auth.farmer);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } catch {
      // ignore
    }
  }, []);

  const updateFarmer = useCallback(
    (next: Farmer) => {
      setFarmer(next);
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as StoredAuth) : null;
        if (parsed) {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, farmer: next }));
        }
      } catch {
        // ignore
      }
    },
    []
  );

  const logout = useCallback(() => {
    setToken(null);
    setFarmer(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({ token, farmer, ready, setAuth, updateFarmer, logout }),
    [token, farmer, ready, setAuth, updateFarmer, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
