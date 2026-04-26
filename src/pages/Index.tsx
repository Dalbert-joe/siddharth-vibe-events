import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScrollConfetti from "@/components/ScrollConfetti";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import EventCards from "@/components/EventCards";
import AreaRestrictions from "@/components/AreaRestrictions";
import GallerySection from "@/components/GallerySection";
import ProductPopupAd from "@/components/ProductPopupAd";
import ProductsHomeSection from "@/components/ProductsHomeSection";
import Footer from "@/components/Footer";
import Modal from "@/components/Modal";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Instagram, Mail, MapPin, MessageSquare } from "lucide-react";

const INSTAGRAM_URL = "https://www.instagram.com/siddharth_vibe_events?igsh=aTExYmU5ZWc5NjBt";

interface FeedbackItem {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

const PublicFeedbackPanel = () => {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("feedback")
      .select("id, name, message, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setFeedbackList(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <section className="py-16 px-6 border-t gold-border">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <MessageSquare size={20} className="gold-text" />
          <h2 className="font-heading text-3xl gold-text">What People Say</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-[hsl(43,56%,52%)] border-t-transparent animate-spin" />
          </div>
        ) : feedbackList.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground font-body">
            No feedback yet. Be the first to share your experience!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {feedbackList.map((fb) => (
              <div
                key={fb.id}
                className="bg-card border gold-border rounded-lg p-5 gold-glow hover:gold-glow-hover transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="font-heading text-sm gold-text font-bold">{fb.name}</p>
                  <span className="text-[9px] text-muted-foreground font-body shrink-0 ml-2">
                    {new Date(fb.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="border-t gold-border pt-3">
                  <p className="text-sm font-body text-secondary-foreground leading-relaxed">{fb.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

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
  const [feedbackStatus, setFeedbackStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    supabase.from("page_views").insert({ page: "home" });
  }, []);

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
        body: JSON.stringify({ name: feedbackName, phone: feedbackPhone, message: feedbackMessage }),
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
      <ScrollConfetti />
      <Navigation
        onOpenAbout={() => setAboutOpen(true)}
        onOpenSupport={() => setSupportOpen(true)}
        onOpenFeedback={handleOpenFeedback}
      />
      <HeroSection />
      <EventCards />
      <AreaRestrictions />
      <ProductsHomeSection />
      <GallerySection />

      {/* ✅ What People Say — above footer */}
      <PublicFeedbackPanel />

      <Footer
        onOpenAbout={() => setAboutOpen(true)}
        onOpenSupport={() => setSupportOpen(true)}
        onOpenFeedback={handleOpenFeedback}
      />

      <ProductPopupAd />

      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title="About Us">
        <div className="space-y-4 text-secondary-foreground font-body text-sm leading-relaxed">
          <p>Since 1991, Siddharth Vibe Events has been a cornerstone of comprehensive event management in Tamil Nadu.</p>
          <p>We provide end-to-end solutions for grand weddings, traditional temple functions, cultural folk programs, and high-profile government events.</p>
          <p>Our specialized inventory includes export-quality inflatable costumes available for both sale and rental.</p>
          <p>Based in Madurai, we bring over three decades of expertise, cultural understanding, and unwavering commitment to excellence.</p>
        </div>
      </Modal>

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
            <button
              onClick={() => { window.location.href = "mailto:siddharthvibe.events@gmail.com"; }}
              className="text-secondary-foreground hover:text-primary transition-colors cursor-none"
            >
              siddharthvibe.events@gmail.com
            </button>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => window.open(INSTAGRAM_URL, "_blank")}
              className="flex items-center gap-2 px-4 py-2 bg-secondary rounded font-medium text-secondary-foreground hover:bg-muted transition-colors cursor-none"
            >
              <Instagram size={16} /> Instagram
            </button>
            <button
              onClick={() => { window.location.href = "mailto:siddharthvibe.events@gmail.com"; }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded font-medium hover:opacity-90 transition-opacity cursor-none"
            >
              <Mail size={16} /> Email
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground/50 pt-4 text-center">Designed by 2MenDevs</p>
        </div>
      </Modal>

      <Modal
        open={feedbackOpen}
        onClose={() => { setFeedbackOpen(false); setFeedbackStatus("idle"); }}
        title="Feedback"
      >
        {feedbackStatus === "success" ? (
          <div className="text-center py-6 space-y-3">
            <div className="text-4xl">✨</div>
            <p className="gold-text font-heading text-xl">Thank you!</p>
            <p className="text-muted-foreground font-body text-sm">Your feedback has been received.</p>
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
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Name</label>
              <input type="text" value={feedbackName} onChange={(e) => setFeedbackName(e.target.value)}
                className="w-full bg-secondary border gold-border rounded px-4 py-2.5 text-sm text-secondary-foreground focus:outline-none focus:border-primary transition-colors cursor-none"
                placeholder="Your name" maxLength={100} required />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Phone Number</label>
              <input type="tel" value={feedbackPhone} onChange={(e) => setFeedbackPhone(e.target.value)}
                className="w-full bg-secondary border gold-border rounded px-4 py-2.5 text-sm text-secondary-foreground focus:outline-none focus:border-primary transition-colors cursor-none"
                placeholder="Your phone number" maxLength={15} required />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Message</label>
              <textarea rows={4} value={feedbackMessage} onChange={(e) => setFeedbackMessage(e.target.value)}
                className="w-full bg-secondary border gold-border rounded px-4 py-2.5 text-sm text-secondary-foreground focus:outline-none focus:border-primary transition-colors resize-none cursor-none"
                placeholder="Your message" maxLength={1000} required />
            </div>
            <button type="submit" disabled={feedbackLoading}
              className="w-full py-3 bg-primary text-primary-foreground font-medium rounded hover:opacity-90 transition-opacity cursor-none disabled:opacity-50">
              {feedbackLoading ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Index;
