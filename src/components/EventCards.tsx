import { useState } from "react";
import { X } from "lucide-react";

interface EventCard {
  title: string;
  description: string;
}

const events: EventCard[] = [
  { title: "Catering", description: "Exquisite culinary experiences curated for grand celebrations, blending traditional and contemporary cuisines." },
  { title: "Temple Functions", description: "Traditional temple ceremonies managed with cultural authenticity and precision." },
  { title: "Andal Kalyanam", description: "Sacred Andal Kalyanam celebrations orchestrated with devotion and grandeur." },
  { title: "Folk Cultural Programs", description: "Vibrant folk art performances that celebrate Tamil Nadu's rich cultural heritage." },
  { title: "Government Events", description: "High-profile government functions executed with protocol excellence and flawless coordination." },
  { title: "Inflatable Costume Rental", description: "Export-quality inflatable costumes available for sale and rental, adding spectacle to any event." },
];

const EventCards = () => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [flipped, setFlipped] = useState<number | null>(null);

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
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-heading text-2xl gold-text">{event.title}</h3>
                    <button
                      onClick={() => setExpanded(null)}
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
                  <a
                    href="mailto:siddharthvibe.events@gmail.com"
                    className="inline-block px-6 py-3 bg-primary text-primary-foreground font-body font-medium rounded hover:opacity-90 transition-opacity cursor-none"
                  >
                    Contact Us
                  </a>
                </div>
              ) : (
                <div
                  className="perspective-1000 h-48 cursor-none"
                  onMouseEnter={() => setFlipped(i)}
                  onMouseLeave={() => setFlipped(null)}
                  onClick={() => setExpanded(i)}
                >
                  <div
                    className={`relative w-full h-full transition-transform duration-700 preserve-3d ${flipped === i ? "rotate-y-180" : ""}`}
                  >
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden bg-card border gold-border rounded-lg flex items-center justify-center gold-glow gold-glow-hover gold-border-hover transition-all duration-300">
                      <h3 className="font-heading text-xl sm:text-2xl gold-text text-center px-4">{event.title}</h3>
                    </div>
                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-card border gold-border rounded-lg flex items-center justify-center p-6 gold-glow">
                      <p className="text-secondary-foreground font-body text-sm text-center leading-relaxed">
                        "{event.description}"
                      </p>
                    </div>
                  </div>
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
