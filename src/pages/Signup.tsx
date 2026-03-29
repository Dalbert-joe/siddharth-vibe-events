import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const { sendSignupLink } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim()) {
      setError("Please fill in all fields");
      return;
    }
    const err = await sendSignupLink(name.trim(), email.trim());
    if (err) {
      setError(err);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl gold-text mb-2">Create Account</h1>
          <p className="text-muted-foreground font-body text-sm">
            {sent ? "Check your email" : "Sign up with a magic link"}
          </p>
        </div>

        {sent ? (
          <div className="border gold-border rounded-lg p-8 bg-card text-center space-y-4">
            <div className="text-4xl mb-2">✉️</div>
            <p className="text-secondary-foreground font-body text-sm leading-relaxed">
              We've sent a sign-in link to <span className="gold-text font-medium">{email}</span>.
              <br />Open your email and click the link to complete signup.
            </p>
            <button
              onClick={() => setSent(false)}
              className="text-xs gold-text hover:underline cursor-none font-body"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 border gold-border rounded-lg p-8 bg-card">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded px-4 py-2.5 font-body">
                {error}
              </div>
            )}

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

            <button
              type="submit"
              className="w-full py-3 bg-primary text-primary-foreground font-body font-medium rounded hover:opacity-90 hover:shadow-[0_0_20px_hsla(43,56%,52%,0.3)] transition-all cursor-none"
            >
              Send Magic Link
            </button>

            <p className="text-center text-sm text-muted-foreground font-body">
              Already have an account?{" "}
              <Link to="/login" className="gold-text hover:underline cursor-none">
                Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Signup;
