"use client";
import { useCallback, useEffect, useRef } from "react";
import { COMPOSER_EVENT, type ComposerDetail } from "@/lib/mark-events";

/**
 * The monogram, made of 14 squares, which unfolds into a 14-square figure.
 * Every square keeps its identity: the logo is the character, folded up.
 *
 * Logo (5x5)        Figure (4x6)
 *   .###.             .##.   head
 *   #...#             .##.   head
 *   #.###             ####   arms + chest
 *   #.#.#             .##.   torso
 *   #...#             #..#   legs
 *                     #..#   feet
 *
 * The idle only moves parts that can leave the body without tearing a hole in
 * it. Bobbing the core opens one-cell gaps at this size, so the arms do the
 * breathing and the head does the looking.
 */

type Part = "head" | "arm" | "chest" | "torso" | "leg" | "foot";

const CELLS: { logo: [number, number]; body: [number, number]; part: Part }[] = [
  // top bar of the G becomes the head
  { logo: [1, 0], body: [1, 0], part: "head" },
  { logo: [2, 0], body: [2, 0], part: "head" },
  { logo: [3, 0], body: [2, 1], part: "head" },
  // the G's inner crossbar becomes the rest of the head and the chest
  { logo: [2, 2], body: [1, 1], part: "head" },
  { logo: [3, 2], body: [1, 2], part: "chest" },
  { logo: [2, 3], body: [2, 2], part: "chest" },
  // left spine of the G becomes the left side of the body, top to bottom
  { logo: [0, 1], body: [0, 2], part: "arm" },
  { logo: [0, 2], body: [1, 3], part: "torso" },
  { logo: [0, 3], body: [0, 4], part: "leg" },
  { logo: [0, 4], body: [0, 5], part: "foot" },
  // right spine becomes the right side
  { logo: [4, 1], body: [3, 2], part: "arm" },
  { logo: [4, 2], body: [2, 3], part: "torso" },
  { logo: [4, 3], body: [3, 4], part: "leg" },
  { logo: [4, 4], body: [3, 5], part: "foot" },
];

const GRID_W = 7;
const GRID_H = 8;
const LOGO_ORIGIN: [number, number] = [1, 1.5];
const BODY_ORIGIN: [number, number] = [1.5, 1];

const FPS = 12; // low frame rate is most of the charm
const FOLD_MS = 240; // three frames at 12fps: a snap, not a dissolve
const BREATH_MS = 3400;

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

/** Idle offsets in whole cells. Only limbs move, so the body never tears. */
function idleOffset(part: Part, t: number) {
  const phase = (t / (BREATH_MS / 1000)) * Math.PI * 2;
  // arms rest at the shoulders and drop to the hips on the exhale
  const armsDown = Math.sin(phase) > 0.62;
  // two detuned sines, so the occasional glance never feels metronomic
  const look = clamp(Math.round((Math.sin(t * 0.29) + Math.sin(t * 0.17)) * 0.42), -1, 1);
  switch (part) {
    case "head":
      return { x: look, y: 0 };
    case "arm":
      return { x: 0, y: armsDown ? 1 : 0 };
    default:
      return { x: 0, y: 0 }; // the core and the legs stay put
  }
}

export default function Mark({
  cell = 8,
  className = "",
  autoUnfoldAfter = null,
}: {
  cell?: number;
  className?: string;
  autoUnfoldAfter?: number | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fold = useRef({ v: 0, from: 0, to: 0, start: 0 });
  const reduced = useRef(false);

  const setFold = useCallback((to: 0 | 1) => {
    const f = fold.current;
    if (f.to === to) return;
    if (reduced.current) {
      f.v = to;
      f.from = to;
      f.to = to;
      return;
    }
    f.from = f.v;
    f.to = to;
    f.start = performance.now();
  }, []);

  const toggle = useCallback(() => {
    setFold(fold.current.to >= 0.5 ? 0 : 1);
  }, [setFold]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = mq.matches;
    const onMq = (e: MediaQueryListEvent) => {
      reduced.current = e.matches;
    };
    mq.addEventListener("change", onMq);

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = GRID_W * cell * dpr;
    canvas.height = GRID_H * cell * dpr;
    canvas.style.width = `${GRID_W * cell}px`;
    canvas.style.height = `${GRID_H * cell}px`;
    ctx.scale(dpr, dpr);

    let ink = getComputedStyle(canvas).color;
    let inkAge = 0;

    function paint(now: number) {
      const f = fold.current;
      if (f.to !== f.v) {
        const p = clamp((now - f.start) / FOLD_MS, 0, 1);
        f.v = f.from + (f.to - f.from) * p;
      }
      const e = easeInOut(clamp(f.v, 0, 1));
      const t = now / 1000;

      // re-read the theme colour occasionally so light/dark switches follow
      if (now - inkAge > 1000) {
        ink = getComputedStyle(canvas!).color;
        inkAge = now;
      }

      ctx!.clearRect(0, 0, GRID_W * cell, GRID_H * cell);
      ctx!.fillStyle = ink;

      for (const c of CELLS) {
        const lx = LOGO_ORIGIN[0] + c.logo[0];
        const ly = LOGO_ORIGIN[1] + c.logo[1];
        const off = reduced.current ? { x: 0, y: 0 } : idleOffset(c.part, t);
        const bx = BODY_ORIGIN[0] + c.body[0] + off.x * e;
        const by = BODY_ORIGIN[1] + c.body[1] + off.y * e;
        const x = Math.round(lx + (bx - lx) * e);
        const y = Math.round(ly + (by - ly) * e);
        ctx!.fillRect(x * cell, y * cell, cell, cell);
      }
    }

    let raf = 0;
    let last = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const settled = fold.current.v === fold.current.to;
      const still = reduced.current || (settled && fold.current.v === 0);
      if (still) {
        if (last !== -1) {
          paint(now);
          last = -1; // painted the resting state, stop redrawing
        }
        return;
      }
      if (now - last < 1000 / FPS) return;
      last = now;
      paint(now);
    };
    raf = requestAnimationFrame(frame);

    const onComposer = (e: Event) => {
      const detail = (e as CustomEvent<ComposerDetail>).detail;
      setFold(detail?.focused ? 1 : 0);
    };
    window.addEventListener(COMPOSER_EVENT, onComposer);

    const timer =
      autoUnfoldAfter == null ? null : window.setTimeout(() => setFold(1), autoUnfoldAfter);

    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", onMq);
      window.removeEventListener(COMPOSER_EVENT, onComposer);
      if (timer) clearTimeout(timer);
    };
  }, [cell, autoUnfoldAfter, setFold]);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Arnas Goldberg. Fold the mark."
      title="Fold"
      className={`block cursor-pointer text-ink ${className}`}
    >
      <canvas ref={canvasRef} className="block" />
    </button>
  );
}
