import { Instagram } from "lucide-react";

const INSTAGRAM_URL = "https://www.instagram.com/siddharth_vibe_events?igsh=aTExYmU5ZWc5NjBt";

const Footer = () => (
  <footer className="py-12 border-t gold-border text-center">
    <h3 className="font-heading text-xl gold-text mb-1">Siddharth Vibe Events</h3>
    <p className="text-muted-foreground text-sm font-body">Madurai</p>
    <p className="text-muted-foreground text-xs font-body mt-1">Since 1991</p>
    <div className="mt-4 flex justify-center">
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 gold-text opacity-60 hover:opacity-100 transition-opacity cursor-none text-sm font-body"
      >
        <Instagram size={18} /> Instagram
      </a>
    </div>
  </footer>
);

export default Footer;
