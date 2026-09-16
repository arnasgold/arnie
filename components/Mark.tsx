"use client";
import { useCallback, useEffect, useRef } from "react";
import { COMPOSER_EVENT, type ComposerDetail } from "@/lib/mark-events";

/**
 * The monogram, made of 14 squares, which unfolds into a 14-square figure.
 * Every square keeps its identity: the logo is the character, folded up.
 *
 * Logo (5x5)        Figure (6x8), facing you
 *   .###.             . . . . . .   <- the head rises into this row when turned
 *   #...#             . . # # . .   head
 *   #.###             . . . . . .
 *   #.#.#             . # # # # .   shoulders
 *   #...#             # . . # . #   hands, torso
 *                     . . . # . .   torso
 *                     . . # . # .   legs
 *                     . . # . # .   legs
 *
 * The head is two squares. Side by side it reads as facing you; stacked into a
 * one-wide column it reads as a profile. So turning the head is not a shift, it
 * is a rotation of the pair onto the column it turns toward.
 *
 * Nothing else in the core moves: bobbing it opens one-cell gaps at this size.
 * The hands are already detached, so they can breathe.
 */

type Part = "head" | "shoulder" | "hand" | "torso" | "leg";

type Cell = {
  logo: [number, number];
  body: [number, number];
  part: Part;
  /** head only: 0 is the left square, 1 is the right one */
  side?: 0 | 1;
};

const CELLS: Cell[] = [
  // the top bar of the G becomes the head and the right shoulder
  { logo: [1, 0], body: [2, 1], part: "head", side: 0 },
  { logo: [2, 0], body: [3, 1], part: "head", side: 1 },
  { logo: [3, 0], body: [3, 3], part: "shoulder" },
  // the inner crossbar becomes the rest of the shoulder line and the torso
  { logo: [2, 2], body: [2, 3], part: "shoulder" },
  { logo: [3, 2], body: [3, 4], part: "torso" },
  { logo: [2, 3], body: [3, 5], part: "torso" },
  // the left spine of the G becomes the left side, top to bottom
  { logo: [0, 1], body: [0, 4], part: "hand" },
  { logo: [0, 2], body: [1, 3], part: "shoulder" },
  { logo: [0, 3], body: [2, 6], part: "leg" },
  { logo: [0, 4], body: [2, 7], part: "leg" },
  // the right spine becomes the right side
  { logo: [4, 1], body: [5, 4], part: "hand" },
  { logo: [4, 2], body: [4, 3], part: "shoulder" },
  { logo: [4, 3], body: [4, 6], part: "leg" },
  { logo: [4, 4], body: [4, 7], part: "leg" },
];

const GRID_W = 7;
const GRID_H = 8;
const LOGO_ORIGIN: [number, number] = [1, 1.5];
const BODY_ORIGIN: [number, number] = [0.5, 0];

const FPS = 12; // low frame rate is most of the charm
const FOLD_MS = 240; // three frames at 12fps: a snap, not a dissolve
const BREATH_MS = 3400;

// how far the cursor has to be off-centre before the head turns, and how far
// back it has to come before the head faces front again
const TURN_ON_PX = 40;
const TURN_OFF_PX = 18;

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

/**
 * Where a head square sits for a given turn.
 * Facing you the pair is side by side. Turned, the pair stacks on the column it
 * turns toward, and the square furthest from that direction is the one that rises.
 */
function headPos(side: 0 | 1, turn: -1 | 0 | 1): [number, number] {
  if (turn === 0) return [2 + side, 1];
  const col = turn > 0 ? 3 : 2;
  const rises = turn > 0 ? 0 : 1; // turning right, the left square rises
  return [col, side === rises ? 0 : 1];
}

export default function Mark({
  cell = 11,
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
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const turn = useRef<-1 | 0 | 1>(0);

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

    /** Follow the cursor, with a dead zone so the head doesn't flicker. */
    function updateTurn() {
      const p = pointer.current;
      if (!p || reduced.current) return;
      const r = canvas!.getBoundingClientRect();
      const dx = p.x - (r.left + r.width / 2);
      const current = turn.current;
      const threshold = current === 0 ? TURN_ON_PX : TURN_OFF_PX;
      if (Math.abs(dx) < threshold) turn.current = 0;
      else turn.current = dx > 0 ? 1 : -1;
    }

    /** With no cursor on the page, glance around on a slow, detuned rhythm. */
    function idleTurn(t: number): -1 | 0 | 1 {
      const v = clamp(Math.round((Math.sin(t * 0.29) + Math.sin(t * 0.17)) * 0.42), -1, 1);
      return v as -1 | 0 | 1;
    }

    function paint(now: number) {
      const f = fold.current;
      if (f.to !== f.v) {
        const p = clamp((now - f.start) / FOLD_MS, 0, 1);
        f.v = f.from + (f.to - f.from) * p;
      }
      const e = easeInOut(clamp(f.v, 0, 1));
      const t = now / 1000;

      if (now - inkAge > 1000) {
        ink = getComputedStyle(canvas!).color;
        inkAge = now;
      }

      if (pointer.current) updateTurn();
      else if (!reduced.current) turn.current = idleTurn(t);
      const look = e > 0.5 ? turn.current : 0;

      // the hands rest below the shoulders and drop a row on the exhale
      const handsDown = !reduced.current && Math.sin((t / (BREATH_MS / 1000)) * Math.PI * 2) > 0.62;

      ctx!.clearRect(0, 0, GRID_W * cell, GRID_H * cell);
      ctx!.fillStyle = ink;

      for (const c of CELLS) {
        const lx = LOGO_ORIGIN[0] + c.logo[0];
        const ly = LOGO_ORIGIN[1] + c.logo[1];

        let [bcx, bcy] = c.body;
        if (c.part === "head") [bcx, bcy] = headPos(c.side ?? 0, look);
        if (c.part === "hand" && handsDown) bcy += 1;

        const bx = BODY_ORIGIN[0] + bcx;
        const by = BODY_ORIGIN[1] + bcy;
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

    const onPointer = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      pointer.current = null;
      turn.current = 0;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerleave", onLeave);

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
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
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
