import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ImageOff, Play } from "lucide-react";
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

// Generates a thumbnail from a video URL by loading it into an offscreen video element
const VideoThumbnail = ({ src }: { src: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.preload = "metadata";
    video.src = src;

    const capture = () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 240;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        setReady(true);
      } catch {
        setError(true);
      }
    };

    video.addEventListener("loadeddata", () => {
      // Seek to 1s (or 10% of duration) to get a real frame
      video.currentTime = Math.min(1, video.duration * 0.1 || 1);
    });

    video.addEventListener("seeked", capture);
    video.addEventListener("error", () => setError(true));

    video.load();

    return () => {
      video.src = "";
    };
  }, [src]);

  return (
    <div className="w-full h-full relative">
      {/* Canvas thumbnail — hidden until ready */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}
        style={{ position: "absolute", inset: 0 }}
      />

      {/* Fallback dark background shown while loading or on error */}
      {!ready && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          {error ? (
            <ImageOff size={20} className="text-muted-foreground" />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-[hsl(43,56%,52%)] border-t-transparent animate-spin" />
          )}
        </div>
      )}

      {/* Play icon overlay — always shown on video */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center border border-[hsl(43,56%,52%)]/60">
          <Play size={16} className="text-[hsl(43,56%,62%)] ml-0.5" fill="currentColor" />
        </div>
      </div>
    </div>
  );
};

const PreviewItem = ({ item }: { item: GalleryMedia }) => {
  const [imgError, setImgError] = useState(false);
  const isVideo = item.mime_type?.startsWith("video/");

  return (
    <GoldFrame>
      <div className="aspect-[4/3] overflow-hidden bg-secondary flex items-center justify-center relative">
        {isVideo ? (
          <VideoThumbnail src={item.public_url} />
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
      .limit(6) // Only first 6 items
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
          // Placeholder: strictly 2 rows × 3 cols = 6 cells
          <div className="grid grid-cols-3 gap-5 mb-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <GoldFrame key={i}>
                <div className="aspect-[4/3] bg-card flex items-center justify-center">
                  <span className="text-muted-foreground text-xs font-body text-center px-4">Coming soon</span>
                </div>
              </GoldFrame>
            ))}
          </div>
        ) : (
          // Strictly 2 rows × 3 cols — slice to max 6 items
          <div className="grid grid-cols-3 gap-5 mb-12">
            {previews.slice(0, 6).map((item) => (
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
