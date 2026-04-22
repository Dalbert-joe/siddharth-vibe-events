import { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";

const Event3DModal = lazy(() => import("@/components/Event3DModal"));

interface EventCategory {
  title: string;
  description: string;
  services: string[];
  gallerySlug: string;
}

const eventCategories: EventCategory[] = [
  {
    title: "Temple Processions (Sammy Oorvalam)",
    description: "Traditional temple procession performances and devotional ceremonial entries for festivals and weddings.",
    services: ["Madurai Famous Kallalagar Oorvalam", "Amman Oorvalam"],
    gallerySlug: "temple-processions",
  },
  {
    title: "Welcome & Wedding Entry Performances",
    description: "Elegant welcome dances and grand wedding stage entry performances for memorable celebrations.",
    services: ["Layer Skirt Lotus Welcome Dance", "Welcome Girls Dance Team", "Wedding Stage Welcome Dance Performance"],
    gallerySlug: "wedding-entry",
  },
  {
    title: "Event Food Stalls",
    description: "Curated food and beverage stall setups for events, weddings, and festivals.",
    services: ["Popcorn Stall", "Ice Cream Stall", "Panjumittai (Cotton Candy) Stall", "Beeda Stall", "Mehendi Stall", "Tea / Coffee / Badam Milk Stall"],
    gallerySlug: "food-stalls",
  },
  {
    title: "Fun Character & Welcome Costumes",
    description: "Entertaining character costumes for event welcomes and kids' entertainment.",
    services: ["Mickey Mouse Costume (Pair)", "Teddy Costume (Pair)", "Chettiar Costume (Pair)", "Joker Costume", "Chettiar Solo Costume", "Chotta Bheem Costume", "Fat Man Costume"],
    gallerySlug: "character-costumes",
  },
  {
    title: "Musical Instrument Performances",
    description: "Live traditional and contemporary musical instrument performances for all occasions.",
    services: ["Kerala Special Chenda Melam", "Drum Set Performance", "Nadaswaram", "Thappattam"],
    gallerySlug: "musical-instruments",
  },
  {
    title: "Traditional Tamil Folk Dances (கிராமிய நிகழ்ச்சிகள்)",
    description: "Authentic Tamil folk dance performances rooted in cultural heritage and tradition.",
    services: ["Madu Attam", "Mayil Attam", "Poyikkal Kuthirai Attam", "Kattai Kal Attam (Kokkalikattai Attam)", "Oyilattam", "Karakattam", "Pulli Attam", "Karadi Attam"],
    gallerySlug: "folk-dances",
  },
  {
    title: "Entertainment Shows",
    description: "Variety entertainment programs including music, devotional performances, and magic.",
    services: ["Variety Show (ஆடல் பாடல் நிகழ்ச்சி)", "Devotional Shows (பக்தி நிகழ்ச்சிகள்)", "Magic Show"],
    gallerySlug: "entertainment-shows",
  },
  {
    title: "Music & Party",
    description: "Professional DJ and party music setups for events and celebrations.",
    services: ["DJ Set"],
    gallerySlug: "music-party",
  },
  {
    title: "Event Core Services",
    description: "Essential event management services including catering, venue setup, and stage design.",
    services: ["Catering Services", "Marriage Hall Arrangements", "Stage Decorations"],
    gallerySlug: "core-services",
  },
  {
    title: "Sammy Attam Costumes (8 Feet Traditional Costumes)",
    description: "Towering 8-feet traditional deity and character costumes for grand ceremonial performances.",
    services: ["Karuppasamy Costume", "Different Kalli Costume (Fiber Quality)", "Hanuman Costume", "Varagi Amman Costume", "Narasimha Costume", "Vinayagar Costume", "Tirupati Wedding Entry Costume", "Kantara Costume"],
    gallerySlug: "sammy-attam",
  },
  {
    title: "Kerala Famous Theyyam Dance",
    description: "13 types of Theyyam available with customization for weddings, festivals, and themed events.",
    services: ["Different Types of Gods", "Political Party Themes", "Kantara Theyyam", "Wedding and Festival Performances"],
    gallerySlug: "theyyam-dance",
  },
  {
    title: "Special Trending Entry Collections",
    description: "Trending and viral grand entry styles for weddings and events.",
    services: ["Realistic Elephant Entry", "Golden Pallakku (Bridal Entry)", "Mascot Costumes", "Madurai Kallalagar Oorvalam", "Amman Oorvalam", "Tirupati Wedding Entry Costume", "Realistic Robot Entry", "Chinese Dancing Lion"],
    gallerySlug: "trending-entries",
  },
  {
    title: "Mascot Costumes (6–12 Feet)",
    description: "Large-scale mascot costumes available in various characters for events and promotions.",
    services: ["Gorilla", "Panda", "Rabbit", "Polar Bear", "Duck", "Hulk", "Rooster", "Blue Monster", "Chinese Dragon", "Teddy", "Grey Monster", "Wolf", "Dinosaur", "Cat"],
    gallerySlug: "mascot-large",
  },
  {
    title: "Kids & Adult Mascot Costumes (6 Feet)",
    description: "Fun-sized mascot costumes suitable for kids and adults at parties and events.",
    services: ["Dinosaur", "Dragon", "Horse", "Duck", "Alien", "Joker", "Rooster"],
    gallerySlug: "mascot-small",
  },
  {
    title: "Additional Event Collections",
    description: "Specialized event add-ons including lighting, effects, and accessories.",
    services: ["Lighting Umbrella", "Devotional Umbrella", "Political Party Umbrella", "Colourful Paper Shots", "Colourful Kavadi Attam", "Devotional Makeup Artists (School and College Events)", "Devotional Costumes, Accessories and Jewelry", "Mic Set / Sound System", "Smoke Entry Effects", "360 Camera Booth", "Horse Chariot", "Fire Entry Effects"],
    gallerySlug: "additional-collections",
  },
];

const EventCards = () => {
  const navigate = useNavigate();
  const [flipped, setFlipped] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventCategory | null>(null);

  const handleViewGallery = (e: React.MouseEvent, slug: string) => {
    e.stopPropagation();
    navigate(`/gallery?cluster=${slug}`);
  };

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
                className="perspective-1000 cursor-none"
                style={{ height: "200px" }}
                onMouseEnter={() => setFlipped(i)}
                onMouseLeave={() => setFlipped(null)}
                onClick={() => { setSelectedEvent(event); setFlipped(null); }}
              >
                <div
                  className={`relative w-full h-full transition-transform duration-700 preserve-3d ${flipped === i ? "rotate-y-180" : ""}`}
                >
                  {/* Front */}
                  <div className="absolute inset-0 backface-hidden bg-card border gold-border rounded-lg flex flex-col items-center justify-center gold-glow gold-glow-hover gold-border-hover transition-all duration-300 p-4 gap-3">
                    <h3 className="font-heading text-lg sm:text-xl gold-text text-center leading-snug">{event.title}</h3>
                    <button
                      onClick={(e) => handleViewGallery(e, event.gallerySlug)}
                      className="text-[10px] font-body uppercase tracking-widest gold-text opacity-50 hover:opacity-100 border-b border-[hsl(43,56%,52%,0.3)] hover:border-[hsl(43,56%,52%)] transition-all pb-0.5 cursor-none"
                    >
                      View Gallery →
                    </button>
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

      {selectedEvent && (
        <Suspense fallback={null}>
          <Event3DModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        </Suspense>
      )}
    </>
  );
};

export default EventCards;
