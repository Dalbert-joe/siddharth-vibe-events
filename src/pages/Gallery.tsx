import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, ImageOff } from "lucide-react";
import Navigation from "@/components/Navigation";
import Modal from "@/components/Modal";
import { useAuth } from "@/contexts/AuthContext";
import { Instagram, Mail, MapPin } from "lucide-react";

const INSTAGRAM_URL =
  "https://www.instagram.com/siddharth_vibe_events?igsh=aTExYmU5ZWc5NjBt";

interface MediaFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailUrl: string | null;
  directUrl: string;
  embedUrl: string | null;
}

interface Book {
  id: string;
  name: string;
  files: MediaFile[];
  coverUrl: string | null;
}

const GoldFrame = ({ children }: { children: React.ReactNode }) => (
  <div className="relative group">
    <div className="absolute -inset-[3px] rounded-lg bg-gradient-to-br from-[hsl(43,56%,62%)] via-[hsl(43,40%,35%)] to-[hsl(43,56%,62%)] opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative rounded-lg overflow-hidden bg-card">{children}</div>
  </div>
);

const MediaItem = ({
  file,
  onClick,
}: {
  file: MediaFile;
  onClick: () => void;
}) => {
  const [imgError, setImgError] = useState(false);
  const isVideo = file.mimeType?.startsWith("video/");
  const src = file.thumbnailUrl || file.directUrl;

  return (
    <GoldFrame>
      <div
        className="aspect-[4/3] cursor-none overflow-hidden bg-secondary flex items-center justify-center relative"
        onClick={onClick}
      >
        {isVideo ? (
          <div className="w-full h-full flex items-center justify-center bg-black/50">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-2 gold-border flex items-center justify-center mx-auto mb-2 gold-glow">
                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[16px] border-l-[hsl(43,56%,52%)] border-b-[8px] border-b-transparent ml-1" />
              </div>
              <span className="text-xs font-body text-muted-foreground">
                Click to play
              </span>
            </div>
          </div>
        ) : imgError ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageOff size={24} />
            <span className="text-xs font-body">Media unavailable</span>
          </div>
        ) : (
          <img
            src={src}
            alt={file.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
      </div>
    </GoldFrame>
  );
};

const Gallery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openBooks, setOpenBooks] = useState<Set<string>>(new Set());
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
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
    fetch("/api/drive")
      .then((r) => r.json())
      .then((data) => {
        setBooks(data.books || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load gallery. Please try again.");
        setLoading(false);
      });
  }, []);

  const toggleBook = (id: string) => {
    setOpenBooks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        onOpenAbout={() => setAboutOpen(true)}
        onOpenSupport={() => setSupportOpen(true)}
        onOpenFeedback={handleOpenFeedback}
      />

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm font-body gold-text opacity-70 hover:opacity-100 transition-opacity cursor-none"
            >
              <ArrowLeft size={16} /> Back to Home
            </button>
          </div>

          <h1 className="font-heading text-5xl gold-text text-center mb-4">
            Gallery
          </h1>
          <p className="text-center text-muted-foreground font-body mb-16">
            Moments captured in elegance
          </p>

          {loading && (
            <div className="flex justify-center items-center py-32">
              <div className="w-10 h-10 rounded-full border-2 border-[hsl(43,56%,52%)] border-t-transparent animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-20 text-muted-foreground font-body">
              {error}
            </div>
          )}

          {!loading && !error && books.length === 0 && (
            <div className="text-center py-20 text-muted-foreground font-body">
              No gallery albums found yet.
            </div>
          )}

          <div className="space-y-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-card border gold-border rounded-lg overflow-hidden gold-glow"
              >
                <button
                  className="w-full flex items-center justify-between p-6 cursor-none hover:bg-secondary/30 transition-colors"
                  onClick={() => toggleBook(book.id)}
                >
                  <div className="flex items-center gap-4">
                    {book.coverUrl && (
                      <div className="w-14 h-14 rounded overflow-hidden border gold-border shrink-0">
                        <img
                          src={book.coverUrl}
                          alt={book.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <div className="text-left">
                      <h2 className="font-heading text-xl gold-text">
                        {book.name}
                      </h2>
                      <p className="text-xs text-muted-foreground font-body mt-0.5">
                        {book.files.length}{" "}
                        {book.files.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </div>
                  <div className="gold-text opacity-60">
                    {openBooks.has(book.id) ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </div>
                </button>

                {openBooks.has(book.id) && (
                  <div className="px-6 pb-6">
                    <div className="border-t gold-border mb-6" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {book.files.map((file) => (
                        <MediaItem
                          key={file.id}
                          file={file}
                          onClick={() => setSelectedMedia(file)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-background/95 backdrop-blur-sm"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <GoldFrame>
              {selectedMedia.mimeType?.startsWith("video/") ? (
                <iframe
                  src={selectedMedia.embedUrl || ""}
                  className="w-full aspect-video"
                  allow="autoplay"
                  allowFullScreen
                />
              ) : (
                <img
                  src={selectedMedia.directUrl}
                  alt={selectedMedia.name}
                  className="w-full max-h-[80vh] object-contain"
                />
              )}
            </GoldFrame>
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute -top-4 -right-4 w-9 h-9 rounded-full bg-card border gold-border flex items-center justify-center gold-text hover:opacity-80 cursor-none text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* About Modal */}
      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title="About Us">
        <div className="space-y-4 text-secondary-foreground font-body text-sm leading-relaxed">
          <p>Since 1991, Siddharth Vibe Events has been a cornerstone of comprehensive event management in Tamil Nadu.</p>
          <p>We provide end-to-end solutions for grand weddings, traditional temple functions, cultural folk programs, and high-profile government events.</p>
          <p>Based in Madurai, we bring over three decades of expertise and unwavering commitment to excellence.</p>
        </div>
      </Modal>

      {/* Support Modal */}
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

      {/* Feedback Modal */}
      <Modal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} title="Feedback">
        <p className="text-muted-foreground font-body text-sm">Please visit the home page to submit your feedback.</p>
      </Modal>
    </div>
  );
};

export default Gallery;
