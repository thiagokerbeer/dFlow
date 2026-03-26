import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import type { AuthResponse, User } from "../types";

type RegisterData = {
  name: string;
  email: string;
  password: string;
};

type LoginData = {
  email: string;
  password: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storageUser = localStorage.getItem("deskflow_user");
    return storageUser ? JSON.parse(storageUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("deskflow_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const me = await api.get<User>("/auth/me");
        setUser(me);
        localStorage.setItem("deskflow_user", JSON.stringify(me));
      } catch {
        localStorage.removeItem("deskflow_token");
        localStorage.removeItem("deskflow_user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    void loadUser();
  }, []);

  async function register(data: RegisterData) {
    const response = await api.post<AuthResponse>("/auth/register", data);
    localStorage.setItem("deskflow_token", response.token);
    localStorage.setItem("deskflow_user", JSON.stringify(response.user));
    setUser(response.user);
  }

  async function login(data: LoginData) {
    const response = await api.post<AuthResponse>("/auth/login", data);
    localStorage.setItem("deskflow_token", response.token);
    localStorage.setItem("deskflow_user", JSON.stringify(response.user));
    setUser(response.user);
  }

  function logout() {
    localStorage.removeItem("deskflow_token");
    localStorage.removeItem("deskflow_user");
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      register,
      login,
      logout
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth precisa estar dentro de AuthProvider");
  }

  return context;
}
