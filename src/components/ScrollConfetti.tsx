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

      const style = document.createElement("style");
      style.textContent = `
        @keyframes confetti-burst {
          0% { transform: translate(0,0) rotate(0deg) scale(0); opacity: 1; }
          15% { opacity: 1; transform: translate(var(--tx), var(--ty)) rotate(180deg) scale(1); }
          100% { transform: translate(var(--tx2), calc(var(--ty2) + 100vh)) rotate(720deg) scale(0.3); opacity: 0; }
        }
        @keyframes popper-left {
          0% { transform: translate(-120%, 0) rotate(-45deg) scale(0.3); opacity: 0; }
          15% { transform: translate(0, 0) rotate(-15deg) scale(1.1); opacity: 1; }
          25% { transform: translate(10px, -5px) rotate(-5deg) scale(1); }
          35% { transform: translate(5px, 0) rotate(-10deg) scale(1); opacity: 1; }
          50% { opacity: 1; }
          100% { transform: translate(-30%, 10%) rotate(-25deg) scale(0.8); opacity: 0; }
        }
        @keyframes popper-right {
          0% { transform: translate(120%, 0) rotate(45deg) scale(0.3); opacity: 0; }
          15% { transform: translate(0, 0) rotate(15deg) scale(1.1); opacity: 1; }
          25% { transform: translate(-10px, -5px) rotate(5deg) scale(1); }
          35% { transform: translate(-5px, 0) rotate(10deg) scale(1); opacity: 1; }
          50% { opacity: 1; }
          100% { transform: translate(30%, 10%) rotate(25deg) scale(0.8); opacity: 0; }
        }
        @keyframes flash-overlay {
          0% { opacity: 0; }
          8% { opacity: 0.15; }
          30% { opacity: 0.05; }
          100% { opacity: 0; }
        }
        @keyframes ring-burst {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0.6; }
          50% { opacity: 0.2; }
          100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
        }
        @keyframes sparkle {
          0% { transform: scale(0) rotate(0deg); opacity: 1; }
          50% { transform: scale(1) rotate(180deg); opacity: 1; }
          100% { transform: scale(0) rotate(360deg); opacity: 0; }
        }
      `;
      container.appendChild(style);

      // Flash overlay for impact
      const flash = document.createElement("div");
      flash.style.cssText = "position:absolute;inset:0;background:radial-gradient(circle at 50% 45%, hsla(43,56%,52%,0.3), transparent 70%);animation:flash-overlay 2s ease-out forwards;";
      container.appendChild(flash);

      // Ring burst from center
      for (let r = 0; r < 3; r++) {
        const ring = document.createElement("div");
        ring.style.cssText = `position:absolute;top:42%;left:50%;width:120px;height:120px;border-radius:50%;border:2px solid hsla(43,56%,52%,${0.4 - r * 0.1});animation:ring-burst ${1.2 + r * 0.3}s ${r * 0.15}s ease-out forwards;`;
        container.appendChild(ring);
      }

      // 3D Party Popper SVG - LEFT (pointing right)
      const popperSVG = (mirror: boolean) => {
        const dir = mirror ? 'transform:scaleX(-1);' : '';
        return `<svg viewBox="0 0 120 120" width="100%" height="100%" style="${dir}">
          <defs>
            <linearGradient id="cone${mirror?'R':'L'}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:hsl(43,56%,62%)"/>
              <stop offset="50%" style="stop-color:hsl(43,56%,45%)"/>
              <stop offset="100%" style="stop-color:hsl(43,40%,30%)"/>
            </linearGradient>
            <linearGradient id="band${mirror?'R':'L'}" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:hsl(0,0%,20%)"/>
              <stop offset="50%" style="stop-color:hsl(0,0%,35%)"/>
              <stop offset="100%" style="stop-color:hsl(0,0%,15%)"/>
            </linearGradient>
            <radialGradient id="burst${mirror?'R':'L'}" cx="30%" cy="20%">
              <stop offset="0%" style="stop-color:hsl(43,80%,75%)"/>
              <stop offset="100%" style="stop-color:hsl(43,56%,52%);stop-opacity:0"/>
            </radialGradient>
            <filter id="glow${mirror?'R':'L'}">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <!-- Cone body -->
          <path d="M85 95 L45 35 L55 30 L95 90 Z" fill="url(#cone${mirror?'R':'L'})" stroke="hsl(43,40%,28%)" stroke-width="0.5"/>
          <!-- Bands on cone -->
          <path d="M62 58 L70 55" stroke="url(#band${mirror?'R':'L'})" stroke-width="3" stroke-linecap="round"/>
          <path d="M72 73 L80 70" stroke="url(#band${mirror?'R':'L'})" stroke-width="3" stroke-linecap="round"/>
          <!-- Rim -->
          <ellipse cx="50" cy="32" rx="8" ry="4" fill="hsl(43,56%,55%)" stroke="hsl(43,40%,35%)" stroke-width="0.5"/>
          <!-- Burst glow -->
          <circle cx="45" cy="25" r="15" fill="url(#burst${mirror?'R':'L'})" filter="url(#glow${mirror?'R':'L'})" opacity="0.7"/>
          <!-- Streamers -->
          <path d="M48 28 C35 15, 25 18, 15 5" stroke="hsl(43,80%,65%)" stroke-width="2" fill="none" stroke-linecap="round"/>
          <path d="M45 30 C30 22, 20 28, 8 15" stroke="hsl(43,56%,52%)" stroke-width="2" fill="none" stroke-linecap="round"/>
          <path d="M50 27 C42 12, 55 8, 45 -5" stroke="hsl(43,70%,70%)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          <path d="M43 32 C28 28, 18 35, 5 25" stroke="hsl(30,50%,55%)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          <!-- Star accents -->
          <polygon points="20,10 22,6 24,10 20,7.5 24,7.5" fill="hsl(43,80%,70%)" opacity="0.9"/>
          <polygon points="10,20 11.5,17 13,20 10,18.5 13,18.5" fill="hsl(43,60%,60%)" opacity="0.8"/>
          <polygon points="35,5 36.5,2 38,5 35,3.5 38,3.5" fill="hsl(43,90%,75%)" opacity="0.9"/>
          <!-- Highlight -->
          <path d="M60 55 L52 33" stroke="hsla(43,56%,80%,0.3)" stroke-width="3" stroke-linecap="round"/>
        </svg>`;
      };

      const leftPopper = document.createElement("div");
      leftPopper.innerHTML = popperSVG(false);
      leftPopper.style.cssText = "position:absolute;top:30%;left:5%;width:110px;height:110px;animation:popper-left 2.5s ease-out forwards;filter:drop-shadow(0 0 15px hsla(43,56%,52%,0.5));";
      container.appendChild(leftPopper);

      const rightPopper = document.createElement("div");
      rightPopper.innerHTML = popperSVG(true);
      rightPopper.style.cssText = "position:absolute;top:30%;right:5%;width:110px;height:110px;animation:popper-right 2.5s ease-out forwards;filter:drop-shadow(0 0 15px hsla(43,56%,52%,0.5));";
      container.appendChild(rightPopper);

      // Confetti particles - full screen burst from dual sources
      const colors = [
        "hsl(43,56%,52%)", "hsl(43,56%,70%)", "hsl(43,80%,65%)",
        "hsl(43,40%,40%)", "hsl(30,50%,55%)", "hsl(43,90%,75%)",
        "hsl(43,30%,60%)", "hsl(50,60%,60%)",
      ];
      const shapes = ["50%", "2px", "0"];

      // Burst from left popper
      for (let i = 0; i < 50; i++) {
        createParticle(container, colors, shapes, 15, 35, true);
      }
      // Burst from right popper
      for (let i = 0; i < 50; i++) {
        createParticle(container, colors, shapes, 85, 35, false);
      }
      // Center sparkle particles
      for (let i = 0; i < 30; i++) {
        createParticle(container, colors, shapes, 50, 40, Math.random() > 0.5);
      }

      // Sparkle stars scattered
      for (let s = 0; s < 20; s++) {
        const sparkle = document.createElement("div");
        const x = 10 + Math.random() * 80;
        const y = 10 + Math.random() * 60;
        const size = 4 + Math.random() * 8;
        const delay = 0.1 + Math.random() * 1;
        sparkle.style.cssText = `position:absolute;left:${x}%;top:${y}%;width:${size}px;height:${size}px;background:hsl(43,80%,75%);clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);animation:sparkle ${0.8 + Math.random() * 0.5}s ${delay}s ease-out forwards;opacity:0;`;
        container.appendChild(sparkle);
      }

      setTimeout(() => container.remove(), 4000);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return null;
};

