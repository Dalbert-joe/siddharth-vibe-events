import { useEffect, useState } from "react";

type User = {
  email: string;
};

let globalUser: User | null = null;

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(globalUser);
  const [loading, setLoading] = useState(false);

  // ===== SEND OTP =====
  const sendOtp = async (email: string) => {
    try {
      setLoading(true);

      // Simulate API call (replace later with real backend)
      console.log("Sending OTP to:", email);

      // store temp email
      localStorage.setItem("auth_email", email);

      setLoading(false);
      return null;
    } catch (err) {
      setLoading(false);
      return "Failed to send OTP";
    }
  };

  // ===== VERIFY OTP =====
  const verifyOtp = async (email: string, otp: string) => {
    try {
      setLoading(true);

      // FAKE CHECK (replace later with backend)
      if (otp !== "123456") {
        setLoading(false);
        return "Invalid OTP";
      }

      const newUser = { email };

      globalUser = newUser;
      setUser(newUser);

      localStorage.setItem("user", JSON.stringify(newUser));

      setLoading(false);
      return null;
    } catch (err) {
      setLoading(false);
      return "Verification failed";
    }
  };

  // ===== LOAD SESSION =====
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      globalUser = parsed;
      setUser(parsed);
    }
  }, []);

  const logout = () => {
    globalUser = null;
    setUser(null);
    localStorage.removeItem("user");
  };

  return {
    user,
    loading,
    sendOtp,
    verifyOtp,
    logout,
  };
};
