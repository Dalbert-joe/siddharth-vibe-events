const GallerySection = () => {
  return (
    <section id="gallery" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-heading text-4xl sm:text-5xl text-center gold-text mb-4">Gallery</h2>
        <p className="text-center text-muted-foreground mb-16 font-body">Moments captured in elegance</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] bg-card border gold-border rounded-lg flex items-center justify-center gold-glow-hover gold-border-hover transition-all duration-300"
            >
              <span className="text-muted-foreground text-xs font-body text-center px-4">
                Event media coming soon
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
