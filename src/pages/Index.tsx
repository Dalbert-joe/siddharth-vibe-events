import { useState } from "react";
import GoldCursor from "@/components/GoldCursor";
import ScrollConfetti from "@/components/ScrollConfetti";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import EventCards from "@/components/EventCards";
import GallerySection from "@/components/GallerySection";
import Footer from "@/components/Footer";
import Modal from "@/components/Modal";
import { Instagram, Mail, MapPin } from "lucide-react";

const Index = () => {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <GoldCursor />
      <ScrollConfetti />
      <Navigation
        onOpenAbout={() => setAboutOpen(true)}
        onOpenSupport={() => setSupportOpen(true)}
        onOpenFeedback={() => setFeedbackOpen(true)}
      />

      <HeroSection />
      <EventCards />
      <GallerySection />
      <Footer />

      {/* About Modal */}
      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title="About Us">
        <div className="space-y-4 text-secondary-foreground font-body text-sm leading-relaxed">
          <p>
            Since 1991, Siddharth Vibe Events has been a cornerstone of comprehensive event management in Tamil Nadu.
          </p>
          <p>
            We provide end-to-end solutions for grand weddings, traditional temple functions, cultural folk programs, and high-profile government events.
          </p>
          <p>
            Our specialized inventory includes export-quality inflatable costumes available for both sale and rental, ensuring a unique and high-standard production for every client.
          </p>
          <p>
            Based in Madurai, we bring over three decades of expertise, cultural understanding, and unwavering commitment to excellence to every celebration we touch.
          </p>
        </div>
      </Modal>

      {/* Support Modal */}
      <Modal open={supportOpen} onClose={() => setSupportOpen(false)} title="Contact & Support">
        <div className="space-y-5 font-body text-sm">
          <div className="flex items-start gap-3">
            <MapPin size={18} className="gold-text mt-0.5 shrink-0" />
            <p className="text-secondary-foreground leading-relaxed">
              28, Nelmandi Mahal Sanathi Street<br />
              Thiruparankundram<br />
              Tamil Nadu 625005, India
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Mail size={18} className="gold-text shrink-0" />
            <a href="mailto:siddharthvibe.events@gmail.com" className="text-secondary-foreground hover:gold-text transition-colors cursor-none">
              siddharthvibe.events@gmail.com
            </a>
          </div>
          <div className="flex gap-3 pt-2">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-secondary rounded font-medium text-secondary-foreground hover:bg-muted transition-colors cursor-none"
            >
              <Instagram size={16} /> Instagram
            </a>
            <a
              href="mailto:siddharthvibe.events@gmail.com"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded font-medium hover:opacity-90 transition-opacity cursor-none"
            >
              <Mail size={16} /> Email
            </a>
          </div>
        </div>
      </Modal>

      {/* Feedback Modal */}
      <Modal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} title="Feedback">
        <form className="space-y-4 font-body" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Name</label>
            <input
              type="text"
              className="w-full bg-secondary border gold-border rounded px-4 py-2.5 text-sm text-secondary-foreground focus:outline-none focus:border-primary transition-colors cursor-none"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Phone Number</label>
            <input
              type="tel"
              className="w-full bg-secondary border gold-border rounded px-4 py-2.5 text-sm text-secondary-foreground focus:outline-none focus:border-primary transition-colors cursor-none"
              placeholder="Your phone number"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Message</label>
            <textarea
              rows={4}
              className="w-full bg-secondary border gold-border rounded px-4 py-2.5 text-sm text-secondary-foreground focus:outline-none focus:border-primary transition-colors resize-none cursor-none"
              placeholder="Your message"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-primary text-primary-foreground font-medium rounded hover:opacity-90 transition-opacity cursor-none"
          >
            Submit Feedback
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Index;
