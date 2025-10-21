"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User } from "@/types/User";
import { AuthContextType } from "@/types/Auth";
import { loginService, logoutService } from "@/services/auth";
import { getUserProfile } from "@/services/user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window === 'undefined') return;
      
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      const tokenIssuedAt = localStorage.getItem("token_issued_at");
      const isRegistrationFlow = localStorage.getItem("isRegistrationFlow");
      const registrationData = localStorage.getItem("registrationData");
      
      // Nếu đang trong quá trình đăng ký và chưa có user thật, không tự động đăng nhập
      if (isRegistrationFlow === "true" && registrationData && !storedUser) {
        setIsLoading(false);
        return;
      }
      
      // Kiểm tra token đã quá hạn (24h) thì xoá ngay, tránh hiển thị user ảo
      if (token && tokenIssuedAt) {
        const issuedAtMs = Number(tokenIssuedAt);
        const isExpired = Number.isFinite(issuedAtMs) && Date.now() - issuedAtMs > 24 * 60 * 60 * 1000;
        if (isExpired) {
          try {
            localStorage.removeItem("token");
            localStorage.removeItem("token_issued_at");
            localStorage.removeItem("user");
          } catch {}
          setUser(null);
          setIsLoading(false);
          return;
        }
      }

      if (token) {
        // Tạm thời sử dụng storedUser thay vì gọi API để tránh logout tự động
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            
            // Đồng bộ trạng thái xác thực từ API verification khi khởi tạo
            try {
              const { getMyVerificationStatus } = await import("@/services/verification");
              const verificationStatus = await getMyVerificationStatus();
              parsedUser.isVerified = verificationStatus.isVerified;
              localStorage.setItem("user", JSON.stringify(parsedUser));
            } catch (verificationError) {
              // Nếu không lấy được verification status, giữ nguyên giá trị từ storedUser
              console.warn("Không thể lấy trạng thái xác thực khi khởi tạo:", verificationError);
            }
            
            setUser(parsedUser);
          } catch (error) {
            setUser(null);
          }
        } else {
          // Chỉ gọi API nếu không có storedUser
          try {
            const userData = await getUserProfile();
            
            // Đồng bộ trạng thái xác thực từ API verification
            try {
              const { getMyVerificationStatus } = await import("@/services/verification");
              const verificationStatus = await getMyVerificationStatus();
              userData.isVerified = verificationStatus.isVerified;
            } catch (verificationError) {
              // Nếu không lấy được verification status, giữ nguyên giá trị từ userData
              console.warn("Không thể lấy trạng thái xác thực:", verificationError);
            }
            
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
          } catch (error) {
            // KHÔNG tự động logout, chỉ set user = null
            setUser(null);
          }
        }
      } else if (storedUser) {
        // Không có token nhưng còn dữ liệu user cũ: dọn dẹp để tránh UI hiển thị sai
        localStorage.removeItem("user");
        setUser(null);
      }
      
      setIsLoading(false);
    };

    initializeAuth();
    
    // Lắng nghe sự kiện đăng xuất toàn cục (ví dụ phát từ utils/api khi 401)
    const onGlobalLogout = () => {
      setUser(null);
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("token_issued_at");
        localStorage.removeItem("user");
      } catch {}
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('app:logout', onGlobalLogout);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('app:logout', onGlobalLogout);
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { access_token, user } = await loginService(email, password);
      
      // Đồng bộ trạng thái xác thực từ API verification
      let userWithVerification = user;
      try {
        const { getMyVerificationStatus } = await import("@/services/verification");
        const verificationStatus = await getMyVerificationStatus();
        userWithVerification = { ...user, isVerified: verificationStatus.isVerified };
      } catch (verificationError) {
        // Nếu không lấy được verification status, giữ nguyên giá trị từ user
        console.warn("Không thể lấy trạng thái xác thực khi đăng nhập:", verificationError);
      }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem("token", access_token);
        localStorage.setItem("token_issued_at", String(Date.now()));
        localStorage.setItem("user", JSON.stringify(userWithVerification));
      }
      setUser(userWithVerification);
      return { success: true, message: "Đăng nhập thành công" };
    } catch (err: any) {
      return { success: false, message: err.message || "Đăng nhập thất bại" };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (typeof window === 'undefined') return { success: false, message: "Server side" };
    
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const userData = await getUserProfile();
        
        // Đồng bộ trạng thái xác thực từ API verification
        try {
          const { getMyVerificationStatus } = await import("@/services/verification");
          const verificationStatus = await getMyVerificationStatus();
          userData.isVerified = verificationStatus.isVerified;
        } catch (verificationError) {
          // Nếu không lấy được verification status, giữ nguyên giá trị từ userData
          console.warn("Không thể lấy trạng thái xác thực:", verificationError);
        }
        
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        return { success: true };
      } catch (error) {
        return { success: false, message: "Không thể tải thông tin user" };
      }
    }
    return { success: false, message: "Không có token" };
  };

  const logout = () => {
    setUser(null);
    logoutService();
  };

  return (
    <div suppressHydrationWarning={true}>
      <AuthContext.Provider value={{ user, login, logout, refreshUser, isLoading }}>
        {children}
      </AuthContext.Provider>
    </div>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
