import { useNavigate } from "react-router-dom";

// Import the uploaded mascot sticker image
// Place the sticker image in: public/images/mascot-sticker.png
// (rename your uploaded image to mascot-sticker.png and put it there)

const ProductsHomeSection = () => {
  const navigate = useNavigate();

  return (
    <section id="products-preview" className="py-24 px-6 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section heading */}
        <h2 className="font-heading text-4xl sm:text-5xl text-center gold-text mb-4">
          Our Products
        </h2>
        <p className="text-center text-muted-foreground mb-16 font-body">
          Export-quality inflatable costumes &amp; mascots for sale &amp; rental
        </p>

        {/* Main card */}
        <div className="relative flex flex-col lg:flex-row items-center gap-10 lg:gap-16 bg-card/60 border gold-border rounded-2xl p-8 sm:p-12 gold-glow backdrop-blur-sm">

          {/* Left: text content */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="inline-block px-3 py-1 rounded-full border gold-border gold-text font-body text-xs tracking-widest uppercase mb-2">
              Since 1991
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl gold-text leading-snug">
              Mascot Costumes &amp; <br className="hidden sm:block" />Inflatable Characters
            </h3>
            <p className="text-muted-foreground font-body text-sm leading-relaxed max-w-md mx-auto lg:mx-0">
              From towering 12-foot mascots to adorable 6-foot characters — our premium export-quality
              costumes are available for <span className="gold-text font-medium">sale &amp; rental</span> across Tamil Nadu and beyond.
            </p>

            {/* Feature tags */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {["Gorilla", "Teddy Bear", "Dinosaur", "Duck", "Rooster", "Panda", "+ More"].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-primary/10 border border-[hsl(var(--gold))]/20 gold-text font-body text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA button */}
            <div className="pt-2">
              <button
                onClick={() => navigate("/products")}
                className="cursor-none inline-flex items-center gap-3 px-8 py-3.5 bg-primary text-primary-foreground font-heading text-sm tracking-wide rounded-lg hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-[0_0_30px_hsl(var(--gold)/0.3)]"
              >
                View Products
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Right: mascot sticker image */}
          <div className="relative flex-shrink-0 flex items-center justify-center">
            {/* Glow ring behind image */}
            <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl scale-110" />

            <img
              src="/mascots.png"
              alt="Siddharth Vibe Events Mascot Costumes"
              className="relative z-10 w-64 sm:w-72 lg:w-80 object-contain drop-shadow-[0_0_30px_hsl(43,56%,52%,0.4)] animate-float"
              style={{
                filter: "drop-shadow(0 0 24px hsl(43 56% 52% / 0.35))",
              }}
            />

            {/* Decorative corner sparkles */}
            <span className="absolute top-2 right-4 text-primary opacity-60 text-xl animate-pulse">✦</span>
            <span className="absolute bottom-4 left-2 text-primary opacity-40 text-sm animate-pulse" style={{ animationDelay: "0.5s" }}>✦</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductsHomeSection;
