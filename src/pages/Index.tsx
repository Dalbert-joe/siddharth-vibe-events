import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GoldCursor from "@/components/GoldCursor";
import ScrollConfetti from "@/components/ScrollConfetti";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import EventCards from "@/components/EventCards";
import AreaRestrictions from "@/components/AreaRestrictions";
import GallerySection from "@/components/GallerySection";
import Footer from "@/components/Footer";
import Modal from "@/components/Modal";
import { useAuth } from "@/contexts/AuthContext";
import { Instagram, Mail, MapPin } from "lucide-react";

const INSTAGRAM_URL =
  "https://www.instagram.com/siddharth_vibe_events?igsh=aTExYmU5ZWc5NjBt";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [aboutOpen, setAboutOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackPhone, setFeedbackPhone] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState
    "idle" | "success" | "error"
  >("idle");

  const handleOpenFeedback = () => {
    if (!user) {
      navigate("/login", { state: { returnTo: "/", openFeedback: true } });
      return;
    }
    setFeedbackOpen(true);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackName || !feedbackPhone || !feedbackMessage) return;

    setFeedbackLoading(true);
    setFeedbackStatus("idle");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: feedbackName,
          phone: feedbackPhone,
          message: feedbackMessage,
        }),
      });

      if (res.ok) {
        setFeedbackStatus("success");
        setFeedbackName("");
        setFeedbackPhone("");
        setFeedbackMessage("");
      } else {
        setFeedbackStatus("error");
      }
    } catch {
      setFeedbackStatus("error");
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <GoldCursor />
      <ScrollConfetti />
      <Navigation
        onOpenAbout={() => setAboutOpen(true)}
        onOpenSupport={() => setSupportOpen(true)}
        onOpenFeedback={handleOpenFeedback}
      />

      <HeroSection />
      <EventCards />
      <AreaRestrictions />
      <GallerySection />
      <Footer />

      {/* About Modal */}
      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title="About Us">
        <div className="space-y-4 text-secondary-foreground font-body text-sm leading-relaxed">
          <p>Since 1991, Siddharth Vibe Events has been a cornerstone of comprehensive event management in Tamil Nadu.</p>
          <p>We provide end-to-end solutions for grand weddings, traditional temple functions, cultural folk programs, and high-profile government events.</p>
          <p>Our specialized inventory includes export-quality inflatable costumes available for both sale and rental.</p>
          <p>Based in Madurai, we bring over three decades of expertise, cultural understanding, and unwavering commitment to excellence.</p>
        </div>
      </Modal>

      {/* Support Modal */}
      <Modal open={supportOpen} onClose={() => setSupportOpen(false)} title="Contact & Support">
        <div className="space-y-5 font-body text-sm">
          <div className="flex items-start gap-3">
            <MapPin size={18} className="gold-text mt-0.5 shrink-0" />
            <p className="text-secondary-foreground leading-relaxed">
              28, Nelmandi Mahal Sanathi Street<br />
              Thiruparankundram, Madurai<br />
              Tamil Nadu 625005, India
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Mail size={18} className="gold-text shrink-0" />
            
              href="mailto:siddharthvibe.events@gmail.com"
              className="text-secondary-foreground hover:text-primary transition-colors cursor-none"
            >
              siddharthvibe.events@gmail.com
            </a>
          </div>
          <div className="flex gap-3 pt-2">
            
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-secondary rounded font-medium text-secondary-foreground hover:bg-muted transition-colors cursor-none"
            >
              <Instagram size={16} /> Instagram
            </a>
            
              href="mailto:siddharthvibe.events@gmail.com"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded font-medium hover:opacity-90 transition-opacity cursor-none"
            >
              <Mail size={16} /> Email
            </a>
          </div>
          <p className="text-[10px] text-muted-foreground/50 pt-4 text-center">
            Designed by Dalbert Joe
          </p>
        </div>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        open={feedbackOpen}
        onClose={() => { setFeedbackOpen(false); setFeedbackStatus("idle"); }}
        title="Feedback"
      >
        {feedbackStatus === "success" ? (
          <div className="text-center py-6 space-y-3">
            <div className="text-4xl">✨</div>
            <p className="gold-text font-heading text-xl">Thank you!</p>
            <p className="text-muted-foreground font-body text-sm">
              Your feedback has been received.
            </p>
            <button
              onClick={() => { setFeedbackStatus("idle"); setFeedbackOpen(false); }}
              className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded text-sm font-body hover:opacity-90 cursor-none"
            >
              Close
            </button>
          </div>
        ) : (
          <form className="space-y-4 font-body" onSubmit={handleFeedbackSubmit}>
            {feedbackStatus === "error" && (
              <div className="px-4 py-3 rounded bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                Something went wrong. Please try again.
              </div>
            )}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                Name
              </label>
              <input
                type="text"
                value={feedbackName}
                onChange={(e) => setFeedbackName(e.target.value)}
                className="w-full bg-secondary border gold-border rounded px-4 py-2.5 text-sm text-secondary-foreground focus:outline-none focus:border-primary transition-colors cursor-none"
                placeholder="Your name"
                maxLength={100}
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                Phone Number
              </label>
              <input
                type="tel"
                value={feedbackPhone}
                onChange={(e) => setFeedbackPhone(e.target.value)}
                className="w-full bg-secondary border gold-border rounded px-4 py-2.5 text-sm text-secondary-foreground focus:outline-none focus:border-primary transition-colors cursor-none"
                placeholder="Your phone number"
                maxLength={15}
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
                Message
              </label>
              <textarea
                rows={4}
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                className="w-full bg-secondary border gold-border rounded px-4 py-2.5 text-sm text-secondary-foreground focus:outline-none focus:border-primary transition-colors resize-none cursor-none"
                placeholder="Your message"
                maxLength={1000}
                required
              />
            </div>
            <button
              type="submit"
              disabled={feedbackLoading}
              className="w-full py-3 bg-primary text-primary-foreground font-medium rounded hover:opacity-90 transition-opacity cursor-none disabled:opacity-50"
            >
              {feedbackLoading ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Index;
