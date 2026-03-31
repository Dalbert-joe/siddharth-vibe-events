import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ShieldCheck } from "lucide-react";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || "";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) navigate("/signup");
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const token = otp.join("");
    if (token.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });

    setLoading(false);

    if (error) {
      setError("Invalid or expired OTP. Please try again.");
      setOtp(Array(6).fill(""));
      inputsRef.current[0]?.focus();
      return;
    }

    navigate("/");
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) {
      setError("Failed to resend OTP. Please try again.");
    } else {
      setResendCooldown(60);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full border gold-border flex items-center justify-center gold-glow">
              <ShieldCheck size={28} className="gold-text" />
            </div>
          </div>
          <h1 className="font-heading text-4xl gold-text mb-2">Verify Email</h1>
          <p className="text-muted-foreground font-body text-sm">
            We sent a 6-digit code to
          </p>
          <p className="gold-text font-body text-sm font-medium mt-1">{email}</p>
        </div>

        <div className="bg-card border gold-border rounded-lg p-8 gold-glow">
          {error && (
            <div className="mb-5 px-4 py-3 rounded bg-destructive/10 border border-destructive/30 text-destructive text-sm font-body">
              {error}
            </div>
          )}

          <div
            className="flex gap-3 justify-center mb-8"
            onPaste={handlePaste}
          >
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputsRef.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-heading gold-text bg-secondary border-2 gold-border rounded-lg focus:outline-none focus:border-primary transition-all duration-200 cursor-none"
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={loading || otp.join("").length !== 6}
            className="w-full py-3 bg-primary text-primary-foreground font-medium rounded hover:opacity-90 transition-opacity cursor-none disabled:opacity-50 font-body text-sm tracking-wider uppercase"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>

          <div className="text-center mt-5">
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="text-sm font-body text-muted-foreground hover:text-primary transition-colors cursor-none disabled:opacity-40"
            >
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : "Resend code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
