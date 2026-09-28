"use client";

import { useEffect, useRef } from "react";

/*
 * An original Eastern sky-dragon that swims right to left behind the footer,
 * on a loop. The head travels along a double sine; every body segment follows
 * the same curve a little behind it, so the whole length slithers. Drawn in
 * low-contrast ink with faint bone linework so it stays a background.
 */

const BONE = (a: number) => `rgba(236,233,227,${a})`;
const BODY = "#1d1d1a";
const BELLY = "#262622";
const SIGNAL = "#c73a1f";

const SEGMENTS = 110;
const LENGTH = 1.35; // body length, in footer widths
const SPEED = 0.085; // footer widths per second (~30s per pass)

type Pt = { x: number; y: number };

export function SkyDragon({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let dpr = 1;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
    };

    // Waves and body length never shrink below a desktop-ish width, so on
    // phones it still glides instead of zig-zagging.
    const scale = () => Math.max(W, 900);

    // The flight path, as a function of x in the dragon's own (mirrored) space.
    const pathY = (x: number, t: number) => {
      const A = Math.min(H * 0.15, scale() * 0.09);
      const S = scale();
      return (
        H * 0.42 +
        A * Math.sin((2 * Math.PI * x) / (0.62 * S) + 0.9) +
        0.4 * A * Math.sin((2 * Math.PI * x) / (1.7 * S) + 2.1) +
        0.12 * A * Math.sin((2 * Math.PI * x) / (0.2 * S) - t * 1.3)
      );
    };

    // Half-width along the body: slim neck, full chest, long tapering tail.
    const profile = (k: number) =>
      k < 0.12 ? 0.7 + 0.3 * (k / 0.12) : k < 0.55 ? 1 : Math.max(0.06, 1 - Math.pow((k - 0.55) / 0.45, 1.3) * 0.94);

    const clouds = Array.from({ length: 6 }, (_, i) => ({
      x: (i + 0.3) / 6,
      y: 0.15 + ((i * 37) % 70) / 100,
      s: 0.7 + ((i * 53) % 60) / 100,
    }));

    const drawCloud = (cx: number, cy: number, s: number) => {
      const r = s * Math.min(W, 1400) * 0.028;
      ctx.beginPath();
      ctx.arc(cx - r * 1.3, cy + r * 0.25, r * 0.75, Math.PI, 0);
      ctx.arc(cx, cy - r * 0.1, r, Math.PI, 0);
      ctx.arc(cx + r * 1.35, cy + r * 0.3, r * 0.65, Math.PI, 0);
      ctx.lineTo(cx - r * 2.05, cy + r * 0.3);
      ctx.closePath();
      ctx.fillStyle = "#121210";
      ctx.fill();
      ctx.strokeStyle = BONE(0.09);
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // The curl inside the biggest puff.
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 3; a += 0.2) {
        const rr = r * 0.55 * (1 - a / (Math.PI * 3.4));
        const px = cx + Math.cos(a) * rr;
        const py = cy + Math.sin(a) * rr * 0.8;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    };

    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // Clouds drift right to left, slower than the dragon.
      for (const c of clouds) {
        const span = W * 1.3;
        const x = (((c.x * span - t * SPEED * W * 0.3) % span) + span) % span - W * 0.15;
        drawCloud(x, c.y * H, c.s);
      }

      // Everything below is drawn moving +x, then mirrored so it swims right to left.
      ctx.setTransform(-dpr, 0, 0, dpr, W * dpr, 0);

      const u = Math.max(18, Math.min(W * 0.036, 58)); // body width
      const L = LENGTH * scale();
      const margin = u * 6;
      const cycle = W + L + margin * 2;
      const head = ((t * SPEED * Math.max(W, 600) + W * 0.75) % cycle) - margin;
      const step = L / SEGMENTS;

      const P: Pt[] = [];
      for (let i = 0; i <= SEGMENTS; i++) {
        const x = head - i * step;
        P.push({ x, y: pathY(x, t) });
      }
      const T: Pt[] = P.map((_, i) => {
        const a = P[Math.max(0, i - 1)];
        const b = P[Math.min(SEGMENTS, i + 1)];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const m = Math.hypot(dx, dy) || 1;
        return { x: dx / m, y: dy / m }; // points toward the head
      });
      const N: Pt[] = T.map((d) => ({ x: -d.y, y: d.x })); // belly side
      const hw = P.map((_, i) => (u / 2) * profile(i / SEGMENTS));
      const at = (i: number, k: number): Pt => ({ x: P[i].x + N[i].x * hw[i] * k, y: P[i].y + N[i].y * hw[i] * k });

      const leg = (i: number, phase: number, near: boolean) => {
        const swing = Math.sin(t * 2.4 + phase) * 0.55;
        const hip = at(i, 0.55);
        let dx = N[i].x * 0.8 - T[i].x * 0.6;
        let dy = N[i].y * 0.8 - T[i].y * 0.6;
        const c = Math.cos(swing);
        const s = Math.sin(swing);
        [dx, dy] = [dx * c - dy * s, dx * s + dy * c];
        const knee = { x: hip.x + dx * u * 0.95, y: hip.y + dy * u * 0.95 };
        // The forearm reaches forward, toward the head, and paddles.
        const c2 = Math.cos(-0.7 - swing * 0.6);
        const s2 = Math.sin(-0.7 - swing * 0.6);
        const fx = dx * c2 - dy * s2;
        const fy = dx * s2 + dy * c2;
        const foot = { x: knee.x + fx * u * 0.7, y: knee.y + fy * u * 0.7 };
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(hip.x, hip.y);
        ctx.lineTo(knee.x, knee.y);
        ctx.lineTo(foot.x, foot.y);
        ctx.strokeStyle = BONE(near ? 0.2 : 0.1);
        ctx.lineWidth = u * 0.46;
        ctx.stroke();
        ctx.strokeStyle = near ? BODY : "#171715";
        ctx.lineWidth = u * 0.38;
        ctx.stroke();
        // Paw, and three curved claws.
        ctx.beginPath();
        ctx.arc(foot.x, foot.y, u * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = near ? BODY : "#171715";
        ctx.fill();
        ctx.strokeStyle = BONE(near ? 0.5 : 0.22);
        ctx.lineWidth = 2;
        for (const a of [-0.6, 0, 0.6]) {
          const ca = Math.cos(a);
          const sa = Math.sin(a);
          const cx = fx * ca - fy * sa;
          const cy = fx * sa + fy * ca;
          const bx = foot.x + cx * u * 0.18;
          const by = foot.y + cy * u * 0.18;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.quadraticCurveTo(bx + cx * u * 0.3, by + cy * u * 0.3, bx + (cx - cy * 0.6) * u * 0.34, by + (cy + cx * 0.6) * u * 0.34);
          ctx.stroke();
        }
      };

      const FRONT = Math.round(SEGMENTS * 0.16);
      const BACK = Math.round(SEGMENTS * 0.58);

      // Far legs sit behind the body.
      leg(FRONT + 3, Math.PI, false);
      leg(BACK + 3, 0, false);

      // Dorsal spines, pointing back along the body.
      ctx.fillStyle = "#232320";
      ctx.strokeStyle = BONE(0.16);
      ctx.lineWidth = 1;
      for (let i = 6; i < SEGMENTS * 0.92; i += 3) {
        const a = at(i, -1);
        const b = at(i + 2, -1);
        const h = hw[i] * 0.75;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x - N[i].x * h - T[i].x * h * 0.6, b.y - N[i].y * h - T[i].y * h * 0.6);
        ctx.lineTo(b.x, b.y);
        ctx.fill();
        ctx.stroke();
      }

      // Body.
      const outline = (k1: number, k2: number) => {
        ctx.beginPath();
        for (let i = 0; i <= SEGMENTS; i++) {
          const p = at(i, k1);
          if (i) ctx.lineTo(p.x, p.y);
          else ctx.moveTo(p.x, p.y);
        }
        for (let i = SEGMENTS; i >= 0; i--) {
          const p = at(i, k2);
          ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
      };
      outline(-1, 1);
      ctx.fillStyle = BODY;
      ctx.fill();
      ctx.strokeStyle = BONE(0.22);
      ctx.lineWidth = 1.2;
      ctx.stroke();
      outline(0.35, 1);
      ctx.fillStyle = BELLY;
      ctx.fill();

      // Belly plates and scale chevrons.
      ctx.strokeStyle = BONE(0.12);
      ctx.lineWidth = 1;
      for (let i = 2; i < SEGMENTS - 4; i += 2) {
        const a = at(i, 0.4);
        const b = at(i, 0.95);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.strokeStyle = BONE(0.08);
      for (let i = 4; i < SEGMENTS - 6; i += 3) {
        const a = at(i, -0.85);
        const b = at(i, 0.3);
        const m = at(i, -0.25);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(m.x + T[i].x * hw[i] * 0.9, m.y + T[i].y * hw[i] * 0.9, b.x, b.y);
        ctx.stroke();
      }

      // Near legs over the body.
      leg(FRONT, 0, true);
      leg(BACK, Math.PI, true);

      // Tail tuft.
      const tail = P[SEGMENTS];
      const tt = T[SEGMENTS];
      ctx.strokeStyle = BONE(0.24);
      ctx.lineWidth = 1.6;
      for (let k = -3; k <= 3; k++) {
        const sway = Math.sin(t * 3 + k) * u * 0.35;
        const len = u * (1.6 + (3 - Math.abs(k)) * 0.2);
        ctx.beginPath();
        ctx.moveTo(tail.x, tail.y);
        ctx.quadraticCurveTo(
          tail.x - tt.x * len * 0.5 + N[SEGMENTS].x * k * u * 0.2,
          tail.y - tt.y * len * 0.5 + N[SEGMENTS].y * k * u * 0.2,
          tail.x - tt.x * len + N[SEGMENTS].x * (k * u * 0.35 + sway),
          tail.y - tt.y * len + N[SEGMENTS].y * (k * u * 0.35 + sway),
        );
        ctx.stroke();
      }

      // Head, drawn in a 40-unit space facing +x (body width = 40).
      ctx.save();
      ctx.translate(P[0].x, P[0].y);
      ctx.rotate(Math.atan2(T[0].y, T[0].x));
      const hs = (u / 40) * 1.45; // a head with presence
      ctx.scale(hs, hs);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const w = (k: number, amp: number) => Math.sin(t * 2.6 + k) * amp;

      // Mane: flame-shaped locks streaming back and rippling.
      ctx.fillStyle = "#252522";
      ctx.strokeStyle = BONE(0.24);
      ctx.lineWidth = 1.2;
      for (let k = 7; k >= 0; k--) {
        const rx = 16 - Math.abs(k - 3.5) * 3;
        const ry = -17 + k * 4.6;
        const len = 52 + ((k * 5) % 3) * 16;
        const tipY = ry * 1.9 + w(k, 12);
        const mid = w(k + 1, 8);
        ctx.beginPath();
        ctx.moveTo(rx, ry - 4);
        ctx.quadraticCurveTo(-len * 0.4, ry - 7 + mid, -len, tipY);
        ctx.quadraticCurveTo(-len * 0.45, ry + 6 + mid, rx, ry + 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      // Horns: branching antlers.
      for (const [dx, a] of [
        [-4, 0.28],
        [0, 0.5],
      ] as const) {
        ctx.strokeStyle = BONE(a);
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(28 + dx, -16);
        ctx.bezierCurveTo(16 + dx, -36, -8 + dx, -44, -34 + dx, -40);
        ctx.moveTo(6 + dx, -33);
        ctx.bezierCurveTo(4 + dx, -46, -2 + dx, -52, -8 + dx, -58);
        ctx.moveTo(-14 + dx, -41);
        ctx.bezierCurveTo(-18 + dx, -50, -24 + dx, -54, -30 + dx, -56);
        ctx.stroke();
      }
      // Lower jaw, opening a little.
      ctx.save();
      ctx.translate(28, 5);
      ctx.rotate(0.12 + Math.sin(t * 1.1) * 0.1);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(42, 4);
      ctx.quadraticCurveTo(44, 8, 36, 10);
      ctx.bezierCurveTo(18, 13, 2, 13, -10, 9);
      ctx.closePath();
      ctx.fillStyle = "#1a1a17";
      ctx.fill();
      ctx.strokeStyle = BONE(0.3);
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.fillStyle = BONE(0.45);
      for (let x = 10; x < 40; x += 7) {
        ctx.beginPath();
        ctx.moveTo(x, 2);
        ctx.lineTo(x + 2.5, -2.5);
        ctx.lineTo(x + 5, 2.5);
        ctx.fill();
      }
      ctx.restore();
      // Skull and snout.
      ctx.beginPath();
      ctx.moveTo(-4, -15);
      ctx.bezierCurveTo(10, -22, 30, -22, 42, -12);
      ctx.bezierCurveTo(50, -10, 62, -9, 72, -4);
      ctx.quadraticCurveTo(79, -1, 74, 3);
      ctx.lineTo(30, 5);
      ctx.bezierCurveTo(18, 8, 6, 12, -4, 15);
      ctx.closePath();
      ctx.fillStyle = BODY;
      ctx.fill();
      ctx.strokeStyle = BONE(0.38);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = BONE(0.5);
      for (let x = 38; x < 70; x += 7) {
        ctx.beginPath();
        ctx.moveTo(x, 4);
        ctx.lineTo(x + 2.5, 9);
        ctx.lineTo(x + 5, 3.6);
        ctx.fill();
      }
      // Brow ridge and nostril.
      ctx.strokeStyle = BONE(0.42);
      ctx.beginPath();
      ctx.moveTo(28, -13);
      ctx.quadraticCurveTo(40, -21, 52, -11);
      ctx.moveTo(66, -3);
      ctx.quadraticCurveTo(69, -7, 71, -3);
      ctx.stroke();
      // The eye: the one warm light on the whole creature.
      ctx.shadowColor = SIGNAL;
      ctx.shadowBlur = 12;
      ctx.fillStyle = SIGNAL;
      ctx.beginPath();
      ctx.ellipse(41, -10, 4.2, 2.4, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#0d0d0c";
      ctx.fillRect(40.4, -12.2, 1.2, 4.4);
      // Whiskers, drifting.
      ctx.strokeStyle = BONE(0.4);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(68, 0);
      ctx.bezierCurveTo(50, -18 + w(0, 8), 10, 6 + w(1, 12), -80, -22 + w(2, 18));
      ctx.moveTo(64, 8);
      ctx.bezierCurveTo(46, 26 + w(3, 8), 0, 22 + w(4, 12), -70, 46 + w(5, 18));
      ctx.stroke();
      // A short beard under the jaw.
      ctx.strokeStyle = BONE(0.2);
      for (let k = 0; k < 4; k++) {
        ctx.beginPath();
        ctx.moveTo(22 + k * 5, 15);
        ctx.quadraticCurveTo(14 + k * 5, 26, 4 + k * 4 + w(k, 3), 32 + k * 2);
        ctx.stroke();
      }
      ctx.restore();
    };

    let raf = 0;
    let visible = false;
    const start = performance.now();
    const loop = (now: number) => {
      draw((now - start) / 1000);
      raf = visible ? requestAnimationFrame(loop) : 0;
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (reduce || !visible) draw(reduce ? 4 : (performance.now() - start) / 1000);
    });
    ro.observe(canvas);
    resize();
    draw(reduce ? 4 : 0);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !reduce && !raf) raf = requestAnimationFrame(loop);
    });
    if (!reduce) io.observe(canvas);

    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={className} />;
}
