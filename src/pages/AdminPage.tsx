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
                    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block font-body">Description (optio
