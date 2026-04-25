import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ImageOff, Play, FolderPlus, X, MessageSquare } from "lucide-react";
import Navigation from "@/components/Navigation";
import Modal from "@/components/Modal";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Instagram, Mail, MapPin } from "lucide-react";

const INSTAGRAM_URL = "https://www.instagram.com/siddharth_vibe_events?igsh=aTExYmU5ZWc5NjBt";

interface GalleryMedia {
  id: string;
  file_name: string;
  public_url: string;
  mime_type: string;
  caption: string | null;
  group_id: string | null;
  created_at: string;
}

interface GalleryGroup {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

interface FeedbackItem {
  id: string;
  name: string;
  phone: string;
  message: string;
  created_at: string;
}

const GoldFrame = ({ children }: { children: React.ReactNode }) => (
  <div className="relative group">
    <div className="absolute -inset-[3px] rounded-lg bg-gradient-to-br from-[hsl(43,56%,62%)] via-[hsl(43,40%,35%)] to-[hsl(43,56%,62%)] opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative rounded-lg overflow-hidden bg-card">{children}</div>
  </div>
);

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
      } catch { setError(true); }
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
            : <div className="w-5 h-5 rounded-full border-2 border-[hsl(43,56%,52%)] border-t-transparent animate-spin" />}
        </div>
      )}
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
        className="aspect-[5/7] cursor-none overflow-hidden bg-secondary flex items-center justify-center relative"
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