function createParticle(
  container: HTMLElement,
  colors: string[],
  shapes: string[],
  originX: number,
  originY: number,
  goLeft: boolean
) {
  const el = document.createElement("div");
  const size = 4 + Math.random() * 10;
  const angle = (goLeft ? 180 + Math.random() * 120 - 60 : Math.random() * 120 - 60) * (Math.PI / 180);
  const velocity = 100 + Math.random() * 250;
  const tx = Math.cos(angle) * velocity;
  const ty = Math.sin(angle) * velocity * -0.7;
  const tx2 = tx + (Math.random() - 0.5) * 80;
  const ty2 = ty + 50;
  const delay = Math.random() * 0.4;
  const duration = 2 + Math.random() * 1.2;
  const color = colors[Math.floor(Math.random() * colors.length)];
  const borderRadius = shapes[Math.floor(Math.random() * shapes.length)];

  el.style.cssText = `
    position:absolute;left:${originX}%;top:${originY}%;
    width:${size}px;height:${size * (0.4 + Math.random() * 0.8)}px;
    background:${color};border-radius:${borderRadius};
    --tx:${tx}px;--ty:${ty}px;--tx2:${tx2}px;--ty2:${ty2}px;
    animation:confetti-burst ${duration}s ${delay}s cubic-bezier(0.25,0.46,0.45,0.94) forwards;
    opacity:0;box-shadow:0 0 ${3 + Math.random() * 4}px ${color};
  `;
  container.appendChild(el);
}

export default ScrollConfetti;
