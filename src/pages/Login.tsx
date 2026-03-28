import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    const err = login(email.trim(), password);
    if (err) {
      setError(err);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl gold-text mb-2">Welcome Back</h1>
          <p className="text-muted-foreground font-body text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 border gold-border rounded-lg p-8 bg-card">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded px-4 py-2.5 font-body">
              {error}
            </div>
          )}

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

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block font-body">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-secondary border gold-border rounded px-4 py-2.5 text-sm text-secondary-foreground font-body focus:outline-none focus:border-primary focus:shadow-[0_0_15px_hsla(43,56%,52%,0.2)] transition-all cursor-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary text-primary-foreground font-body font-medium rounded hover:opacity-90 hover:shadow-[0_0_20px_hsla(43,56%,52%,0.3)] transition-all cursor-none"
          >
            Login
          </button>

          <p className="text-center text-sm text-muted-foreground font-body">
            Don't have an account?{" "}
            <Link to="/signup" className="gold-text hover:underline cursor-none">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
