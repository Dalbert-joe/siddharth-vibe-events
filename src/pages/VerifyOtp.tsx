import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const RESEND_COOLDOWN = 30;

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sendOtp } = useAuth();
  const email = (location.state as { email?: string; name?: string; flow?: string })?.email || "";
  const name = (location.state as { name?: string })?.name || "";
  const flow = (location.state as { flow?: string })?.flow || "login";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      navigate("/login", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullOtp = newOtp.join("");
    if (fullOtp.length === 6) {
      handleVerify(fullOtp);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtp(newOtp);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
    if (pasted.length === 6) handleVerify(pasted);
  };

  const handleVerify = async (code?: string) => {
    setError("");
    const otpCode = code || otp.join("");
    if (otpCode.length !== 6) { setError("Please enter all 6 digits"); return; }
    setSending(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: "email",
    });
    if (verifyError) {
      setSending(false);
      setError(verifyError.message);
      return;
    }
    if (flow === "signup" && name) {
      await supabase.auth.updateUser({ data: { name } });
    }
    setSending(false);
    navigate("/");
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setSending(true);
    const err = await sendOtp(email);
    setSending(false);
    if (err) { setError(err); } else { setCooldown(RESEND_COOLDOWN); }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl gold-text mb-2">Verify OTP</h1>
          <p className="text-muted-foreground font-body text-sm">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <div className="space-y-5 border gold-border rounded-lg p-8 bg-card">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded px-4 py-2.5 font-body">
              {error}
            </div>
          )}

          <div className="text-center mb-2">
            <p className="text-secondary-foreground font-body text-sm">
              Code sent to <span className="gold-text font-medium">{email}</span>
            </p>
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block font-body text-center">
              OTP Code
            </label>
            <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-11 h-12 bg-secondary border gold-border rounded text-center text-lg font-mono text-secondary-foreground font-body focus:outline-none focus:border-primary focus:shadow-[0_0_15px_hsla(43,56%,52%,0.2)] transition-all cursor-none"
                />
              ))}
            </div>
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={sending || otp.join("").length !== 6}
            className="w-full py-3 bg-primary text-primary-foreground font-body font-medium rounded hover:opacity-90 hover:shadow-[0_0_20px_hsla(43,56%,52%,0.3)] transition-all cursor-none disabled:opacity-50"
          >
            {sending ? "Verifying..." : "Verify & Continue"}
          </button>

          <div className="flex items-center justify-between text-xs font-body">
            <Link
              to={flow === "signup" ? "/signup" : "/login"}
              className="gold-text hover:underline cursor-none"
            >
              ← Back
            </Link>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || sending}
              className="gold-text hover:underline cursor-none disabled:opacity-50 disabled:no-underline"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
