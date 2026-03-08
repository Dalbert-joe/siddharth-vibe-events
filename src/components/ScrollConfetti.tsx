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

      // Add keyframes
      const style = document.createElement("style");
      style.textContent = `
        @keyframes confetti-fall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes popper-left {
          0% { transform: translateX(-100%) rotate(-30deg); opacity: 0; }
          20% { transform: translateX(0) rotate(0deg); opacity: 1; }
          40% { transform: translateX(10px) scale(1.2); }
          60% { transform: translateX(0) scale(1); opacity: 1; }
          100% { transform: translateX(-50%) rotate(-10deg); opacity: 0; }
        }
        @keyframes popper-right {
          0% { transform: translateX(100%) rotate(30deg); opacity: 0; }
          20% { transform: translateX(0) rotate(0deg); opacity: 1; }
          40% { transform: translateX(-10px) scale(1.2); }
          60% { transform: translateX(0) scale(1); opacity: 1; }
          100% { transform: translateX(50%) rotate(10deg); opacity: 0; }
        }
      `;
      container.appendChild(style);

      // Party poppers
      const popperStyles = "position:absolute;top:40%;font-size:48px;animation-duration:2s;animation-fill-mode:forwards;";
      const leftPopper = document.createElement("div");
      leftPopper.textContent = "🎉";
      leftPopper.style.cssText = popperStyles + "left:20px;animation-name:popper-left;";
      container.appendChild(leftPopper);

      const rightPopper = document.createElement("div");
      rightPopper.textContent = "🎉";
      rightPopper.style.cssText = popperStyles + "right:20px;animation-name:popper-right;transform:scaleX(-1);";
      container.appendChild(rightPopper);

      // Gold confetti burst
      const colors = [
        "hsl(43,56%,52%)",
        "hsl(43,56%,70%)",
        "hsl(43,56%,40%)",
        "hsl(43,30%,60%)",
        "hsl(43,80%,65%)",
      ];

      for (let i = 0; i < 60; i++) {
        const el = document.createElement("div");
        const size = 5 + Math.random() * 9;
        const startX = 40 + Math.random() * 20; // burst from center area
        const spreadX = (Math.random() - 0.5) * 60; // spread outward
        const delay = Math.random() * 0.3;
        const duration = 1.5 + Math.random() * 0.8;
        const rotation = Math.random() * 720;
        el.style.cssText = `
          position:absolute;top:35%;left:${startX}%;
          width:${size}px;height:${size}px;
          background:${colors[i % colors.length]};
          opacity:0;border-radius:${Math.random() > 0.5 ? "50%" : "2px"};
          animation:confetti-fall ${duration}s ${delay}s ease-out forwards;
          transform:translateX(${spreadX}vw) rotate(${rotation}deg);
        `;
        container.appendChild(el);
      }

      setTimeout(() => container.remove(), 3000);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return null;
};

export default ScrollConfetti;
