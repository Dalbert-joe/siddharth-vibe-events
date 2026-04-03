import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { MessageCircle, ArrowLeft } from "lucide-react";

const WHATSAPP_NUMBER = "916380690032";

interface Product {
  id: string;
  name: string;
  type: string;
  price: number;
  public_url: string;
  created_at: string;
}

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    supabase.from("page_views").insert({ page: "products" });

    supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProducts(data || []);
        setLoading(false);
      });
  }, []);

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel("products_page_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "products" }, (payload) => {
        setProducts((prev) => [payload.new as Product, ...prev]);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "products" }, (payload) => {
        setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleWhatsApp = (product: Product, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const msg = encodeURIComponent(
      `Hi! I'm interested in the *${product.name}* (${product.type}) priced at ₹${product.price.toLocaleString("en-IN")}. Please share more details.`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 glass-dark border-b gold-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 gold-text-light opacity-70 hover:opacity-100 transition-opacity text-xs uppercase tracking-wider font-body cursor-none"
          >
            <ArrowLeft size={14} /> Home
          </button>
          <h1 className="font-heading text-lg gold-text tracking-widest uppercase">
            Products
          </h1>
          <div className="w-16" /> {/* spacer */}
        </div>
      </div>

      <div className="pt-28 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-14">
            <h2 className="font-heading text-4xl sm:text-5xl gold-text mb-3">
              Our Products
            </h2>
            <p className="text-muted-foreground font-body text-sm">
              Premium costumes & rentals available for your events
            </p>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-[hsl(43,56%,52%)] border-t-transparent animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground font-body">
              <p className="text-4xl mb-4">🎭</p>
              <p>Products coming soon.</p>
              <p className="text-xs mt-2 opacity-60">Check back later for our latest offerings.</p>
            </div>
          ) : (
            <>
              {/* Product grid — card style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setSelected(product)}
                    className="group relative rounded-xl overflow-hidden border gold-border bg-card cursor-none transition-all duration-300 hover:border-primary/60"
                    style={{ boxShadow: "0 0 0 0 transparent" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 0 18px hsl(43,56%,30%,0.35)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    {/* Image */}
                    <div className="aspect-[4/3] overflow-hidden bg-secondary relative">
                      <img
                        src={product.public_url}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Gold shimmer on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-heading text-base sm:text-lg gold-text uppercase tracking-wide font-bold truncate">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-body mt-0.5">
                        {product.type}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <p className="font-body gold-text font-semibold text-sm">
                          ₹{product.price.toLocaleString("en-IN")}
                        </p>
                        <button
                          onClick={(e) => handleWhatsApp(product, e)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-body font-medium transition-colors cursor-none"
                        >
                          <MessageCircle size={13} />
                          WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact CTA */}
              <div className="mt-16 text-center">
                <p className="text-muted-foreground font-body text-sm mb-4">
                  Want a custom quote or have questions?
                </p>
                <button
                  onClick={() => {
                    const msg = encodeURIComponent("Hi! I'd like to know more about your products and rental options.");
                    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-body font-medium transition-colors cursor-none"
                >
                  <MessageCircle size={18} />
                  Chat with us on WhatsApp
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lightbox modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative bg-card border gold-border rounded-2xl overflow-hidden max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-[4/3] overflow-hidden bg-secondary">
              <img
                src={selected.public_url}
                alt={selected.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5">
              <h3 className="font-heading text-xl gold-text uppercase tracking-wide font-bold">
                {selected.name}
              </h3>
              <p className="text-sm text-muted-foreground font-body mt-1">{selected.type}</p>
              <p className="font-body gold-text font-semibold text-lg mt-2">
                ₹{selected.price.toLocaleString("en-IN")}
              </p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleWhatsApp(selected)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-body font-medium text-sm transition-colors cursor-none"
                >
                  <MessageCircle size={15} /> WhatsApp Enquiry
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="px-4 py-2.5 border gold-border rounded-lg text-sm font-body gold-text hover:bg-secondary transition-colors cursor-none"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
