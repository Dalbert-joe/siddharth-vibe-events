import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface NavigationProps {
  onOpenAbout: () => void;
  onOpenSupport: () => void;
  onOpenFeedback: () => void;
}

const Navigation = ({
  onOpenAbout,
  onOpenSupport,
  onOpenFeedback,
}: NavigationProps) => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(
        () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
        300
      );
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass-dark border-b gold-border">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-end">
        <div className="flex gap-6 text-sm font-body items-center flex-wrap">
          {[
            { label: "Events", action: () => scrollTo("events") },
            { label: "Gallery", action: () => scrollTo("gallery") },
            { label: "About", action: onOpenAbout },
            { label: "Support", action: onOpenSupport },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="gold-text-light opacity-70 hover:opacity-100 transition-opacity tracking-wider uppercase text-xs cursor-none"
            >
              {item.label}
            </button>
          ))}

          {/* Products button — navigates to /products page */}
          <button
            onClick={() => navigate("/products")}
            className="gold-text-light opacity-70 hover:opacity-100 transition-opacity tracking-wider uppercase text-xs cursor-none"
          >
            Products
          </button>

          <button
            onClick={onOpenFeedback}
            className="gold-text-light opacity-70 hover:opacity-100 transition-opacity tracking-wider uppercase text-xs cursor-none"
          >
            Feedback
          </button>

          {!loading &&
            (user ? (
              <button
                onClick={() => logout()}
                className="ml-2 px-4 py-1.5 border gold-border rounded text-xs uppercase tracking-wider gold-text hover:bg-primary hover:text-primary-foreground transition-all cursor-none"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="ml-2 px-4 py-1.5 bg-primary text-primary-foreground rounded text-xs uppercase tracking-wider font-medium hover:opacity-90 transition-all cursor-none"
              >
                Login
              </button>
            ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
