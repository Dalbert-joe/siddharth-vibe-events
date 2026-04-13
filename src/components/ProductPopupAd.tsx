import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  type: string;
  price: number;
  public_url: string;
}

interface PopupAd {
  product: Product;
  side: "left" | "right";
  id: string;
}

const FIRST_SHOW_DELAY_MS = 5000;
const CYCLE_INTERVAL_MS = 120_000;
const DISMISS_AFTER_MS = 8000;

// Persisted across full SPA lifetime in sessionStorage
const SESSION_KEY = "svibe_ad_started";

const ProductPopupAd = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeAds, setActiveAds] = useState<PopupAd[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const adIndexRef = useRef(0);
  const instanceRef = useRef(0);
  const startedRef = useRef(false);

  useEffect(() => {
    supabase
      .from("products")
      .select("id, name, type, price, public_url")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data && data.length > 0) setProducts(data);
      });
  }, []);

  useEffect(() => {
    if (products.length === 0) return;

    // Already started in this browser session — never run again
    if (sessionStorage.getItem(SESSION_KEY)) return;
    if (startedRef.current) return;

    const onScroll = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      window.removeEventListener("scroll", onScroll);
      setTimeout(startCycle, FIRST_SHOW_DELAY_MS);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [products]);

  const showNextAd = () => {
    if (products.length === 0) return;

    // Show ONE ad on ONE side only (alternates left/right each time)
    const idx = adIndexRef.current % products.length;
    adIndexRef.current = (adIndexRef.current + 1) % products.length;
    const side: "left" | "right" = instanceRef.current % 2 === 0 ? "left" : "right";

    const ad: PopupAd = {
      product: products[idx],
      side,
      id: `ad-${++instanceRef.current}`,
    };

    setActiveAds([ad]);

    setTimeout(() => {
      setActiveAds((prev) => prev.filter((a) => a.id !== ad.id));
    }, DISMISS_AFTER_MS);
  };

  const startCycle = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    showNextAd();
    timerRef.current = setInterval(showNextAd, CYCLE_INTERVAL_MS);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const dismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveAds((prev) => prev.filter((a) => a.id !== id));
  };

  const handleClick = (ad: PopupAd) => {
    navigate("/products");
    setActiveAds((prev) => prev.filter((a) => a.id !== ad.id));
  };

  if (activeAds.length === 0) return null;

  return (
    <>
      {activeAds.map((ad) => (
        <div
          key={ad.id}
          onClick={() => handleClick(ad)}
          style={{
            position: "fixed",
            bottom: "6rem",
            [ad.side]: "1rem",
            zIndex: 50,
            width: "220px",
            animation: `slideIn-${ad.side} 0.45s cubic-bezier(0.16, 1, 0.3, 1) both`,
            pointerEvents: "auto",
          }}
          className="cursor-none"
        >
          <style>{`
            @keyframes slideIn-left {
              from { transform: translateX(-120%); opacity: 0; }
              to   { transform: translateX(0);     opacity: 1; }
            }
            @keyframes slideIn-right {
              from { transform: translateX(120%); opacity: 0; }
              to   { transform: translateX(0);    opacity: 1; }
            }
          `}</style>

          <div
            className="relative rounded-xl overflow-hidden border gold-border"
            style={{
              background: "linear-gradient(135deg, hsl(20,10%,8%) 60%, hsl(43,30%,12%))",
              boxShadow: "0 0 20px hsl(43,56%,30%,0.4), 0 4px 24px rgba(0,0,0,0.6)",
            }}
          >
            <div className="relative h-28 overflow-hidden">
              <img
                src={ad.product.public_url}
                alt={ad.product.name}
                className="w-full h-full object-cover"
                style={{ filter: "brightness(0.65) saturate(1.2)" }}
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, hsl(20,10%,8%) 0%, transparent 55%)" }}
              />
              <div
                className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] uppercase tracking-widest font-body font-bold"
                style={{ background: "hsl(43,56%,52%)", color: "hsl(20,10%,6%)" }}
              >
                Tap to view
              </div>
            </div>

            <div className="px-3 py-2.5">
              <p
                className="font-heading text-sm uppercase tracking-wide leading-tight"
                style={{ color: "hsl(43,56%,62%)", textShadow: "0 0 12px hsl(43,56%,40%)" }}
              >
                {ad.product.name}
              </p>
              <p className="text-[10px] font-body mt-0.5" style={{ color: "hsl(43,30%,55%)" }}>
                {ad.product.type} · ₹{ad.product.price.toLocaleString("en-IN")}
              </p>
            </div>

            <button
              onClick={(e) => dismiss(ad.id, e)}
              className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center cursor-none"
              style={{ background: "rgba(0,0,0,0.55)", border: "1px solid hsl(43,30%,30%)" }}
            >
              <X size={10} style={{ color: "hsl(43,56%,62%)" }} />
            </button>
          </div>
        </div>
      ))}
    </>
  );
};

export default ProductPopupAd;
