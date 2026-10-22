import { useEffect, useRef } from 'react';

const COLORS = ['#2D55F0', '#F5B700', '#16A34A', '#EF4444', '#7C3AED', '#38BDF8'];

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Har safar `fire` qiymati o'zgarganda konfetti otiladi. */
export default function Confetti({ fire, count = 120, duration = 1800 }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!fire || reducedMotion()) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const parts = Array.from({ length: count }, () => ({
      x: W / 2 + (Math.random() - 0.5) * W * 0.3,
      y: H * 0.35,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 13 - 4,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      w: 6 + Math.random() * 6,
      h: 4 + Math.random() * 6,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    let raf;
    const start = performance.now();
    let last = start;
    const tick = (now) => {
      const dt = Math.min(2, (now - last) / 16.67);
      last = now;
      const t = now - start;
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = t > duration - 400 ? Math.max(0, (duration - t) / 400) : 1;
      for (const p of parts) {
        p.vy += 0.35 * dt;
        p.vx *= 0.99;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.r += p.vr * dt;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (t < duration) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, W, H);
    };
  }, [fire, count, duration]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[80] h-full w-full" />;
}