// ── Admin Cluster Manager ─────────────────────────────────────────────────────
const AdminClusterManager = ({
  groups,
  media,
  onGroupsChange,
}: {
  groups: GalleryGroup[];
  media: GalleryMedia[];
  onGroupsChange: () => void;
}) => {
  const [showForm, setShowForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = async () => {
    if (!newGroupName.trim()) return;
    setSaving(true);
    const slug = `${newGroupName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}-${Date.now()}`;
    const { error } = await supabase.from("gallery_groups").insert({
      name: newGroupName.trim(),
      slug,
      sort_order: groups.length,
    });
    setSaving(false);
    if (error) { showMsg("Failed to create cluster."); return; }
    showMsg(`Cluster "${newGroupName.trim()}" created!`);
    setNewGroupName("");
    setShowForm(false);
    onGroupsChange();
  };

  const handleDelete = async (group: GalleryGroup) => {
    if (group.slug === "general") { showMsg("Cannot delete the General cluster."); return; }
    if (!confirm(`Delete cluster "${group.name}"? Media will become ungrouped.`)) return;
    const { error } = await supabase.from("gallery_groups").delete().eq("id", group.id);
    if (error) { showMsg("Failed to delete."); return; }
    showMsg("Cluster deleted.");
    onGroupsChange();
  };

  return (
    <div className="bg-card border gold-border rounded-lg p-5 gold-glow mb-8">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg bg-card border gold-border text-sm font-body gold-text shadow-xl">
          {toast}
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg gold-text">Manage Clusters</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-body hover:opacity-90 cursor-none"
        >
          <FolderPlus size={13} /> New Cluster
        </button>
      </div>

      {showForm && (
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Cluster name (e.g. Wedding Events)"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="flex-1 px-4 py-2.5 bg-secondary border gold-border rounded text-sm font-body gold-text placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors cursor-none"
          />
          <button
            onClick={handleCreate}
            disabled={saving || !newGroupName.trim()}
            className="px-5 py-2 bg-primary text-primary-foreground rounded text-sm font-body hover:opacity-90 cursor-none disabled:opacity-50"
          >
            {saving ? "..." : "Create"}
          </button>
          <button
            onClick={() => { setShowForm(false); setNewGroupName(""); }}
            className="px-3 py-2 border gold-border rounded text-sm gold-text hover:bg-secondary cursor-none"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground font-body">No clusters yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {groups.map((g) => (
            <div key={g.id} className="flex items-center gap-2 px-3 py-1.5 bg-secondary border gold-border rounded-full text-xs font-body gold-text">
              {g.name}
              <span className="text-muted-foreground">({media.filter((m) => m.group_id === g.id).length})</span>
              {g.slug !== "general" && (
                <button
                  onClick={() => handleDelete(g)}
                  className="text-destructive/60 hover:text-destructive cursor-none transition-colors"
                >
                  <X size={11} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Public Feedback Panel ─────────────────────────────────────────────────────
const PublicFeedbackPanel = () => {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setFeedbackList(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <section className="py-16 px-6 border-t gold-border">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <MessageSquare size={20} className="gold-text" />
          <h2 className="font-heading text-3xl gold-text">What People Say</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-[hsl(43,56%,52%)] border-t-transparent animate-spin" />
          </div>
        ) : feedbackList.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground font-body">
            No feedback yet. Be the first to share your experience!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {feedbackList.map((fb) => (
              <div
                key={fb.id}
                className="bg-card border gold-border rounded-lg p-5 gold-glow hover:gold-glow-hover transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-heading text-sm gold-text font-bold">{fb.name}</p>
                  </div>
                  <span className="text-[9px] text-muted-foreground font-body text-right shrink-0 ml-2">
                    {new Date(fb.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="border-t gold-border pt-3">
                  <p className="text-sm font-body text-secondary-foreground leading-relaxed">{fb.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// ── Gallery Page ──────────────────────────────────────────────────────────────
const Gallery = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAdmin } = useAuth();

  const [media, setMedia] = useState<GalleryMedia[]>([]);
  const [groups, setGroups] = useState<GalleryGroup[]>([]);
  const [activeGroup, setActiveGroup] = useState<string>("all");
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

  const loadGroups = async () => {
    const { data } = await supabase
      .from("gallery_groups")
      .select("id, name, slug, sort_order")
      .order("sort_order", { ascending: true });
    return data || [];
  };

  const loadMedia = async () => {
    const { data, error: err } = await supabase
      .from("gallery_media")
      .select("*")
      .order("created_at", { ascending: false });
    if (err) setError("Failed to load gallery.");
    return data || [];
  };

  useEffect(() => {
    supabase.from("page_views").insert({ page: "gallery" });

    Promise.all([loadMedia(), loadGroups()]).then(([mediaData, groupsData]) => {
      setMedia(mediaData);
      setGroups(groupsData);
      setLoading(false);

      // ✅ Auto-select cluster from URL ?cluster=slug
      const clusterSlug = searchParams.get("cluster");
      if (clusterSlug) {
        const matched = groupsData.find((g) => g.slug === clusterSlug);
        if (matched) setActiveGroup(matched.id);
      }
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

  const filteredMedia = activeGroup === "all"
    ? media
    : media.filter((m) => m.group_id === activeGroup);

  const groupsWithMedia = groups.filter((g) => g.slug !== "general");

  return (
    <div className="min-h-screen bg-background cursor-none">
      <Navigation
        onOpenAbout={() => setAboutOpen(true)}
        onOpenSupport={() => setSupportOpen(true)}
        onOpenFeedback={handleOpenFeedback}
      />

      <div className="pt-24 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm font-body gold-text opacity-70 hover:opacity-100 transition-opacity cursor-none"
            >
              <ArrowLeft size={16} /> Back to Home
            </button>
          </div>

          <h1 className="font-heading text-5xl gold-text text-center mb-4">Gallery</h1>
          <p className="text-center text-muted-foreground font-body mb-8">Moments captured in elegance</p>

          {/* Admin Cluster Manager — admin only */}
          {isAdmin && (
            <AdminClusterManager
              groups={groups}
              media={media}
              onGroupsChange={() => {
                Promise.all([loadMedia(), loadGroups()]).then(([m, g]) => {
                  setMedia(m);
                  setGroups(g);
                });
              }}
            />
          )}

          {/* Group filter tabs */}
          {!loading && groupsWithMedia.length > 0 && (
            <div className="flex gap-2 flex-wrap justify-center mb-10">
              <button
                onClick={() => setActiveGroup("all")}
                className={`px-5 py-2 rounded-full text-xs font-body tracking-wider uppercase transition-all cursor-none
                  ${activeGroup === "all" ? "bg-primary text-primary-foreground" : "border gold-border gold-text opacity-60 hover:opacity-100"}`}
              >
                All ({media.length})
              </button>
              {groupsWithMedia.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setActiveGroup(g.id)}
                  className={`px-5 py-2 rounded-full text-xs font-body tracking-wider uppercase transition-all cursor-none
                    ${activeGroup === g.id ? "bg-primary text-primary-foreground" : "border gold-border gold-text opacity-60 hover:opacity-100"}`}
                >
                  {g.name} ({media.filter((m) => m.group_id === g.id).length})
                </button>
              ))}
            </div>
          )}

          {loading && (
            <div className="flex justify-center items-center py-32">
              <div className="w-10 h-10 rounded-full border-2 border-[hsl(43,56%,52%)] border-t-transparent animate-spin" />
            </div>
          )}

          {error && <div className="text-center py-20 text-muted-foreground font-body">{error}</div>}

          {!loading && !error && filteredMedia.length === 0 && (
            <div className="text-center py-20 text-muted-foreground font-body">
              {activeGroup === "all" ? "No media uploaded yet." : "No media in this cluster yet."}
            </div>
          )}

          {filteredMedia.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-16">
              {filteredMedia.map((item) => (
                <MediaItem key={item.id} item={item} onClick={() => setSelectedMedia(item)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Public feedback panel — visible to everyone */}
      <PublicFeedbackPanel />

      {/* Lightbox */}
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
            <button
              onClick={() => { window.location.href = "mailto:siddharthvibe.events@gmail.com"; }}
              className="text-secondary-foreground hover:text-primary transition-colors cursor-none"
            >
              siddharthvibe.events@gmail.com
            </button>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => window.open(INSTAGRAM_URL, "_blank")}
              className="flex items-center gap-2 px-4 py-2 bg-secondary rounded font-medium text-secondary-foreground hover:bg-muted transition-colors cursor-none"
            >
              <Instagram size={16} /> Instagram
            </button>
            <button
              onClick={() => { window.location.href = "mailto:siddharthvibe.events@gmail.com"; }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded font-medium hover:opacity-90 transition-opacity cursor-none"
            >
              <Mail size={16} /> Email
            </button>
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
