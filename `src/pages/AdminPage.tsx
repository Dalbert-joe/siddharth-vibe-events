import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft, Upload, Trash2, Image, Film,
  Users, Eye, MessageSquare, BarChart2, X, CheckCircle, AlertCircle,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
interface GalleryMedia {
  id: string;
  file_name: string;
  public_url: string;
  mime_type: string;
  caption: string | null;
  created_at: string;
}
interface Stats {
  totalUsers: number;
  totalFeedback: number;
  totalMedia: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  viewsByDay: { day: string; count: number }[];
}

// ── Mini bar chart ────────────────────────────────────────────────────────────
const BarChart = ({ data }: { data: { day: string; count: number }[] }) => {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-1 h-20 w-full">
      {data.map((d) => (
        <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-sm bg-gradient-to-t from-[hsl(43,56%,52%)] to-[hsl(43,56%,70%)] transition-all duration-700"
            style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count ? 4 : 0 }}
          />
          <span className="text-[9px] text-muted-foreground font-body">{d.day}</span>
        </div>
      ))}
    </div>
  );
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({
  icon: Icon, label, value, sub,
}: { icon: React.ElementType; label: string; value: number | string; sub?: string }) => (
  <div className="bg-card border gold-border rounded-lg p-5 gold-glow flex items-start gap-4">
    <div className="w-10 h-10 rounded-full border gold-border flex items-center justify-center shrink-0">
      <Icon size={18} className="gold-text" />
    </div>
    <div>
      <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">{label}</p>
      <p className="font-heading text-2xl gold-text mt-0.5">{value}</p>
      {sub && <p className="text-xs text-muted-foreground font-body mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type, onClose }: { msg: string; type: "ok" | "err"; onClose: () => void }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg border font-body text-sm shadow-xl
    ${type === "ok" ? "bg-card border-green-600/40 text-green-400" : "bg-card border-destructive/40 text-destructive"}`}>
    {type === "ok" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
    {msg}
    <button onClick={onClose} className="ml-2 cursor-none opacity-60 hover:opacity-100"><X size={14} /></button>
  </div>
);

