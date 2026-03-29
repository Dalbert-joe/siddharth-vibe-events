import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [sending, setSending] = useState(false);
  const { sendOtp } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim()) { setError("Please fill in all fields"); return; }
    setSending(true);
    const err = await sendOtp(email.trim());
    setSending(false);
    if (err) { setError(err); } else { setStep("otp"); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!otp.trim()) { setError("Please enter the OTP code"); return; }
    setSending(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type: "email",
    });
    if (verifyError) {
      setSending(false);
      setError(verifyError.message);
      return;
    }
    // Update user metadata with name
    await supabase.auth.updateUser({ data: { name: name.trim() } });
    setSending(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl gold-text mb-2">Create Account</h1>
          <p className="text-muted-foreground font-body text-sm">
            {step === "form" ? "Sign up with email OTP" : "Enter the code sent to your email"}
          </p>
        </div>

        <form
          onSubmit={step === "form" ? handleSendOtp : handleVerifyOtp}
          className="space-y-5 border gold-border rounded-lg p-8 bg-card"
        >
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded px-4 py-2.5 font-body">
              {error}
            </div>
          )}

          {step === "form" ? (
            <>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block font-body">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-secondary border gold-border rounded px-4 py-2.5 text-sm text-secondary-foreground font-body focus:outline-none focus:border-primary focus:shadow-[0_0_15px_hsla(43,56%,52%,0.2)] transition-all cursor-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block font-body">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-secondary border gold-border rounded px-4 py-2.5 text-sm text-secondary-foreground font-body focus:outline-none focus:border-primary focus:shadow-[0_0_15px_hsla(43,56%,52%,0.2)] transition-all cursor-none"
                  placeholder="you@example.com"
                />
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-2">
                <p className="text-secondary-foreground font-body text-sm">
                  Code sent to <span className="gold-text font-medium">{email}</span>
                </p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block font-body">OTP Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-secondary border gold-border rounded px-4 py-2.5 text-sm text-secondary-foreground font-body focus:outline-none focus:border-primary focus:shadow-[0_0_15px_hsla(43,56%,52%,0.2)] transition-all cursor-none text-center tracking-[0.5em] text-lg"
                  placeholder="000000"
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={() => { setStep("form"); setOtp(""); setError(""); }}
                className="text-xs gold-text hover:underline cursor-none font-body w-full text-center"
              >
                Use a different email
              </button>
            </>
          )}

          <button
            type="submit"
            disabled={sending}
            className="w-full py-3 bg-primary text-primary-foreground font-body font-medium rounded hover:opacity-90 hover:shadow-[0_0_20px_hsla(43,56%,52%,0.3)] transition-all cursor-none disabled:opacity-50"
          >
            {sending ? "Please wait..." : step === "form" ? "Send OTP" : "Verify & Create Account"}
          </button>

          <p className="text-center text-sm text-muted-foreground font-body">
            Already have an account?{" "}
            <Link to="/login" className="gold-text hover:underline cursor-none">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
