import { MapPin } from "lucide-react";

const services = [
  { title: "Stage Setup", description: "Professional stage construction and setup for events of all scales." },
  { title: "Speakers & Sound", description: "High-quality speaker systems and audio equipment for any venue." },
  { title: "DJ Services", description: "Professional DJ services with modern equipment and curated playlists." },
  { title: "Event Decoration", description: "Premium event decoration including floral, lighting, and thematic designs." },
];

const AreaRestrictions = () => (
  <section className="py-24 px-6">
    <div className="max-w-6xl mx-auto">
      <h2 className="font-heading text-4xl sm:text-5xl text-center gold-text mb-4">
        Service Coverage
      </h2>
      <p className="text-center text-muted-foreground mb-16 font-body">
        Select services available in specific regions
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, i) => (
          <div
            key={i}
            className="bg-card border gold-border rounded-lg p-6 gold-glow hover:gold-glow-hover gold-border-hover transition-all duration-300 hover:-translate-y-1 flex flex-col"
          >
            <h3 className="font-heading text-xl gold-text mb-3">{service.title}</h3>
            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-5 flex-1">
              {service.description}
            </p>
            <div className="flex items-center gap-2 px-3 py-2 rounded bg-primary/10 border border-primary/30">
              <MapPin size={14} className="gold-text shrink-0" />
              <span className="text-xs font-body gold-text leading-tight">
                Madurai & surrounding areas
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AreaRestrictions;
