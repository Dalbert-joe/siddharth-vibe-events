import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Event3DModalProps {
  event: {
    title: string;
    description: string;
    services: string[];
    gallerySlug: string;
  };
  onClose: () => void;
}

const GoldBox = () => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  const goldMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("hsl(43, 56%, 52%)"),
        metalness: 0.9,
        roughness: 0.15,
        emissive: new THREE.Color("hsl(43, 56%, 25%)"),
        emissiveIntensity: 0.3,
      }),
    []
  );

  return (
    <RoundedBox ref={meshRef} args={[3.2, 2.2, 0.15]} radius={0.08} smoothness={4} material={goldMaterial} />
  );
};

const Scene = () => (
  <>
    <ambientLight intensity={0.4} />
    <pointLight position={[5, 5, 5]} intensity={1} color="#c9a84c" />
    <pointLight position={[-5, -3, 3]} intensity={0.5} color="#f0d078" />
    <GoldBox />
  </>
);

const Event3DModal = ({ event, onClose }: Event3DModalProps) => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    window.open("https://wa.me/916380690032", "_blank");
  };

  const handleViewGallery = () => {
    onClose();
    navigate(`/gallery?cluster=${event.gallerySlug}`);
  };

  const handleServiceClick = () => {
    onClose();
    navigate(`/gallery?cluster=${event.gallerySlug}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-background/85 backdrop-blur-sm animate-fade-in" />

      {/* 3D canvas behind modal */}
      <div className="absolute inset-0 z-[51] pointer-events-none opacity-30">
        <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* Content panel */}
      <div
        className="relative z-[52] w-full max-w-2xl max-h-[85vh] bg-card/95 border gold-border rounded-lg gold-glow animate-fade-in flex flex-col backdrop-blur-md"
        style={{ animationDuration: "0.35s" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-8 pb-4 shrink-0">
          <h3 className="font-heading text-2xl sm:text-3xl gold-text leading-snug pr-4">{event.title}</h3>
          <button
            onClick={onClose}
            className="gold-text opacity-60 hover:opacity-100 transition-opacity cursor-none mt-1 shrink-0"
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-8 pb-8 flex-1 min-h-0">
          <p className="text-muted-foreground font-body text-sm mb-6 leading-relaxed">{event.description}</p>

          {/* Services list — each item clickable */}
          <ul className="space-y-3">
            {event.services.map((service, idx) => (
              <li
                key={idx}
                onClick={handleServiceClick}
                className="flex items-start gap-3 font-body text-sm text-secondary-foreground cursor-none hover:gold-text hover:opacity-80 transition-opacity group"
                title="View in Gallery"
              >
                <span className="gold-text mt-1 shrink-0 text-xs group-hover:scale-125 transition-transform">◆</span>
                <span className="group-hover:text-[hsl(43,56%,62%)] transition-colors">{service}</span>
              </li>
            ))}
          </ul>

          <div className="my-6 border-t border-[hsl(var(--gold))]/30" />

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            {/* Book Now → WhatsApp */}
            <button
              onClick={handleBookNow}
              className="cursor-none flex items-center gap-2 px-6 py-3 rounded-lg font-heading text-sm tracking-wide bg-primary text-primary-foreground hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_hsl(var(--gold)/0.25)]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Book Now
            </button>

            {/* View Gallery → respective cluster */}
            <button
              onClick={handleViewGallery}
              className="cursor-none flex items-center gap-2 px-6 py-3 rounded-lg font-heading text-sm tracking-wide border gold-border gold-text hover:bg-primary/10 hover:scale-105 transition-all duration-300 hover:shadow-[0_0_20px_hsl(var(--gold)/0.2)]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              View Gallery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Event3DModal;
