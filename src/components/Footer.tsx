import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Phone, Instagram, Mail } from "lucide-react";

interface FooterProps {
  onOpenAbout?: () => void;
  onOpenSupport?: () => void;
  onOpenFeedback?: () => void;
}

const Footer = ({ onOpenAbout, onOpenSupport, onOpenFeedback }: FooterProps) => {
  const navigate = useNavigate();
  const footerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.05 }
    );
    if (footerRef.current) observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="border-t gold-border relative overflow-hidden">
      {/* ── Always-visible stub ── */}
      <div className="py-10 text-center">
        <h3 className="font-heading text-xl gold-text mb-1">Siddharth Vibe Events</h3>
        <p className="text-muted-foreground text-xs font-body">Since 1991</p>
      </div>

      {/* ── Sliding full footer ── */}
      <div
        ref={footerRef}
        className="transition-all duration-700 ease-out overflow-hidden"
        style={{
          maxHeight: visible ? "1000px" : "0px",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(40px)",
        }}
      >
        {/* Subtle background glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-primary/5 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 pb-10 relative z-10">
          {/* Brand blurb */}
          <div className="text-center mb-12">
            <p className="text-muted-foreground font-body text-sm leading-relaxed max-w-md mx-auto">
              Premium event management services in Madurai.
              Creating unforgettable celebrations for over 30 years.
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-[hsl(var(--gold))]/20 mb-10" />

          {/* Two columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-10">

            {/* Left — Visit Us */}
            <div>
              <h4 className="font-heading text-sm gold-text tracking-widest uppercase mb-5">Visit Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-muted-foreground font-body text-sm">
                  <MapPin size={16} className="gold-text mt-0.5 shrink-0" />
                  <span className="leading-relaxed">
                    28, Nelmandi Mahal Sanathi Street,<br />
                    Thiruparankundram,<br />
                    Tamil Nadu 625005, India
                  </span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground font-body text-sm">
                  <Phone size={16} className="gold-text shrink-0" />
                  <span>+91 63806 90032</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground font-body text-sm">
                  <Instagram size={16} className="gold-text shrink-0" />
                  <span>siddharth_vibe_events</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground font-body text-sm">
                  <Mail size={16} className="gold-text shrink-0" />
                  <span>siddharthvibe.events@gmail.com</span>
                </li>
              </ul>
            </div>

            {/* Right — Quick Links */}
            <div>
              <h4 className="font-heading text-sm gold-text tracking-widest uppercase mb-5">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  { label: "About Us", action: () => onOpenAbout?.() },
                  { label: "Our Services", action: () => { document.getElementById("events")?.scrollIntoView({ behavior: "smooth" }); } },
                  { label: "Our Products", action: () => navigate("/products") },
                  { label: "Gallery", action: () => navigate("/gallery") },
                  { label: "Support", action: () => onOpenSupport?.() },
                  { label: "Feedback", action: () => onOpenFeedback?.() },
                ].map(({ label, action }) => (
                  <li key={label}>
                    <button
                      onClick={action}
                      className="cursor-none font-body text-sm text-muted-foreground hover:gold-text hover:text-primary transition-colors duration-200 group flex items-center gap-2"
                    >
                      <span className="gold-text opacity-0 group-hover:opacity-100 transition-opacity text-xs">◆</span>
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-[hsl(var(--gold))]/20 pt-6 text-center">
            <p className="text-muted-foreground/50 font-body text-xs">
              © 2026 Siddharth Vibe Events. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
