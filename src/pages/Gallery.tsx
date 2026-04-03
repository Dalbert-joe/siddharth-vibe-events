import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ImageOff, ShieldCheck, Play } from "lucide-react";
import Navigation from "@/components/Navigation";
import Modal from "@/components/Modal";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Instagram, Mail, MapPin } from "lucide-react";

const INSTAGRAM_URL =
  "https://www.instagram.com/siddharth_vibe_events?igsh=aTExYmU5ZWc5NjBt";

interface GalleryMedia {
  id: string;
  file_name: string;
  public_url: string;
  mime_type: string;
  caption: string | null;
  created_at: string;
}

const GoldFrame = ({ children }: { children: React.ReactNode }) => (
  <div className="relative group">
    <div className="absolute -inset-[3px] rounded-lg bg-gradient-to-br from-[hsl(43,56%,62%)] via-[hsl(43,40%,35%)] to-[hsl(43,56%,62%)] opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative rounded-lg overflow-hidden bg-card">{children}</div>
  </div>
);

// Generates a real thumbnail frame from the video using an offscreen canvas
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
      video.currentTime = Math.min(1, video.duration * 0.1 || 1);
    });
    video.addEventListener("seeked", capture);
    video.addEventListener("error", () => setError(true));
    video.load();

    return () => { video.src = ""; };
  }, [src]);

  return (
    <div className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}
      />
      {!ready && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          {error
            ? <ImageOff size={20} className="text-muted-foreground" />
            : <div className="w-5 h-5 rounded-full border-2 border-[hsl(43,56%,52%)] border-t-transparent animate-spin" />
          }
        </div>
      )}
      {/* Play button overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="w-12 h-12 rounded-full border-2 gold-border flex items-center justify-center gold-glow bg-black/40">
          <Play size={16} className="text-[hsl(43,56%,52%)] ml-0.5" fill="currentColor" />
        </div>
        <span className="text-xs font-body text-muted-foreground mt-2">Click to play</span>
      </div>
    </div>
  );
};

const MediaItem = ({ item, onClick }: { item: GalleryMedia; onClick: () => void }) => {
  const [imgError, setImgError] = useState(false);
  const isVideo = item.mime_type?.startsWith("video/");

  return (
    <GoldFrame>
      <div
        className="aspect-[4/3] cursor-none overflow-hidden bg-secondary flex items-center justify-center relative"
        onClick={onClick}
      >
        {isVideo ? (
          <VideoThumbnail src={item.public_url} />
        ) : imgError ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageOff size={24} />
            <span className="text-xs font-body">Media unavailable</span>
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
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
      </div>
      {item.caption && (
        <div className="px-3 py-2 border-t gold-border">
          <p className="text-xs text-muted-foreground font-body truncate">{item.caption}</p>
        </div>
      )}
    </GoldFrame>
  );
};

const Gallery = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [media, setMedia] = useState<GalleryMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<GalleryMedia | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const handleOpenFeedback = () => {
    if (!user) {
      navigate("/login", { state: { returnTo: "/gallery", openFeedback: true } });
      return;
    }
    setFeedbackOpen(true);
  };

  useEffect(() => {
    supabase.from("page_views").insert({ page: "gallery" });

    supabase
      .from("gallery_media")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError("Failed to load gallery.");
        else setMedia(data || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("gallery_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "gallery_media" }, (payload) => {
        setMedia((prev) => [payload.new as GalleryMedia, ...prev]);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "gallery_media" }, (payload) => {
        setMedia((prev) => prev.filter((m) => m.id !== payload.old.id));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="min-h-screen bg-background cursor-none">
      <Navigation
        onOpenAbout={() => setAboutOpen(true)}
        onOpenSupport={() => setSupportOpen(true)}
        onOpenFeedback={handleOpenFeedback}
      />

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">

          <div className="flex items-center justify-between mb-10">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm font-body gold-text opacity-70 hover:opacity-100 transition-opacity cursor-none"
            >
              <ArrowLeft size={16} /> Back to Home
            </button>

            {isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2 px-4 py-2 border gold-border rounded text-xs font-body gold-text hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all cursor-none"
              >
                <ShieldCheck size={14} /> Admin Panel
              </button>
            )}
          </div>

          <h1 className="font-heading text-5xl gold-text text-center mb-4">Gallery</h1>
          <p className="text-center text-muted-foreground font-body mb-16">
            Moments captured in elegance
          </p>

          {loading && (
            <div className="flex justify-center items-center py-32">
              <div className="w-10 h-10 rounded-full border-2 border-[hsl(43,56%,52%)] border-t-transparent animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-20 text-muted-foreground font-body">{error}</div>
          )}

          {!loading && !error && media.length === 0 && (
            <div className="text-center py-20 text-muted-foreground font-body">
              No media uploaded yet.
              {isAdmin && (
                <p className="mt-2 text-sm">
                  <button onClick={() => navigate("/admin")} className="gold-text underline cursor-none">
                    Go to Admin Panel
                  </button>{" "}to upload photos & videos.
                </p>
              )}
            </div>
          )}

          {media.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.map((item) => (
                <MediaItem key={item.id} item={item} onClick={() => setSelectedMedia(item)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-background/95 backdrop-blur-sm cursor-none"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <GoldFrame>
              {selectedMedia.mime_type?.startsWith("video/") ? (
                <video src={selectedMedia.public_url} controls autoPlay className="w-full aspect-video" />
              ) : (
                <img src={selectedMedia.public_url} alt={selectedMedia.file_name} className="w-full max-h-[80vh] object-contain" />
              )}
            </GoldFrame>
            {selectedMedia.caption && (
              <p className="text-center text-sm gold-text font-body mt-3">{selectedMedia.caption}</p>
            )}
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute -top-4 -right-4 w-9 h-9 rounded-full bg-card border gold-border flex items-center justify-center gold-text hover:opacity-80 cursor-none text-sm"
            >✕</button>
          </div>
        </div>
      )}

      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title="About Us">
        <div className="space-y-4 text-secondary-foreground font-body text-sm leading-relaxed">
          <p>Since 1991, Siddharth Vibe Events has been a cornerstone of comprehensive event management in Tamil Nadu.</p>
          <p>We provide end-to-end solutions for grand weddings, traditional temple functions, cultural folk programs, and high-profile government events.</p>
          <p>Based in Madurai, we bring over three decades of expertise and unwavering commitment to excellence.</p>
        </div>
      </Modal>

      <Modal open={supportOpen} onClose={() => setSupportOpen(false)} title="Contact & Support">
        <div className="space-y-5 font-body text-sm">
          <div className="flex items-start gap-3">
            <MapPin size={18} className="gold-text mt-0.5 shrink-0" />
            <p className="text-secondary-foreground leading-relaxed">
              28, Nelmandi Mahal Sanathi Street<br />
              Thiruparankundram, Madurai<br />
              Tamil Nadu 625005, India
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Mail size={18} className="gold-text shrink-0" />
            <a href="mailto:siddharthvibe.events@gmail.com" className="text-secondary-foreground hover:text-primary transition-colors cursor-none">
              siddharthvibe.events@gmail.com
            </a>
          </div>
          <div className="flex gap-3 pt-2">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-secondary rounded font-medium text-secondary-foreground hover:bg-muted transition-colors cursor-none">
              <Instagram size={16} /> Instagram
            </a>
            <a href="mailto:siddharthvibe.events@gmail.com"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded font-medium hover:opacity-90 transition-opacity cursor-none">
              <Mail size={16} /> Email
            </a>
          </div>
        </div>
      </Modal>

      <Modal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} title="Feedback">
        <p className="text-muted-foreground font-body text-sm">Please visit the home page to submit your feedback.</p>
      </Modal>
    </div>
  );
};

export default Gallery;
