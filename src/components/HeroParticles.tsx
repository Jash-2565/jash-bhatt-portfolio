import { useEffect, useRef } from 'react';
import { usePointerFine } from '../hooks/usePointerFine';

// `bvx`/`bvy` are the node's own permanent drift. `vx`/`vy` are what it is
// doing right now — base drift plus whatever the cursor has nudged into it.
type Node = { x: number; y: number; vx: number; vy: number; bvx: number; bvy: number };

// Canvas "circuit network" for the hero backdrop: continuously drifting nodes,
// linked by lines when they are near each other, plus links to the cursor.
// Palette-locked to the site's cyan/teal. Pointer-transparent, pauses
// off-screen, and renders a single static frame under prefers-reduced-motion.
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
    // Ambient drift speed, in px per frame. Slow enough to read as a living
    // backdrop rather than motion competing with the headline.
    const BASE_SPEED_MIN = 0.1;
    const BASE_SPEED_MAX = 0.26;
    // How quickly a cursor-nudged node eases back to its own base drift.
    // ~0.8s to settle at 60fps.
    const RETURN_RATE = 0.02;

    const seedNodes = () => {
      // Density scales with area but is capped for performance.
      const count = Math.min(64, Math.max(22, Math.round((width * height) / 26000)));
      nodes = Array.from({ length: count }, () => {
        // Pick a direction and a speed rather than two independent components:
        // independent components can both land near zero, which left some nodes
        // essentially parked from the moment they were seeded.
        const angle = Math.random() * Math.PI * 2;
        const speed = BASE_SPEED_MIN + Math.random() * (BASE_SPEED_MAX - BASE_SPEED_MIN);
        const bvx = Math.cos(angle) * speed;
        const bvy = Math.sin(angle) * speed;
        return { x: Math.random() * width, y: Math.random() * height, vx: bvx, vy: bvy, bvx, bvy };
      });
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

        // Ease back toward this node's OWN base drift, so a cursor nudge decays
        // but the ambient motion never does. This used to be `n.vx *= 0.99`,
        // which damps toward zero, not toward a base speed: every node kept 5%
        // of its speed after 5 seconds and was fully parked within ~15, so once
        // the page had been open a moment the cursor was the only thing that
        // could move anything.
        n.vx += (n.bvx - n.vx) * RETURN_RATE;
        n.vy += (n.bvy - n.vy) * RETURN_RATE;

        // Reflect the base drift too — otherwise a bounced node would be pulled
        // straight back into the wall it just hit and stick there.
        if (n.x < 0 || n.x > width) {
          n.vx *= -1;
          n.bvx *= -1;
        }
        if (n.y < 0 || n.y > height) {
          n.vy *= -1;
          n.bvy *= -1;
        }
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
