import { useEffect, useRef } from 'react';
import { usePointerFine } from '../hooks/usePointerFine';

type Node = { x: number; y: number; vx: number; vy: number };

// Canvas "circuit network" for the hero backdrop: slow-drifting nodes linked by
// lines when they're near each other, plus links to the cursor. Palette-locked to
// the site's cyan/teal. Pointer-transparent, pauses off-screen, and renders a
// single static frame under prefers-reduced-motion.
//
// Skipped entirely on touch devices: the cursor links are the whole point of the
// effect and a phone has no cursor, so all that remains is an O(n²) scan over up
// to 64 nodes every frame — pure battery cost for no visual payoff. The hero
// keeps its gradient and ambient orbs there.
export default function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const enabled = usePointerFine();

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nodes: Node[] = [];
    const mouse = { x: -9999, y: -9999 };
    const LINK_DIST = 132;
    const MOUSE_DIST = 168;

    const seedNodes = () => {
      // Density scales with area but is capped for performance.
      const count = Math.min(64, Math.max(22, Math.round((width * height) / 26000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
      }));
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedNodes();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const n of nodes) {
        // Node dot.
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(1, 245, 209, 0.55)';
        ctx.fill();
      }

      // Node-to-node links.
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.22;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0, 161, 155, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Cursor links — brighter, gives the network a reactive pull.
      for (const n of nodes) {
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MOUSE_DIST) {
          const alpha = (1 - dist / MOUSE_DIST) * 0.5;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(1, 245, 209, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          // Gentle drift toward the cursor.
          n.vx += (dx > 0 ? -1 : 1) * 0.002;
          n.vy += (dy > 0 ? -1 : 1) * 0.002;
        }
      }
    };

    const step = () => {
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        // Damp toward the base speed so cursor nudges don't accumulate.
        n.vx *= 0.99;
        n.vy *= 0.99;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
        n.x = Math.max(0, Math.min(width, n.x));
        n.y = Math.max(0, Math.min(height, n.y));
      }
      draw();
    };

    let raf = 0;
    let running = false;
    const loop = () => {
      step();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduce) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeaveWindow = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    // Pause when the hero scrolls out of view.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
      },
      { threshold: 0 }
    );

    resize();
    if (reduce) {
      draw(); // single static frame
    } else {
      io.observe(canvas);
      window.addEventListener('mousemove', onMouse);
      window.addEventListener('mouseout', onLeaveWindow);
      start();
    }

    const ro = new ResizeObserver(() => resize());
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('mouseout', onLeaveWindow);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
