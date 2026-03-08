import { useState } from "react";
import { X, Mail, MapPin, Instagram } from "lucide-react";

interface EventCard {
  title: string;
  description: string;
}

const events: EventCard[] = [
  { title: "Temple Functions", description: "Traditional temple ceremonies conducted with cultural authenticity and traditional arrangements." },
  { title: "Andal Kalyanam", description: "Sacred Andal Kalyanam event planning with traditional decor and ceremonial coordination." },
  { title: "Catering Services", description: "Professional catering for weddings, religious ceremonies, and large-scale gatherings." },
  { title: "Cultural Folk Programs", description: "Authentic Tamil folk dance and cultural performances for festivals and public events." },
  { title: "Temple Festival Events", description: "Event arrangements for temple festivals including stage, sound, and public coordination." },
  { title: "Birthday Celebrations", description: "Customized birthday party arrangements and entertainment planning." },
  { title: "Public Cultural Festivals", description: "Large-scale festival event management with stage, lighting, and performance coordination." },
  { title: "Inflatable Costume Rental", description: "Export-quality inflatable character costumes available for rental or purchase." },
  { title: "Stage and Sound Setup", description: "Professional stage structures, lighting rigs, and sound systems for large gatherings." },
];

const INSTAGRAM_URL = "https://www.instagram.com/siddharth_vibe_events?igsh=aTExYmU5ZWc5NjBt";

const ContactPanel = ({ onClose }: { onClose: () => void }) => (
  <div className="mt-6 p-5 bg-secondary rounded-lg border gold-border animate-fade-in">
    <div className="flex justify-between items-center mb-4">
      <span className="font-heading text-sm gold-text uppercase tracking-wider">Contact Us</span>
      <button onClick={onClose} className="gold-text opacity-60 hover:opacity-100 transition-opacity cursor-none">
        <X size={16} />
      </button>
    </div>
    <div className="space-y-3 text-sm font-body">
      <div className="flex items-start gap-3">
        <MapPin size={16} className="gold-text mt-0.5 shrink-0" />
        <p className="text-secondary-foreground leading-relaxed">
          28, Nelmandi Mahal Sanathi Street<br />
          Thiruparankundram, Madurai<br />
          Tamil Nadu 625005, India
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Mail size={16} className="gold-text shrink-0" />
        <a href="mailto:siddharthvibe.events@gmail.com" className="text-secondary-foreground hover:text-primary transition-colors cursor-none">
          siddharthvibe.events@gmail.com
        </a>
      </div>
      <div className="flex items-center gap-3">
        <Instagram size={16} className="gold-text shrink-0" />
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-secondary-foreground hover:text-primary transition-colors cursor-none">
          @siddharth_vibe_events
        </a>
      </div>
    </div>
  </div>
);

const EventCards = () => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [contactOpen, setContactOpen] = useState<number | null>(null);

  return (
    <section id="events" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-heading text-4xl sm:text-5xl text-center gold-text mb-4">Our Services</h2>
        <p className="text-center text-muted-foreground mb-16 font-body">End-to-end event solutions since 1991</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative">
          {events.map((event, i) => (
            <div
              key={i}
              className={`transition-all duration-500 ${expanded !== null && expanded !== i ? "opacity-40 scale-95" : "opacity-100"}`}
            >
              {expanded === i ? (
                <div className="bg-card border gold-border rounded-lg p-8 gold-glow animate-fade-in">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-heading text-2xl gold-text">{event.title}</h3>
                    <button
                      onClick={() => { setExpanded(null); setContactOpen(null); }}
                      className="gold-text opacity-60 hover:opacity-100 transition-opacity cursor-none"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <p className="text-secondary-foreground font-body leading-relaxed mb-6">{event.description}</p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="aspect-video bg-secondary rounded flex items-center justify-center">
                        <span className="text-muted-foreground text-xs font-body">Gallery {n}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setContactOpen(contactOpen === i ? null : i); }}
                      className="px-6 py-3 bg-primary text-primary-foreground font-body font-medium rounded hover:opacity-90 transition-opacity cursor-none"
                    >
                      Contact Us
                    </button>
                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-3 bg-secondary text-secondary-foreground font-body font-medium rounded hover:bg-muted transition-colors cursor-none"
                    >
                      <Instagram size={16} /> Instagram
                    </a>
                  </div>
                  {contactOpen === i && <ContactPanel onClose={() => setContactOpen(null)} />}
                </div>
              ) : (
                <div
                  className="bg-card border gold-border rounded-lg p-6 gold-glow hover:gold-glow-hover gold-border-hover transition-all duration-300 hover:-translate-y-1 cursor-none"
                  onClick={() => setExpanded(i)}
                >
                  <h3 className="font-heading text-xl gold-text mb-3">{event.title}</h3>
                  <p className="text-muted-foreground font-body text-sm leading-relaxed mb-5 line-clamp-2">{event.description}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpanded(i);
                      setContactOpen(i);
                    }}
                    className="px-5 py-2.5 bg-primary text-primary-foreground font-body text-sm font-medium rounded hover:opacity-90 transition-opacity cursor-none"
                  >
                    Contact Us
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventCards;