// ── Main AdminPage ─────────────────────────────────────────────────────────────
const AdminPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<"gallery" | "analytics">("gallery");

  // Gallery state
  const [media, setMedia] = useState<GalleryMedia[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Analytics state
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const showToast = (msg: string, type: "ok" | "err") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Load gallery ────────────────────────────────────────────────────────────
  const loadMedia = async () => {
    setLoadingMedia(true);
    const { data } = await supabase
      .from("gallery_media")
      .select("*")
      .order("created_at", { ascending: false });
    setMedia(data || []);
    setLoadingMedia(false);
  };

  // ── Load analytics ──────────────────────────────────────────────────────────
  const loadStats = async () => {
    setLoadingStats(true);

    const [usersRes, feedbackRes, mediaRes, viewsRes] = await Promise.all([
      supabase.from("admins").select("id", { count: "exact", head: true }),
      supabase.from("feedback").select("id", { count: "exact", head: true }),
      supabase.from("gallery_media").select("id", { count: "exact", head: true }),
      supabase.from("page_views").select("created_at"),
    ]);

    // Count all auth users via feedback + estimate
    const { count: feedbackCount } = await supabase
      .from("feedback")
      .select("id", { count: "exact", head: true });

    const views = viewsRes.data || [];
    const now = new Date();

    const todayStr = now.toISOString().slice(0, 10);
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const monthAgo = new Date(now.getTime() - 30 * 86400000);

    const viewsToday = views.filter((v) => v.created_at?.slice(0, 10) === todayStr).length;
    const viewsThisWeek = views.filter((v) => new Date(v.created_at) >= weekAgo).length;
    const viewsThisMonth = views.filter((v) => new Date(v.created_at) >= monthAgo).length;

    // Last 7 days bar chart
    const viewsByDay = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getTime() - (6 - i) * 86400000);
      const dayStr = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("en-IN", { weekday: "short" });
      return {
        day: label,
        count: views.filter((v) => v.created_at?.slice(0, 10) === dayStr).length,
      };
    });

    setStats({
      totalUsers: 0, // auth.users is admin-only via service key; show 0 gracefully
      totalFeedback: feedbackCount || 0,
      totalMedia: mediaRes.count || 0,
      viewsToday,
      viewsThisWeek,
      viewsThisMonth,
      viewsByDay,
    });
    setLoadingStats(false);
  };

  useEffect(() => { loadMedia(); }, []);
  useEffect(() => { if (tab === "analytics") loadStats(); }, [tab]);

  // Real-time page_views subscription
  useEffect(() => {
    const channel = supabase
      .channel("page_views_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "page_views" }, () => {
        if (tab === "analytics") loadStats();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tab]);

  // ── Upload ──────────────────────────────────────────────────────────────────
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: storageErr } = await supabase.storage
        .from("gallery")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (storageErr) {
        showToast(`Upload failed: ${storageErr.message}`, "err");
        continue;
      }

      const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(path);

      const { error: dbErr } = await supabase.from("gallery_media").insert({
        uploader_email: user.email,
        file_name: file.name,
        file_path: path,
        mime_type: file.type,
        caption: caption || null,
        public_url: urlData.publicUrl,
      });

      if (dbErr) {
        showToast(`DB error: ${dbErr.message}`, "err");
      }
    }

    setCaption("");
    showToast("Uploaded successfully!", "ok");
    loadMedia();
    setUploading(false);
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (item: GalleryMedia) => {
    if (!confirm(`Delete "${item.file_name}"?`)) return;

    await supabase.storage.from("gallery").remove([item.file_path]);
    const { error } = await supabase.from("gallery_media").delete().eq("id", item.id);

    if (error) { showToast("Delete failed.", "err"); return; }
    showToast("Deleted.", "ok");
    setMedia((prev) => prev.filter((m) => m.id !== item.id));
  };

  return (
    <div className="min-h-screen bg-background cursor-none">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="border-b gold-border bg-card/60 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm font-body gold-text opacity-70 hover:opacity-100 transition-opacity cursor-none"
            >
              <ArrowLeft size={15} /> Home
            </button>
            <div className="w-px h-4 bg-border" />
            <span className="font-heading text-lg gold-text">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground font-body hidden sm:block">{user?.email}</span>
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="text-xs font-body text-muted-foreground hover:text-destructive transition-colors cursor-none"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <div className="flex gap-2 mb-8">
          {(["gallery", "analytics"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded text-sm font-body tracking-wider uppercase transition-all duration-200 cursor-none
                ${tab === t
                  ? "bg-primary text-primary-foreground"
                  : "border gold-border gold-text opacity-60 hover:opacity-100"}`}
            >
              {t === "gallery" ? "📸 Gallery" : "📊 Analytics"}
            </button>
          ))}
        </div>

        {/* ── GALLERY TAB ── */}
        {tab === "gallery" && (
          <div className="space-y-8 pb-16">

            {/* Upload zone */}
            <div className="bg-card border gold-border rounded-lg p-6 gold-glow">
              <h2 className="font-heading text-xl gold-text mb-5">Upload Media</h2>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-10 text-center transition-all duration-200 cursor-none
                  ${dragOver ? "border-primary bg-primary/5" : "gold-border hover:border-primary/60 hover:bg-secondary/30"}`}
              >
                <Upload size={28} className="gold-text mx-auto mb-3 opacity-60" />
                <p className="font-body text-sm text-muted-foreground">
                  Drag & drop images / videos here, or <span className="gold-text underline">click to browse</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF, MP4, MOV — no size limit</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files)}
                />
              </div>

              <div className="mt-4 flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Optional caption for this upload..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-secondary border gold-border rounded text-sm font-body gold-text placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors cursor-none"
                />
                {uploading && (
                  <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                )}
              </div>
            </div>

            {/* Media grid */}
            <div>
              <h2 className="font-heading text-xl gold-text mb-5">
                All Uploads <span className="text-sm text-muted-foreground font-body">({media.length})</span>
              </h2>

              {loadingMedia ? (
                <div className="flex justify-center py-16">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : media.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground font-body">
                  No media uploaded yet. Start by uploading above!
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {media.map((item) => (
                    <div key={item.id} className="group relative rounded-lg overflow-hidden border gold-border bg-card">
                      {item.mime_type.startsWith("video/") ? (
                        <div className="aspect-[4/3] bg-secondary flex items-center justify-center">
                          <Film size={28} className="gold-text opacity-50" />
                        </div>
                      ) : (
                        <img
                          src={item.public_url}
                          alt={item.file_name}
                          className="aspect-[4/3] w-full object-cover"
                        />
                      )}
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                        <button
                          onClick={() => handleDelete(item)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-none p-2 rounded-full bg-destructive/80 hover:bg-destructive"
                        >
                          <Trash2 size={16} className="text-white" />
                        </button>
                      </div>
                      {item.caption && (
                        <div className="px-2 py-1.5 bg-card border-t gold-border">
                          <p className="text-xs text-muted-foreground font-body truncate">{item.caption}</p>
                        </div>
                      )}
                      <div className="px-2 pb-1.5">
                        <p className="text-[10px] text-muted-foreground/50 font-body truncate">{item.file_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {tab === "analytics" && (
          <div className="pb-16 space-y-8">
            {loadingStats ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : stats ? (
              <>
                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <StatCard icon={Eye} label="Views Today" value={stats.viewsToday} />
                  <StatCard icon={BarChart2} label="Views This Week" value={stats.viewsThisWeek} />
                  <StatCard icon={BarChart2} label="Views This Month" value={stats.viewsThisMonth} />
                  <StatCard icon={MessageSquare} label="Total Feedback" value={stats.totalFeedback} />
                  <StatCard icon={Image} label="Gallery Media" value={stats.totalMedia} />
                  <StatCard icon={Users} label="Real-time" value="Live" sub="Auto-updates on new visits" />
                </div>

                {/* Bar chart */}
                <div className="bg-card border gold-border rounded-lg p-6 gold-glow">
                  <h3 className="font-heading text-lg gold-text mb-1">Page Views — Last 7 Days</h3>
                  <p className="text-xs text-muted-foreground font-body mb-6">Updates in real-time as visitors arrive</p>
                  {stats.viewsByDay.every((d) => d.count === 0) ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                      <Eye size={28} className="gold-text opacity-30" />
                      <p className="text-sm text-muted-foreground font-body">No page views recorded yet.</p>
                      <p className="text-xs text-muted-foreground font-body">Add the tracking snippet to your pages (see below).</p>
                    </div>
                  ) : (
                    <BarChart data={stats.viewsByDay} />
                  )}
                </div>

                {/* Tracking instructions */}
                <div className="bg-card border gold-border rounded-lg p-6 gold-glow">
                  <h3 className="font-heading text-lg gold-text mb-2">📡 Enable Page View Tracking</h3>
                  <p className="text-sm text-muted-foreground font-body mb-4">
                    Add this hook to any page component to track visits:
                  </p>
                  <pre className="bg-secondary rounded p-4 text-xs text-[hsl(43,56%,70%)] font-mono overflow-x-auto whitespace-pre-wrap">{`// In each page (Index, Gallery, etc.) — add this useEffect:
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

useEffect(() => {
  supabase.from("page_views").insert({ page: "home" });
}, []);`}</pre>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
