import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const RESEND_COOLDOWN = 30;

const Login = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (step === "otp") {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email"); return; }
    if (cooldown > 0) return;
    setSending(true);
    const err = await sendOtp(email.trim());
    setSending(false);
    if (err) { setError(err); } else { navigate("/verify-otp", { state: { email: email.trim(), flow: "login" } }); }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    const fullOtp = newOtp.join("");
    if (fullOtp.length === 6) {
      handleVerifyOtp(fullOtp);
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
    if (pasted.length === 6) handleVerifyOtp(pasted);
  };

  const handleVerifyOtp = async (code?: string) => {
    setError("");
    const otpCode = code || otp.join("");
    if (otpCode.length !== 6) { setError("Please enter all 6 digits"); return; }
    setSending(true);
    const err = await verifyOtp(email.trim(), otpCode);
    setSending(false);
    if (err) { setError(err); } else { navigate("/"); }
  };

  const handleResend = () => {
    if (cooldown > 0) return;
    setOtp(["", "", "", "", "", ""]);
    setError("");
    handleSendOtp();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl gold-text mb-2">Welcome Back</h1>
          <p className="text-muted-foreground font-body text-sm">
            {step === "email" ? "Sign in with email OTP" : "Enter the 6-digit code sent to your email"}
          </p>
        </div>

        <div className="space-y-5 border gold-border rounded-lg p-8 bg-card">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded px-4 py-2.5 font-body">
              {error}
            </div>
          )}

          {step === "email" ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block font-body">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-secondary border gold-border rounded px-4 py-2.5 text-sm text-secondary-foreground font-body focus:outline-none focus:border-primary focus:shadow-[0_0_15px_hsla(43,56%,52%,0.2)] transition-all cursor-none"
                  placeholder="you@example.com"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 bg-primary text-primary-foreground font-body font-medium rounded hover:opacity-90 hover:shadow-[0_0_20px_hsla(43,56%,52%,0.3)] transition-all cursor-none disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="text-center mb-2">
                <p className="text-secondary-foreground font-body text-sm">
                  Code sent to <span className="gold-text font-medium">{email}</span>
                </p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block font-body text-center">OTP Code</label>
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
                onClick={() => handleVerifyOtp()}
                disabled={sending || otp.join("").length !== 6}
                className="w-full py-3 bg-primary text-primary-foreground font-body font-medium rounded hover:opacity-90 hover:shadow-[0_0_20px_hsla(43,56%,52%,0.3)] transition-all cursor-none disabled:opacity-50"
              >
                {sending ? "Verifying..." : "Verify & Sign In"}
              </button>

              <div className="flex items-center justify-between text-xs font-body">
                <button
                  type="button"
                  onClick={() => { setStep("email"); setOtp(["", "", "", "", "", ""]); setError(""); }}
                  className="gold-text hover:underline cursor-none"
                >
                  Change email
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0}
                  className="gold-text hover:underline cursor-none disabled:opacity-50 disabled:no-underline"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground font-body">
            Don't have an account?{" "}
            <Link to="/signup" className="gold-text hover:underline cursor-none">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
