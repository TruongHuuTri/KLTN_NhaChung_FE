"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface User {
  userId: number | string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khôi phục session khi load app
  useEffect(() => {
    const u = localStorage.getItem("user");
    const t = localStorage.getItem("token");
    if (u && t) setUser(JSON.parse(u));
    setIsLoading(false);
  }, []);

  // Đăng nhập thật
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json(); // luôn parse JSON để lấy message cụ thể

      if (!res.ok) {
        setIsLoading(false);
        return {
          success: false,
          message: data?.message || "Đăng nhập thất bại",
        };
      }

      const { access_token, user } = data;
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      setIsLoading(false);
      return { success: true, message: "Đăng nhập thành công" };
    } catch (e) {
      setIsLoading(false);
      return { success: false, message: "Có lỗi xảy ra, vui lòng thử lại" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
