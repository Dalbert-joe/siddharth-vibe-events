interface NavigationProps {
  onOpenAbout: () => void;
  onOpenSupport: () => void;
  onOpenFeedback: () => void;
}

const Navigation = ({ onOpenAbout, onOpenSupport, onOpenFeedback }: NavigationProps) => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass-dark border-b gold-border">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <span className="font-heading text-lg gold-text tracking-wide">SVE</span>
        <div className="flex gap-6 text-sm font-body">
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
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
