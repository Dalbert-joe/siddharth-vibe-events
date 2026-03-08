import { useEffect, useRef } from "react";

const ScrollConfetti = () => {
  const firedRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      window.removeEventListener("scroll", handleScroll);

      const container = document.createElement("div");
      container.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9000;overflow:hidden;";
      document.body.appendChild(container);

      const colors = [
        "hsl(43,56%,52%)",
        "hsl(43,56%,70%)",
        "hsl(43,56%,40%)",
        "hsl(43,30%,60%)",
      ];

      for (let i = 0; i < 40; i++) {
        const el = document.createElement("div");
        const size = 6 + Math.random() * 8;
        const left = Math.random() * 100;
        const delay = Math.random() * 0.8;
        el.style.cssText = `
          position:absolute;top:-10px;left:${left}%;
          width:${size}px;height:${size}px;
          background:${colors[i % colors.length]};
          opacity:0.9;border-radius:${Math.random() > 0.5 ? "50%" : "1px"};
          animation:confetti-fall 3s ${delay}s ease-in forwards;
        `;
        container.appendChild(el);
      }

      setTimeout(() => container.remove(), 4000);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return null;
};

export default ScrollConfetti;
