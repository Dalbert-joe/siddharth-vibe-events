import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImageOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface GalleryMedia {
  id: string;
  file_name: string;
  public_url: string;
  mime_type: string;
  caption: string | null;
}

const GoldFrame = ({ children }: { children: React.ReactNode }) => (
  <div className="relative group">
    <div className="absolute -inset-[3px] rounded-lg bg-gradient-to-br from-[hsl(43,56%,62%)] via-[hsl(43,40%,35%)] to-[hsl(43,56%,62%)] opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative rounded-lg overflow-hidden bg-card">{children}</div>
  </div>
);

const PreviewItem = ({ item }: { item: GalleryMedia }) => {
  const [imgError, setImgError] = useState(false);
  const isVideo = item.mime_type?.startsWith("video/");

  return (
    <GoldFrame>
      <div className="aspect-[4/3] overflow-hidden bg-secondary flex items-center justify-center">
        {isVideo ? (
          <div className="w-full h-full flex items-center justify-center bg-black/40">
            <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[20px] border-l-[hsl(43,56%,52%)] border-b-[10px] border-b-transparent" />
          </div>
        ) : imgError ? (
          <div className="flex items-center justify-center text-muted-foreground">
            <ImageOff size={20} />
          </div>
        ) : (
          <img
            src={item.public_url}
            alt={item.file_name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}
      </div>
    </GoldFrame>
  );
};

const GallerySection = () => {
  const navigate = useNavigate();
  const [previews, setPreviews] = useState<GalleryMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("gallery_media")
      .select("id, file_name, public_url, mime_type, caption")
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        setPreviews(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section id="gallery" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-heading text-4xl sm:text-5xl text-center gold-text mb-4">
          Gallery
        </h2>
        <p className="text-center text-muted-foreground mb-16 font-body">
          Moments captured in elegance
        </p>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-[hsl(43,56%,52%)] border-t-transparent animate-spin" />
          </div>
        ) : previews.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-12">
            {Array.from({ length: 4 }).map((_, i) => (
              <GoldFrame key={i}>
                <div className="aspect-[4/3] bg-card flex items-center justify-center">
                  <span className="text-muted-foreground text-xs font-body text-center px-4">Coming soon</span>
                </div>
              </GoldFrame>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-12">
            {previews.map((item) => (
              <PreviewItem key={item.id} item={item} />
            ))}
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => navigate("/gallery")}
            className="inline-flex items-center gap-3 px-8 py-3.5 border gold-border rounded gold-text font-body text-sm tracking-wider uppercase hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 cursor-none gold-glow hover:gold-glow-hover"
          >
            Visit Gallery <span className="text-lg">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
