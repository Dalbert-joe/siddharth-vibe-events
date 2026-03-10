import { useState } from "react";
import { X, Mail } from "lucide-react";

interface EventCategory {
  title: string;
  description: string;
  services: string[];
}

const eventCategories: EventCategory[] = [
  {
    title: "Temple Processions (Sammy Oorvalam)",
    description: "Traditional temple procession performances and devotional ceremonial entries for festivals and weddings.",
    services: ["Madurai Famous Kallalagar Oorvalam", "Amman Oorvalam"],
  },
  {
    title: "Welcome & Wedding Entry Performances",
    description: "Elegant welcome dances and grand wedding stage entry performances for memorable celebrations.",
    services: ["Layer Skirt Lotus Welcome Dance", "Welcome Girls Dance Team", "Wedding Stage Welcome Dance Performance"],
  },
  {
    title: "Event Food Stalls",
    description: "Curated food and beverage stall setups for events, weddings, and festivals.",
    services: ["Popcorn Stall", "Ice Cream Stall", "Panjumittai (Cotton Candy) Stall", "Beeda Stall", "Mehendi Stall", "Tea / Coffee / Badam Milk Stall"],
  },
  {
    title: "Fun Character & Welcome Costumes",
    description: "Entertaining character costumes for event welcomes and kids' entertainment.",
    services: ["Mickey Mouse Costume (Pair)", "Teddy Costume (Pair)", "Chettiar Costume (Pair)", "Joker Costume", "Chettiar Solo Costume", "Chotta Bheem Costume", "Fat Man Costume"],
  },
  {
    title: "Musical Instrument Performances",
    description: "Live traditional and contemporary musical instrument performances for all occasions.",
    services: ["Kerala Special Chenda Melam", "Drum Set Performance", "Nadaswaram", "Thappattam"],
  },
  {
    title: "Traditional Tamil Folk Dances (கிராமிய நிகழ்ச்சிகள்)",
    description: "Authentic Tamil folk dance performances rooted in cultural heritage and tradition.",
    services: ["Madu Attam", "Mayil Attam", "Poyikkal Kuthirai Attam", "Kattai Kal Attam (Kokkalikattai Attam)", "Oyilattam", "Karakattam", "Pulli Attam", "Karadi Attam"],
  },
  {
    title: "Entertainment Shows",
    description: "Variety entertainment programs including music, devotional performances, and magic.",
    services: ["Variety Show (ஆடல் பாடல் நிகழ்ச்சி)", "Devotional Shows (பக்தி நிகழ்ச்சிகள்)", "Magic Show"],
  },
  {
    title: "Music & Party",
    description: "Professional DJ and party music setups for events and celebrations.",
    services: ["DJ Set"],
  },
  {
    title: "Event Core Services",
    description: "Essential event management services including catering, venue setup, and stage design.",
    services: ["Catering Services", "Marriage Hall Arrangements", "Stage Decorations"],
  },
  {
    title: "Sammy Attam Costumes (8 Feet Traditional Costumes)",
    description: "Towering 8-feet traditional deity and character costumes for grand ceremonial performances.",
    services: ["Karuppasamy Costume", "Different Kalli Costume (Fiber Quality)", "Hanuman Costume", "Varagi Amman Costume", "Narasimha Costume", "Vinayagar Costume", "Tirupati Wedding Entry Costume", "Kantara Costume"],
  },
  {
    title: "Kerala Famous Theyyam Dance",
    description: "13 types of Theyyam available with customization for weddings, festivals, and themed events.",
    services: ["Different Types of Gods", "Political Party Themes", "Kantara Theyyam", "Wedding and Festival Performances"],
  },
  {
    title: "Special Trending Entry Collections",
    description: "Trending and viral grand entry styles for weddings and events.",
    services: ["Realistic Elephant Entry", "Golden Pallakku (Bridal Entry)", "Mascot Costumes", "Madurai Kallalagar Oorvalam", "Amman Oorvalam", "Tirupati Wedding Entry Costume", "Realistic Robot Entry", "Chinese Dancing Lion"],
  },
  {
    title: "Mascot Costumes (6–12 Feet)",
    description: "Large-scale mascot costumes available in various characters for events and promotions.",
    services: ["Gorilla", "Panda", "Rabbit", "Polar Bear", "Duck", "Hulk", "Rooster", "Blue Monster", "Chinese Dragon", "Teddy", "Grey Monster", "Wolf", "Dinosaur", "Cat"],
  },
  {
    title: "Kids & Adult Mascot Costumes (6 Feet)",
    description: "Fun-sized mascot costumes suitable for kids and adults at parties and events.",
    services: ["Dinosaur", "Dragon", "Horse", "Duck", "Alien", "Joker", "Rooster"],
  },
  {
    title: "Additional Event Collections",
    description: "Specialized event add-ons including lighting, effects, and accessories.",
    services: ["Lighting Umbrella", "Devotional Umbrella", "Political Party Umbrella", "Colourful Paper Shots", "Colourful Kavadi Attam", "Devotional Makeup Artists (School and College Events)", "Devotional Costumes, Accessories and Jewelry", "Mic Set / Sound System", "Smoke Entry Effects", "360 Camera Booth", "Horse Chariot", "Fire Entry Effects"],
  },
];

