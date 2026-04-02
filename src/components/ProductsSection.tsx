import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "916380690032";

interface Product {
  id: string;
  name: string;
  type: string;
  price: number;
  public_url: string;
  created_at: string;
}

const ProductsSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      .channel("products_public_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "products" }, (payload) => {
        setProducts((prev) => [payload.new as Product, ...prev]);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "products" }, (payload) => {
        setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleWhatsApp = (product: Product) => {
    const msg = encodeURIComponent(
      `Hi! I'm interested in the *${product.name}* (${product.type}) priced at ₹${product.price.toLocaleString("en-IN")}. Please share more details.`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  return (
    <section id="products" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-heading text-4xl sm:text-5xl text-center gold-text mb-4">
          Products
        </h2>
        <p className="text-center text-muted-foreground mb-16 font-body">
          Premium costumes & rentals available for your events
        </p>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-[hsl(43,56%,52%)] border-t-transparent animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground font-body">
            Products coming soon.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-5 bg-card border gold-border rounded-lg p-4 gold-glow hover:border-primary/60 transition-all duration-300"
              >
                {/* Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border gold-border shrink-0">
                  <img
                    src={product.public_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-lg sm:text-xl gold-text uppercase font-bold tracking-wide truncate">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body mt-0.5">
                    {product.type}
                  </p>
                  <p className="text-base font-body gold-text font-semibold mt-1">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                </div>

                {/* WhatsApp button */}
                <button
                  onClick={() => handleWhatsApp(product)}
                  className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-body font-medium transition-colors duration-200 cursor-none"
                >
                  <MessageCircle size={16} />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
