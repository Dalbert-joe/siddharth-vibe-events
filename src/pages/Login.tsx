import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as any)?.returnTo || "/";
  const openFeedback = (location.state as any)?.openFeedback || false;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("All fields are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email address.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setError("Incorrect email or password.");
      } else if (error.message.includes("Email not confirmed")) {
        setError("Please verify your email first.");
      } else {
        setError("Login failed. Please try again.");
      }
      return;
    }

    navigate(returnTo, { state: { openFeedback } });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl gold-text mb-2">Welcome Back</h1>
          <p className="text-muted-foreground font-body text-sm">
            Siddharth Vibe Events
          </p>
        </div>

        <div className="bg-card border gold-border rounded-lg p-8 gold-glow">
          {error && (
            <div className="mb-5 px-4 py-3 rounded bg-destructive/10 border border-destructive/30 text-destructive text-sm font-body">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block font-body">
                Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 gold-text opacity-50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-secondary border gold-border rounded px-4 py-2.5 pl-9 text-sm text-secondary-foreground focus:outline-none focus:border-primary transition-colors cursor-none"
                  placeholder="you@email.com"
                  autoComplete="email"
                  maxLength={254}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block font-body">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 gold-text opacity-50" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-secondary border gold-border rounded px-4 py-2.5 pl-9 pr-10 text-sm text-secondary-foreground focus:outline-none focus:border-primary transition-colors cursor-none"
                  placeholder="Your password"
                  autoComplete="current-password"
                  maxLength={128}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 gold-text opacity-50 hover:opacity-100 transition-opacity cursor-none"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground font-medium rounded hover:opacity-90 transition-opacity cursor-none disabled:opacity-50 font-body text-sm tracking-wider uppercase mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-muted-foreground text-sm font-body mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="gold-text hover:opacity-80 transition-opacity cursor-none">
              Sign up
            </Link>
          </p>
        </div>

        <p className="text-center text-[10px] text-muted-foreground/40 mt-6 font-body">
          Designed by Dalbert Joe
        </p>
      </div>
    </div>
  );
};

export default Login;
