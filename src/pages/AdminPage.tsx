import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft, Upload, Trash2, Film, Eye,
  MessageSquare, BarChart2, Image, X, CheckCircle,
  AlertCircle, Package, Plus,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface GalleryMedia {
  id: string;
  file_name: string;
  public_url: string;
  file_path: string;
  mime_type: string;
  caption: string | null;
  created_at: string;
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
interface Stats {
  totalFeedback: number;
  totalMedia: number;
  totalProducts: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  viewsByDay: { day: string; count: number }[];
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────
const BarChart = ({ data }: { data: { day: string; count: number }[] }) => {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-1.5 h-24 w-full">
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

// ── Stat Card ─────────────────────────────────────────────────────────────────
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

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type, onClose }: { msg: string; type: "ok" | "err"; onClose: () => void }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg border font-body text-sm shadow-xl
    ${type === "ok" ? "bg-card border-green-600/40 text-green-400" : "bg-card border-destructive/40 text-destructive"}`}>
    {type === "ok" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
    {msg}
    <button onClick={onClose} className="ml-2 cursor-none opacity-60 hover:opacity-100"><X size={14} /></button>
  </div>
);

// ── AdminPage ─────────────────────────────────────────────────────────────────
const AdminPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<"gallery" | "products" | "analytics">("gallery");

  // Gallery
  const [media, setMedia] = useState<GalleryMedia[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [addingProduct, setAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState({ name: "", type: "", price: "" });
  const [productFile, setProductFile] = useState<File | null>(null);
  const [productFilePreview, setProductFilePreview] = useState<string | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const productFileRef = useRef<HTMLInputElement>(null);

  // Analytics
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
    const { data } = await supabase.from("gallery_media").select("*").order("created_at", { ascending: false });
    setMedia(data || []);
    setLoadingMedia(false);
  };

  // ── Load products ───────────────────────────────────────────────────────────
  const loadProducts = async () => {
    setLoadingProducts(true);
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
    setLoadingProducts(false);
  };

  // ── Load analytics ──────────────────────────────────────────────────────────
  const loadStats = async () => {
    setLoadingStats(true);
    const [feedbackRes, mediaRes, productsRes, viewsRes] = await Promise.all([
      supabase.from("feedback").select("id", { count: "exact", head: true }),
      supabase.from("gallery_media").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("page_views").select("created_at"),
    ]);
    const views = viewsRes.data || [];
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
    setStats({
      totalFeedback: feedbackRes.count || 0,
      totalMedia: mediaRes.count || 0,
      totalProducts: productsRes.count || 0,
      viewsToday: views.filter((v) => v.created_at?.slice(0, 10) === todayStr).length,
      viewsThisWeek: views.filter((v) => new Date(v.created_at) >= weekAgo).length,
      viewsThisMonth: views.filter((v) => new Date(v.created_at) >= monthAgo).length,
      viewsByDay,
    });
    setLoadingStats(false);
  };

  useEffect(() => { loadMedia(); loadProducts(); }, []);
  useEffect(() => { if (tab === "analytics") loadStats(); }, [tab]);

  // Real-time page views
  useEffect(() => {
    const channel = supabase
      .channel("admin_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "page_views" }, () => {
        if (tab === "analytics") loadStats();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tab]);

  // ── Gallery upload ──────────────────────────────────────────────────────────
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: storageErr } = await supabase.storage.from("gallery").upload(path, file, { cacheControl: "3600", upsert: false });
      if (storageErr) { showToast(`Upload failed: ${storageErr.message}`, "err"); continue; }
      const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(path);
      const { error: dbErr } = await supabase.from("gallery_media").insert({
        uploader_email: user.email, file_name: file.name, file_path: path,
        mime_type: file.type, caption: caption || null, public_url: urlData.publicUrl,
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

  // ── Product add ─────────────────────────────────────────────────────────────
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
    const { error: storageErr } = await supabase.storage.from("products").upload(path, productFile, { cacheControl: "3600", upsert: false });
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

  return (
    <div className="min-h-screen bg-background cursor-none">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
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
        {/* Tabs */}
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
              <h2 className="font-heading text-xl gold-text mb-5">Upload Media</h2>
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

            <div>
              <h2 className="font-heading text-xl gold-text mb-5">
                All Uploads <span className="text-sm text-muted-foreground font-body">({media.length})</span>
              </h2>
              {loadingMedia ? (
                <div className="flex justify-center py-16">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : media.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground font-body">No media yet.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {media.map((item) => (
                    <div key={item.id} className="group relative rounded-lg overflow-hidden border gold-border bg-card">
                      {item.mime_type.startsWith("video/") ? (
                        <div className="aspect-[4/3] bg-secondary flex items-center justify-center">
                          <Film size={28} className="gold-text opacity-50" />
                        </div>
                      ) : (
                        <img src={item.public_url} alt={item.file_name} className="aspect-[4/3] w-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
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

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setAddingProduct(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded text-sm font-body font-medium hover:opacity-90 transition-opacity cursor-none"
              >
                <Plus size={16} /> Add Product
              </button>
            </div>

            {/* Add product form */}
            {addingProduct && (
              <div className="bg-card border gold-border rounded-lg p-6 gold-glow">
                <h2 className="font-heading text-xl gold-text mb-5">New Product</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Image picker */}
                  <div
                    onClick={() => productFileRef.current?.click()}
                    className="border-2 border-dashed gold-border rounded-lg aspect-square flex flex-col items-center justify-center cursor-none hover:border-primary/60 hover:bg-secondary/30 transition-all overflow-hidden"
                  >
                    {productFilePreview ? (
                      <img src={productFilePreview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Upload size={24} className="gold-text opacity-50 mb-2" />
                        <p className="text-xs text-muted-foreground font-body">Click to select image</p>
                      </>
                    )}
                    <input ref={productFileRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => handleProductFileChange(e.target.files?.[0] || null)} />
                  </div>

                  {/* Fields */}
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

            {/* Products list */}
            <div>
              <h2 className="font-heading text-xl gold-text mb-5">
                All Products <span className="text-sm text-muted-foreground font-body">({products.length})</span>
              </h2>
              {loadingProducts ? (
                <div className="flex justify-center py-16">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground font-body">No products yet. Add one above!</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {products.map((product) => (
                    <div key={product.id}
                      className="flex items-center gap-4 bg-card border gold-border rounded-lg p-4 hover:border-primary/40 transition-all">
                      <img src={product.public_url} alt={product.name}
                        className="w-16 h-16 rounded-lg object-cover border gold-border shrink-0" />
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
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
