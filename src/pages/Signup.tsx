import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";

const passwordStrength = (pwd: string) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColor = [
  "",
  "text-red-400",
  "text-yellow-400",
  "text-blue-400",
  "text-green-400",
];

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = passwordStrength(password);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (strength < 2) {
      setError("Password too weak. Add uppercase letters, numbers or symbols.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: name.trim() },
      },
    });

    setLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        setError("This email is already registered. Please login.");
      } else {
        setError(error.message || "Signup failed. Please try again.");
      }
      return;
    }

    navigate("/verify-otp", {
      state: { email: email.trim().toLowerCase() },
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl gold-text mb-2">Create Account</h1>
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

          <form onSubmit={handleSignup} className="space-y-5" noValidate>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block font-body">
                Full Name
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 gold-text opacity-50" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-secondary border gold-border rounded px-4 py-2.5 pl-9 text-sm text-secondary-foreground focus:outline-none focus:border-primary transition-colors cursor-none"
                  placeholder="Your full name"
                  autoComplete="name"
                  maxLength={100}
                />
              </div>
            </div>

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
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
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
              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          strength >= level
                            ? level === 1 ? "bg-red-400"
                            : level === 2 ? "bg-yellow-400"
                            : level === 3 ? "bg-blue-400"
                            : "bg-green-400"
                            : "bg-secondary"
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-xs font-body ${strengthColor[strength]}`}>
                    {strengthLabel[strength]}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground font-medium rounded hover:opacity-90 transition-opacity cursor-none disabled:opacity-50 font-body text-sm tracking-wider uppercase mt-2"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-muted-foreground text-sm font-body mt-6">
            Already have an account?{" "}
            <Link to="/login" className="gold-text hover:opacity-80 transition-opacity cursor-none">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-[10px] text-muted-foreground/40 mt-6 font-body">
          Designed by 2MenDevs
        </p>
      </div>
    </div>
  );
};

export default Signup;
