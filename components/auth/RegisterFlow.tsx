"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useRegister } from "@/hooks/useRegister";
import { resendRegistrationOtp, verifyRegistration, loginService } from "@/services/auth";
import { extractApiErrorMessage } from "@/utils/api";

export default function RegisterFlow() {
  const router = useRouter();
  const { register, loading } = useRegister();
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "user" | "landlord",
    phone: "",
    avatar: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await register({ ...form });
    if (res.success) {
      setStep("otp");
      return;
    }
    setError(extractApiErrorMessage({ body: { message: res.message } }));
  };

  const onVerify = async () => {
    try {
      setError("");
      const otp = otpDigits.join("");
      if (!/^\d{6}$/.test(otp)) {
        setError("OTP gồm 6 chữ số");
        return;
      }
      await verifyRegistration(form.email, otp);
      // Sau khi verify thành công, login để có JWT cho bước survey
      const { access_token, user } = await loginService(form.email, form.password);
      if (typeof window !== "undefined") {
        localStorage.setItem("token", access_token);
        localStorage.setItem("user", JSON.stringify(user));
      }
      router.push(`/profile/survey?role=${form.role}`);
    } catch (e: any) {
      setError(extractApiErrorMessage(e));
    }
  };

  const onResend = async () => {
    try {
      setError("");
      await resendRegistrationOtp(form.email);
    } catch (e: any) {
      setError(extractApiErrorMessage(e));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      {step === "form" ? (
        <form onSubmit={onSubmit} className="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-4">
          <h1 className="text-2xl font-bold">Tạo tài khoản</h1>
          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium mb-1">Họ tên</label>
            <input className="w-full border rounded-lg p-3" value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="w-full border rounded-lg p-3" value={form.email} onChange={e=>setForm(f=>({...f, email:e.target.value}))} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu (≥ 6 ký tự)</label>
            <input type="password" className="w-full border rounded-lg p-3" value={form.password} onChange={e=>setForm(f=>({...f, password:e.target.value}))} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Vai trò</label>
            <select className="w-full border rounded-lg p-3" value={form.role} onChange={e=>setForm(f=>({...f, role: e.target.value as any}))}>
              <option value="user">Người dùng</option>
              <option value="landlord">Chủ nhà</option>
            </select>
          </div>

          <button disabled={loading} className="w-full h-12 rounded-lg bg-teal-600 text-white font-semibold">
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>
      ) : (
        <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-4">
          <h1 className="text-2xl font-bold">Xác thực OTP</h1>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <p className="text-sm text-gray-600">Nhập mã OTP 6 số đã được gửi tới email của bạn</p>
          <div className="flex gap-2 justify-center">
            {otpDigits.map((d, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  otpRefs.current[idx] = el;
                }}
                value={d}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 1);
                  const next = [...otpDigits];
                  next[idx] = v;
                  setOtpDigits(next);
                  if (v && idx < 5) otpRefs.current[idx + 1]?.focus();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !otpDigits[idx] && idx > 0) {
                    otpRefs.current[idx - 1]?.focus();
                  }
                }}
                onPaste={(e) => {
                  const txt = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                  if (!txt) return;
                  const arr = Array(6)
                    .fill("")
                    .map((_, i) => txt[i] || "");
                  setOtpDigits(arr);
                  otpRefs.current[5]?.focus();
                  e.preventDefault();
                }}
                inputMode="numeric"
                className="w-12 h-12 border rounded-lg text-center text-lg"
                maxLength={1}
              />
            ))}
          </div>
          <button onClick={onVerify} className="w-full h-12 rounded-lg bg-teal-600 text-white font-semibold">Xác thực</button>
          <button onClick={onResend} className="w-full h-12 rounded-lg border">Gửi lại OTP</button>
          <button onClick={()=>setStep("form")} className="w-full h-12 rounded-lg border">Quay lại</button>
        </div>
      )}
    </div>
  );
}


