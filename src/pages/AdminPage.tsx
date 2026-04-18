import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft, Upload, Trash2, Film, Eye,
  MessageSquare, BarChart2, Image, X, CheckCircle,
  AlertCircle, Package, Plus, FolderPlus, Folder, Edit2, Users,
} from "lucide-react";

interface GalleryMedia {
  id: string;
  file_name: string;
  public_url: string;
  file_path: string;
  mime_type: string;
  caption: string | null;
  group_id: string | null;
  created_at: string;
}
interface GalleryGroup {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  sort_order: number;
}
interface Product {
  id: string;
  name: string;
  type: string;
  price: number;
  public_url: string;
  image_path: string;
  created_at: string;
}
interface FeedbackItem {
  id: string;
  name: string;
  phone: string;
  message: string;
  created_at: string;
}
interface PageView {
  created_at: string;
  page: string;
}
interface Stats {
  totalFeedback: number;
  totalMedia: number;
  totalProducts: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  viewsByDay: { day: string; count: number }[];
  pageBreakdown: { page: string; count: number }[];
}

const BarChart = ({ data }: { data: { day: string; count: number }[] }) => {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-1.5 h-28 w-full">
      {data.map((d) => (
        <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[9px] text-muted-foreground font-body">{d.count || ""}</span>
          <div
            className="w-full rounded-sm transition-all duration-700"
            style={{
              height: `${(d.count / max) * 80}%`,
              minHeight: d.count ? 4 : 2,
              background: d.count
                ? "linear-gradient(to top, hsl(43,56%,42%), hsl(43,56%,65%))"
                : "rgba(201,168,76,0.1)",
            }}
          />
          <span className="text-[9px] text-muted-foreground font-body">{d.day}</span>
        </div>
      ))}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, sub }: {
  icon: React.ElementType; label: string; value: number | string; sub?: string;
}) => (
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

const Toast = ({ msg, type, onClose }: { msg: string; type: "ok" | "err"; onClose: () => void }) => (
  <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-lg border font-body text-sm shadow-xl
    ${type === "ok" ? "bg-card border-green-600/40 text-green-400" : "bg-card border-destructive/40 text-destructive"}`}>
    {type === "ok" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
    {msg}
    <button onClick={onClose} className="ml-2 cursor-none opacity-60 hover:opacity-100"><X size={14} /></button>
  </div>
);

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<"gallery" | "products" | "analytics">("gallery");

  const [media, setMedia] = useState<GalleryMedia[]>([]);
  const [groups, setGroups] = useState<GalleryGroup[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [uploadGroupId, setUploadGroupId] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [activeGroupFilter, setActiveGroupFilter] = useState<string>("all");
  const fileRef = useRef<HTMLInputElement>(null);

  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupForm, setGroupForm] = useState({ name: "", description: "" });
  const [savingGroup, setSavingGroup] = useState(false);

  const [assignMedia, setAssignMedia] = useState<GalleryMedia | null>(null);
  const [assignGroupId, setAssignGroupId] = useState<string>("");

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [addingProduct, setAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState({ name: "", type: "", price: "" });
  const [productFile, setProductFile] = useState<File | null>(null);
  const [productFilePreview, setProductFilePreview] = useState<string | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const productFileRef = useRef<HTMLInputElement>(null);

  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const showToast = (msg: string, type: "ok" | "err") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadMedia = async () => {
    setLoadingMedia(true);
    const { data } = await supabase
      .from("gallery_media")
      .select("*")
      .order("created_at", { ascending: false });
    setMedia(data || []);
    setLoadingMedia(false);
  };

  const loadGroups = async () => {
    const { data } = await supabase
      .from("gallery_groups")
      .select("*")
      .order("sort_order", { ascending: true });
    setGroups(data || []);
    // Default upload group to "General" if exists
    if (data && data.length > 0) {
      const general = data.find((g) => g.slug === "general");
      if (general) setUploadGroupId(general.id);
    }
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    setProducts(data || []);
    setLoadingProducts(false);
  };

  const loadStats = async () => {
    setLoadingStats(true);

    // Fetch all data needed
    const [feedbackRes, mediaRes, productsRes, viewsRes] = await Promise.all([
      supabase.from("feedback").select("id"),
      supabase.from("gallery_media").select("id"),
      supabase.from("products").select("id"),
      supabase.from("page_views").select("created_at, page"),
    ]);

    const views: PageView[] = viewsRes.data || [];
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const monthAgo = new Date(now.getTime() - 30 * 86400000);

    const viewsByDay = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getTime() - (6 - i) * 86400000);
      const dayStr = d.toISOString().slice(0, 10);
      return {
        day: d.toLocaleDateString("en-IN", { weekday: "short" }),
        count: views.filter((v) => v.created_at?.slice(0, 10) === dayStr).length,
      };
    });

    // Page breakdown
    const pages = ["home", "gallery"];
    const pageBreakdown = pages.map((page) => ({
      page,
      count: views.filter((v) => v.page === page).length,
    }));

    setStats({
      totalFeedback: feedbackRes.data?.length || 0,
      totalMedia: mediaRes.data?.length || 0,
      totalProducts: productsRes.data?.length || 0,
      viewsToday: views.filter((v) => v.created_at?.slice(0, 10) === todayStr).length,
      viewsThisWeek: views.filter((v) => new Date(v.created_at) >= weekAgo).length,
      viewsThisMonth: views.filter((v) => new Date(v.created_at) >= monthAgo).length,
      viewsByDay,
      pageBreakdown,
    });
    setLoadingStats(false);
  };

  const loadFeedback = async () => {
    setLoadingFeedback(true);
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      showToast(`Feedback load error: ${error.message}`, "err");
    }
    setFeedbackList(data || []);
    setLoadingFeedback(false);
  };

  useEffect(() => {
    loadMedia();
    loadGroups();
    loadProducts();
  }, []);

  useEffect(() => {
    if (tab === "analytics") {
      loadStats();
      loadFeedback();
    }
  }, [tab]);

  // Real-time page views
  useEffect(() => {
    const channel = supabase
      .channel("admin_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "page_views" }, () => {
        if (tab === "analytics") loadStats();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "feedback" }, () => {
        if (tab === "analytics") { loadFeedback(); loadStats(); }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tab]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: storageErr } = await supabase.storage
        .from("gallery")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (storageErr) { showToast(`Upload failed: ${storageErr.message}`, "err"); continue; }
      const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(path);
      const { error: dbErr } = await supabase.from("gallery_media").insert({
        uploader_email: user.email,
        file_name: file.name,
        file_path: path,
        mime_type: file.type,
        caption: caption || null,
        public_url: urlData.publicUrl,
        group_id: uploadGroupId || null,
      });
      if (dbErr) showToast(`DB error: ${dbErr.message}`, "err");
    }
    setCaption("");
    showToast("Uploaded successfully!", "ok");
    loadMedia();
    setUploading(false);
  };

  const handleDeleteMedia = async (item: GalleryMedia) => {
    if (!confirm(`Delete "${item.file_name}"?`)) return;
    await supabase.storage.from("gallery").remove([item.file_path]);
    const { error } = await supabase.from("gallery_media").delete().eq("id", item.id);
    if (error) { showToast("Delete failed.", "err"); return; }
    showToast("Deleted.", "ok");
    setMedia((prev) => prev.filter((m) => m.id !== item.id));
  };

  const handleAssignGroup = async () => {
    if (!assignMedia) return;
    const { error } = await supabase
      .from("gallery_media")
      .update({ group_id: assignGroupId || null })
      .eq("id", assignMedia.id);
    if (error) { showToast("Failed to assign group.", "err"); return; }
    showToast("Group assigned!", "ok");
    setMedia((prev) => prev.map((m) =>
      m.id === assignMedia.id ? { ...m, group_id: assignGroupId || null } : m
    ));
    setAssignMedia(null);
  };

  const handleCreateGroup = async () => {
    if (!groupForm.name.trim()) { showToast("Group name is required.", "err"); return; }
    setSavingGroup(true);
    const slug = `${groupForm.name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}-${Date.now()}`;
    const { error } = await supabase.from("gallery_groups").insert({
      name: groupForm.name.trim(),
      slug,
      description: groupForm.description || null,
      sort_order: groups.length,
    });
    if (error) { showToast(`Error: ${error.message}`, "err"); setSavingGroup(false); return; }
    showToast("Group created!", "ok");
    setGroupForm({ name: "", description: "" });
    setShowGroupForm(false);
    loadGroups();
    setSavingGroup(false);
  };

  const handleDeleteGroup = async (group: GalleryGroup) => {
    if (group.slug === "general") { showToast("Cannot delete the General group.", "err"); return; }
    if (!confirm(`Delete group "${group.name}"? Media inside will become ungrouped.`)) return;
    const { error } = await supabase.from("gallery_groups").delete().eq("id", group.id);
    if (error) { showToast("Delete failed.", "err"); return; }
    showToast("Group deleted.", "ok");
    setGroups((prev) => prev.filter((g) => g.id !== group.id));
    setMedia((prev) => prev.map((m) => m.group_id === group.id ? { ...m, group_id: null } : m));
  };

  const handleProductFileChange = (file: File | null) => {
    setProductFile(file);
    if (file) setProductFilePreview(URL.createObjectURL(file));
    else setProductFilePreview(null);
  };

  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.type || !productForm.price || !productFile || !user) {
      showToast("Fill all fields and select an image.", "err");
      return;
    }
    setSavingProduct(true);
    const ext = productFile.name.split(".").pop();
    const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: storageErr } = await supabase.storage
      .from("products")
      .upload(path, productFile, { cacheControl: "3600", upsert: false });
    if (storageErr) { showToast(`Upload failed: ${storageErr.message}`, "err"); setSavingProduct(false); return; }
    const { data: urlData } = supabase.storage.from("products").getPublicUrl(path);
    const { error: dbErr } = await supabase.from("products").insert({
      name: productForm.name,
      type: productForm.type,
      price: parseFloat(productForm.price),
      image_path: path,
      public_url: urlData.publicUrl,
      uploader_email: user.email,
    });
    if (dbErr) { showToast(`Error: ${dbErr.message}`, "err"); setSavingProduct(false); return; }
    showToast("Product added!", "ok");
    setProductForm({ name: "", type: "", price: "" });
    setProductFile(null);
    setProductFilePreview(null);
    setAddingProduct(false);
    loadProducts();
    setSavingProduct(false);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"?`)) return;
    await supabase.storage.from("products").remove([product.image_path]);
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) { showToast("Delete failed.", "err"); return; }
    showToast("Product deleted.", "ok");
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
  };

  const filteredMedia = activeGroupFilter === "all"
    ? media
    : activeGroupFilter === "ungrouped"
    ? media.filter((m) => !m.group_id)
    : media.filter((m) => m.group_id === activeGroupFilter);

  return (
    <div className="min-h-screen bg-background cursor-none">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="border-b gold-border bg-card/60 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm font-body gold-text opacity-70 hover:opacity-100 transition-opacity cursor-none">
              <ArrowLeft size={15} /> Home
            </button>
            <div className="w-px h-4 bg-border" />
            <span className="font-heading text-lg gold-text">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground font-body hidden sm:block">{user?.email}</span>
            <button onClick={() => { logout(); navigate("/"); }}
              className="text-xs font-body text-muted-foreground hover:text-destructive transition-colors cursor-none">
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-8">
        <div className="flex gap-2 mb-8 flex-wrap">
          {(["gallery", "products", "analytics"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded text-sm font-body tracking-wider uppercase transition-all duration-200 cursor-none
                ${tab === t ? "bg-primary text-primary-foreground" : "border gold-border gold-text opacity-60 hover:opacity-100"}`}>
              {t === "gallery" ? "📸 Gallery" : t === "products" ? "📦 Products" : "📊 Analytics"}
            </button>
          ))}
        </div>

        {/* ── GALLERY TAB ── */}
        {tab === "gallery" && (
          <div className="space-y-8 pb-16">
            <div className="bg-card border gold-border rounded-lg p-6 gold-glow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-xl gold-text">Gallery Clusters</h2>
                <button
                  onClick={() => setShowGroupForm((v) => !v)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded text-xs font-body font-medium hover:opacity-90 transition-opacity cursor-none"
                >
                  <FolderPlus size={14} /> New Cluster
                </button>
              </div>

              {showGroupForm && (
                <div className="mb-5 p-4 bg-secondary/40 rounded-lg border gold-border space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block font-body">Cluster Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Wedding Events, Temple Functions..."
                      value={groupForm.name}
                      onChange={(e) => setGroupForm((f) => ({ ...f, name: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
                      className="w-full px-4 py-2.5 bg-secondary border gold-border rounded text-sm font-body gold-text placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors cursor-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block font-body">Description (optional)</label>
                    <input
                      type="text"
                      placeholder="Brief description..."
                      value={groupForm.description}
                      onChange={(e) => setGroupForm((f) => ({ ...f, description: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-secondary border gold-border rounded text-sm font-body gold-text placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors cursor-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleCreateGroup} disabled={savingGroup}
                      className="px-5 py-2 bg-primary text-primary-foreground rounded text-sm font-body hover:opacity-90 cursor-none disabled:opacity-50">
                      {savingGroup ? "Creating..." : "Create Cluster"}
                    </button>
                    <button onClick={() => { setShowGroupForm(false); setGroupForm({ name: "", description: "" }); }}
                      className="px-4 py-2 border gold-border rounded text-sm font-body gold-text hover:bg-secondary cursor-none">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {groups.length === 0 ? (
                <p className="text-sm text-muted-foreground font-body">No clusters yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {groups.map((g) => (
                    <div key={g.id} className="flex items-center gap-2 px-3 py-1.5 bg-secondary border gold-border rounded-full text-xs font-body gold-text">
                      <Folder size={12} />
                      {g.name}
                      <span className="text-muted-foreground">({media.filter((m) => m.group_id === g.id).length})</span>
                      {g.slug !== "general" && (
                        <button onClick={() => handleDeleteGroup(g)}
                          className="ml-1 text-destructive/60 hover:text-destructive cursor-none">
                          <X size={11} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upload */}
            <div className="bg-card border gold-border rounded-lg p-6 gold-glow">
              <h2 className="font-heading text-xl gold-text mb-5">Upload Media</h2>
              <div className="mb-4">
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block font-body">Upload to Cluster</label>
                <select
                  value={uploadGroupId}
                  onChange={(e) => setUploadGroupId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-secondary border gold-border rounded text-sm font-body gold-text focus:outline-none focus:border-primary transition-colors cursor-none"
                >
                  <option value="">No cluster (Uncategorised)</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-10 text-center transition-all duration-200 cursor-none
                  ${dragOver ? "border-primary bg-primary/5" : "gold-border hover:border-primary/60 hover:bg-secondary/30"}`}>
                <Upload size={28} className="gold-text mx-auto mb-3 opacity-60" />
                <p className="font-body text-sm text-muted-foreground">
                  Drag & drop images / videos, or <span className="gold-text underline">click to browse</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF, MP4, MOV</p>
                <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden"
                  onChange={(e) => handleUpload(e.target.files)} />
              </div>
              <div className="mt-4 flex gap-3 items-center">
                <input type="text" placeholder="Optional caption..." value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-secondary border gold-border rounded text-sm font-body gold-text placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors cursor-none" />
                {uploading && <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />}
              </div>
            </div>

            {/* Media grid */}
            <div>
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <h2 className="font-heading text-xl gold-text">
                  All Uploads <span className="text-sm text-muted-foreground font-body">({media.length})</span>
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { id: "all", label: "All" },
                    { id: "ungrouped", label: "Uncategorised" },
                    ...groups.map((g) => ({ id: g.id, label: g.name })),
                  ].map((f) => (
                    <button key={f.id} onClick={() => setActiveGroupFilter(f.id)}
                      className={`px-3 py-1 rounded text-xs font-body tracking-wide transition-all cursor-none
                        ${activeGroupFilter === f.id ? "bg-primary text-primary-foreground" : "border gold-border gold-text opacity-60 hover:opacity-100"}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {loadingMedia ? (
                <div className="flex justify-center py-16">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground font-body">No media in this cluster.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredMedia.map((item) => (
                    <div key={item.id} className="group relative rounded-lg overflow-hidden border gold-border bg-card">
                      {item.mime_type.startsWith("video/") ? (
                        <div className="aspect-[5/7] bg-secondary flex items-center justify-center">
                          <Film size={28} className="gold-text opacity-50" />
                        </div>
                      ) : (
                        <img src={item.public_url} alt={item.file_name} className="aspect-[5/7] w-full object-cover" />
                      )}
                      {item.group_id && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-body bg-black/60 gold-text border gold-border">
                          {groups.find((g) => g.id === item.group_id)?.name || ""}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center gap-2">
                        <button
                          onClick={() => { setAssignMedia(item); setAssignGroupId(item.group_id || ""); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-none p-2 rounded-full bg-primary/80 hover:bg-primary"
                          title="Move to cluster"
                        >
                          <Edit2 size={14} className="text-white" />
                        </button>
                        <button onClick={() => handleDeleteMedia(item)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-none p-2 rounded-full bg-destructive/80 hover:bg-destructive">
                          <Trash2 size={16} className="text-white" />
                        </button>
                      </div>
                      {item.caption && (
                        <div className="px-2 py-1.5 bg-card border-t gold-border">
                          <p className="text-xs text-muted-foreground font-body truncate">{item.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PRODUCTS TAB ── */}
        {tab === "products" && (
          <div className="space-y-6 pb-16">
            <button
              onClick={() => setAddingProduct(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded text-sm font-body font-medium hover:opacity-90 transition-opacity cursor-none"
            >
              <Plus size={16} /> Add Product
            </button>

            {addingProduct && (
              <div className="bg-card border gold-border rounded-lg p-6 gold-glow">
                <h2 className="font-heading text-xl gold-text mb-5">New Product</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div
                    onClick={() => productFileRef.current?.click()}
                    className="border-2 border-dashed gold-border rounded-lg flex flex-col items-center justify-center cursor-none hover:border-primary/60 hover:bg-secondary/30 transition-all overflow-hidden"
                    style={{ aspectRatio: "5/7" }}
                  >
                    {productFilePreview ? (
                      <img src={productFilePreview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Upload size={24} className="gold-text opacity-50 mb-2" />
                        <p className="text-xs text-muted-foreground font-body text-center px-4">Click to select image</p>
                        <p className="text-[10px] text-muted-foreground/60 font-body mt-1">Best: portrait 5:7</p>
                      </>
                    )}
                    <input ref={productFileRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => handleProductFileChange(e.target.files?.[0] || null)} />
                  </div>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block font-body">Product Name</label>
                      <input type="text" placeholder="e.g. Teddy Bear" value={productForm.name}
                        onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-secondary border gold-border rounded text-sm font-body gold-text placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors cursor-none" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block font-body">Type / Category</label>
                      <input type="text" placeholder="e.g. Inflatable Costumes" value={productForm.type}
                        onChange={(e) => setProductForm((f) => ({ ...f, type: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-secondary border gold-border rounded text-sm font-body gold-text placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors cursor-none" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block font-body">Price (₹)</label>
                      <input type="number" placeholder="e.g. 5000" value={productForm.price}
                        onChange={(e) => setProductForm((f) => ({ ...f, price: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-secondary border gold-border rounded text-sm font-body gold-text placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors cursor-none" />
                    </div>
                    <div className="flex gap-3 mt-auto pt-2">
                      <button onClick={handleAddProduct} disabled={savingProduct}
                        className="flex-1 py-2.5 bg-primary text-primary-foreground rounded text-sm font-body font-medium hover:opacity-90 transition-opacity cursor-none disabled:opacity-50">
                        {savingProduct ? "Saving..." : "Save Product"}
                      </button>
                      <button onClick={() => { setAddingProduct(false); setProductForm({ name: "", type: "", price: "" }); setProductFile(null); setProductFilePreview(null); }}
                        className="px-4 py-2.5 border gold-border rounded text-sm font-body gold-text hover:bg-secondary transition-colors cursor-none">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h2 className="font-heading text-xl gold-text mb-5">
                All Products <span className="text-sm text-muted-foreground font-body">({products.length})</span>
              </h2>
              {loadingProducts ? (
                <div className="flex justify-center py-16">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground font-body">No products yet.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {products.map((product) => (
                    <div key={product.id}
                      className="flex items-center gap-4 bg-card border gold-border rounded-lg p-4 hover:border-primary/40 transition-all">
                      <div className="shrink-0 rounded-lg overflow-hidden border gold-border" style={{ width: "50px", aspectRatio: "5/7" }}>
                        <img src={product.public_url} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-heading text-base gold-text uppercase font-bold truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground font-body">{product.type}</p>
                        <p className="text-sm gold-text font-body font-semibold mt-0.5">₹{product.price.toLocaleString("en-IN")}</p>
                      </div>
                      <button onClick={() => handleDeleteProduct(product)}
                        className="shrink-0 p-2.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive hover:text-white transition-colors cursor-none">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {tab === "analytics" && (
          <div className="pb-16 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-heading text-xl gold-text">Analytics Dashboard</h2>
              <button
                onClick={() => { loadStats(); loadFeedback(); }}
                className="px-4 py-2 border gold-border rounded text-xs font-body gold-text hover:bg-secondary cursor-none transition-colors"
              >
                ↻ Refresh
              </button>
            </div>

            {loadingStats ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <StatCard icon={Eye} label="Views Today" value={stats.viewsToday} />
                  <StatCard icon={BarChart2} label="Views This Week" value={stats.viewsThisWeek} />
                  <StatCard icon={BarChart2} label="Views This Month" value={stats.viewsThisMonth} />
                  <StatCard icon={MessageSquare} label="Total Feedback" value={stats.totalFeedback} />
                  <StatCard icon={Image} label="Gallery Media" value={stats.totalMedia} />
                  <StatCard icon={Package} label="Total Products" value={stats.totalProducts} />
                </div>

                {/* Page breakdown */}
                <div className="bg-card border gold-border rounded-lg p-6 gold-glow">
                  <h3 className="font-heading text-lg gold-text mb-4">Page Visits Breakdown</h3>
                  <div className="flex gap-4">
                    {stats.pageBreakdown.map((p) => (
                      <div key={p.page} className="flex-1 bg-secondary/40 border gold-border rounded-lg p-4 text-center">
                        <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-1">{p.page}</p>
                        <p className="font-heading text-3xl gold-text">{p.count}</p>
                        <p className="text-xs text-muted-foreground font-body mt-1">total visits</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-card border gold-border rounded-lg p-6 gold-glow">
                  <h3 className="font-heading text-lg gold-text mb-1">Page Views — Last 7 Days</h3>
                  <p className="text-xs text-muted-foreground font-body mb-6">Updates in real-time as visitors arrive</p>
                  {stats.viewsByDay.every((d) => d.count === 0) ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                      <Eye size={28} className="gold-text opacity-30" />
                      <p className="text-sm text-muted-foreground font-body">No page views recorded yet.</p>
                    </div>
                  ) : (
                    <BarChart data={stats.viewsByDay} />
                  )}
                </div>

                {/* Feedback */}
                <div className="bg-card border gold-border rounded-lg p-6 gold-glow">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-heading text-lg gold-text mb-1">Feedback Messages</h3>
                      <p className="text-xs text-muted-foreground font-body">All feedback submitted by users</p>
                    </div>
                    <span className="px-3 py-1 bg-primary/20 border gold-border rounded-full text-xs font-body gold-text">
                      {feedbackList.length} total
                    </span>
                  </div>
                  {loadingFeedback ? (
                    <div className="flex justify-center py-8">
                      <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    </div>
                  ) : feedbackList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                      <MessageSquare size={28} className="gold-text opacity-30" />
                      <p className="text-sm text-muted-foreground font-body">No feedback received yet.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
                      {feedbackList.map((fb) => (
                        <div key={fb.id} className="bg-secondary/40 border gold-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                            <div>
                              <span className="font-heading text-sm gold-text font-bold">{fb.name}</span>
                              <span className="text-xs text-muted-foreground font-body ml-3">{fb.phone}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-body">
                              {new Date(fb.created_at).toLocaleDateString("en-IN", {
                                day: "numeric", month: "short", year: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-sm font-body text-secondary-foreground leading-relaxed">{fb.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <button
                  onClick={() => { loadStats(); loadFeedback(); }}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded text-sm font-body hover:opacity-90 cursor-none"
                >
                  Load Analytics
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Assign Group Modal */}
      {assignMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={() => setAssignMedia(null)}>
          <div className="bg-card border gold-border rounded-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg gold-text mb-4">Move to Cluster</h3>
            <p className="text-xs text-muted-foreground font-body mb-3 truncate">{assignMedia.file_name}</p>
            <select
              value={assignGroupId}
              onChange={(e) => setAssignGroupId(e.target.value)}
              className="w-full px-4 py-2.5 bg-secondary border gold-border rounded text-sm font-body gold-text focus:outline-none focus:border-primary transition-colors cursor-none mb-4"
            >
              <option value="">No cluster</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={handleAssignGroup}
                className="flex-1 py-2.5 bg-primary text-primary-foreground rounded text-sm font-body font-medium hover:opacity-90 cursor-none">
                Save
              </button>
              <button onClick={() => setAssignMedia(null)}
                className="px-4 py-2.5 border gold-border rounded text-sm font-body gold-text hover:bg-secondary cursor-none">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