const EventCards = () => {
  const [flipped, setFlipped] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventCategory | null>(null);

  return (
    <>
      <section id="events" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-4xl sm:text-5xl text-center gold-text mb-4">Our Services</h2>
          <p className="text-center text-muted-foreground mb-16 font-body">End-to-end event solutions since 1991</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventCategories.map((event, i) => (
              <div
                key={i}
                className="perspective-1000 h-48 cursor-none"
                onMouseEnter={() => setFlipped(i)}
                onMouseLeave={() => setFlipped(null)}
                onClick={() => { setSelectedEvent(event); setFlipped(null); }}
              >
                <div
                  className={`relative w-full h-full transition-transform duration-700 preserve-3d ${flipped === i ? "rotate-y-180" : ""}`}
                >
                  {/* Front */}
                  <div className="absolute inset-0 backface-hidden bg-card border gold-border rounded-lg flex items-center justify-center gold-glow gold-glow-hover gold-border-hover transition-all duration-300 p-4">
                    <h3 className="font-heading text-lg sm:text-xl gold-text text-center leading-snug">{event.title}</h3>
                  </div>
                  {/* Back */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-card border gold-border rounded-lg flex items-center justify-center p-6 gold-glow">
                    <p className="text-secondary-foreground font-body text-sm text-center leading-relaxed">{event.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full-screen modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div className="absolute inset-0 bg-background/85 backdrop-blur-sm animate-fade-in" />
          <div
            className="relative z-10 w-full max-w-2xl max-h-[85vh] bg-card border gold-border rounded-lg gold-glow animate-fade-in flex flex-col"
            style={{ animationDuration: "0.35s" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start p-8 pb-4 shrink-0">
              <h3 className="font-heading text-2xl sm:text-3xl gold-text leading-snug pr-4">{selectedEvent.title}</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="gold-text opacity-60 hover:opacity-100 transition-opacity cursor-none mt-1 shrink-0"
              >
                <X size={22} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto px-8 pb-8 flex-1 min-h-0">
              <p className="text-muted-foreground font-body text-sm mb-6 leading-relaxed">{selectedEvent.description}</p>
              <ul className="space-y-3">
                {selectedEvent.services.map((service, idx) => (
                  <li key={idx} className="flex items-start gap-3 font-body text-sm text-secondary-foreground">
                    <span className="gold-text mt-1 shrink-0 text-xs">◆</span>
                    <span>{service}</span>
                  </li>
                ))}
              </ul>

              {/* Divider */}
              <div className="my-6 border-t border-[hsl(var(--gold))]/30" />

              {/* Contact Icons */}
              <div className="flex items-center justify-center gap-6">
                <a
                  href="https://wa.me/916380690032"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border border-[hsl(var(--gold))]/50 flex items-center justify-center gold-text opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-300 hover:shadow-[0_0_15px_hsl(var(--gold)/0.3)] cursor-none"
                  title="WhatsApp"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
                <a
                  href="mailto:siddharthvibe.events@gmail.com"
                  className="w-12 h-12 rounded-full border border-[hsl(var(--gold))]/50 flex items-center justify-center gold-text opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-300 hover:shadow-[0_0_15px_hsl(var(--gold)/0.3)] cursor-none"
                  title="Email"
                >
                  <Mail size={22} />
                </a>
                <a
                  href="https://www.instagram.com/siddharth_vibe_events?igsh=MWQ5a2Q5ZjBwZjg3Zw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border border-[hsl(var(--gold))]/50 flex items-center justify-center gold-text opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-300 hover:shadow-[0_0_15px_hsl(var(--gold)/0.3)] cursor-none"
                  title="Instagram"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventCards;
