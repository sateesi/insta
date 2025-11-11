import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import api, { setAuthToken } from "../api/client";

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("insta-auth");
    if (stored) {
      const parsed = JSON.parse(stored) as { token: string; user: User };
      setToken(parsed.token);
      setUser(parsed.user);
      setAuthToken(parsed.token);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setAuthToken(newToken);
    localStorage.setItem("insta-auth", JSON.stringify({ token: newToken, user: newUser }));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem("insta-auth");
  };

  const value = useMemo(() => ({ user, token, login, logout }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

