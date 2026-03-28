import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface NavigationProps {
  onOpenAbout: () => void;
  onOpenSupport: () => void;
  onOpenFeedback: () => void;
}

const Navigation = ({ onOpenAbout, onOpenSupport, onOpenFeedback }: NavigationProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass-dark border-b gold-border">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-end">
        <div className="flex gap-6 text-sm font-body items-center">
          {[
            { label: "Events", action: () => scrollTo("events") },
            { label: "Gallery", action: () => scrollTo("gallery") },
            { label: "About", action: onOpenAbout },
            { label: "Support", action: onOpenSupport },
            { label: "Feedback", action: onOpenFeedback },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="gold-text-light opacity-70 hover:opacity-100 transition-opacity tracking-wider uppercase text-xs cursor-none"
            >
              {item.label}
            </button>
          ))}

          {user ? (
            <button
              onClick={logout}
              className="ml-2 px-4 py-1.5 border gold-border rounded text-xs uppercase tracking-wider gold-text hover:bg-primary hover:text-primary-foreground transition-all cursor-none"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="ml-2 px-4 py-1.5 bg-primary text-primary-foreground rounded text-xs uppercase tracking-wider font-medium hover:opacity-90 hover:shadow-[0_0_20px_hsla(43,56%,52%,0.3)] transition-all cursor-none"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
