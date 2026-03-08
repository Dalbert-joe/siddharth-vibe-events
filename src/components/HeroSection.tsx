import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})`, filter: "blur(3px) brightness(0.3)" }}
      />
      <div className="absolute inset-0 bg-background/60" />
      <div className="relative z-10 text-center px-6">
        <h1
          className="font-heading text-5xl sm:text-7xl md:text-8xl font-bold gold-text tracking-wide"
          style={{ textShadow: "0 8px 40px hsla(43,56%,52%,0.4), 0 2px 10px hsla(0,0%,0%,0.8)" }}
        >
          Siddharth Vibe Events
        </h1>
        <p className="mt-6 text-lg sm:text-xl font-body gold-text-light tracking-widest uppercase opacity-80">
          Premium Event Management Since 1991
        </p>
        <div className="mt-2 text-sm font-body text-muted-foreground tracking-wider">Madurai, Tamil Nadu</div>
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-6 h-10 rounded-full border-2 gold-border flex items-start justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-primary animate-glow-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
