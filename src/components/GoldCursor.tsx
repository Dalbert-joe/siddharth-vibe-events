import { useEffect, useRef } from "react";

const MAX_PARTICLES = 10;

const GoldCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const particleCount = useRef(0);

  useEffect(() => {
    const cursor = cursorRef.current;
    const container = particlesRef.current;
    if (!cursor || !container) return;

    let animFrame: number;
    const handleMove = (e: MouseEvent) => {
      cancelAnimationFrame(animFrame);
      animFrame = requestAnimationFrame(() => {
        cursor.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px)`;

        if (particleCount.current < MAX_PARTICLES) {
          particleCount.current++;
          const p = document.createElement("div");
          p.style.cssText = `
            position:fixed;left:${e.clientX - 2}px;top:${e.clientY - 2}px;
            width:4px;height:4px;border-radius:50%;
            background:hsl(43,56%,52%);pointer-events:none;
            opacity:0.8;transition:all 0.6s ease-out;z-index:9998;
          `;
          container.appendChild(p);
          requestAnimationFrame(() => {
            p.style.opacity = "0";
            p.style.transform = `translate(${(Math.random() - 0.5) * 30}px, ${(Math.random() - 0.5) * 30}px) scale(0)`;
          });
          setTimeout(() => {
            p.remove();
            particleCount.current--;
          }, 600);
        }
      });
    };

    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed w-5 h-5 rounded-full border-2 pointer-events-none z-[9999]"
        style={{ borderColor: "hsl(43,56%,52%)", mixBlendMode: "difference" }}
      />
      <div ref={particlesRef} className="pointer-events-none" />
    </>
  );
};

export default GoldCursor;
