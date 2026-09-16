"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { site } from "@/lib/content";
import { socialPaths } from "@/lib/social-paths";

const pages = [
  { href: "/", label: "Home" },
  { href: "/about/", label: "About" },
];

const external = [
  { href: "/arnie.md", label: "ARNIE.md", newTab: true },
  { href: `mailto:${site.email}`, label: "Contact", newTab: false },
];

const iconKey: Record<string, string> = {
  Twitter: "x",
  Instagram: "instagram",
  LinkedIn: "linkedin",
};

const trim = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);

// overshoot, so the square arrives with a bit of weight
const EASE = "cubic-bezier(0.34, 1.56, 0.64, 1)";

export default function Sidebar() {
  const pathname = trim(usePathname() ?? "/");
  const active = pages.find((p) => trim(p.href) === pathname)?.href ?? null;

  const navRef = useRef<HTMLElement>(null);
  const slots = useRef<Record<string, HTMLSpanElement | null>>({});
  const [pos, setPos] = useState({ x: 0, y: 0, shown: false });
  const [animate, setAnimate] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const nav = navRef.current;
      const slot = active ? slots.current[active] : null;
      if (!nav || !slot) {
        setPos((p) => ({ ...p, shown: false }));
        return;
      }
      const n = nav.getBoundingClientRect();
      const s = slot.getBoundingClientRect();
      setPos({ x: s.left - n.left, y: s.top - n.top, shown: true });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (navRef.current) ro.observe(navRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [active, pathname]);

  // never animate the first placement, only moves after it
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <aside
      className="
        z-20 flex items-center justify-between gap-6
        border-b border-line px-5 py-4 text-sm text-ink-2
        sm:fixed sm:inset-y-0 sm:left-0 sm:w-[200px] sm:flex-col sm:items-stretch
        sm:border-b-0 sm:border-r sm:px-6 sm:py-8
      "
    >
      <nav ref={navRef} className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-1.5 w-1.5 bg-ink motion-reduce:transition-none"
          style={{
            transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
            opacity: pos.shown ? 1 : 0,
            transition: animate ? `transform 440ms ${EASE}, opacity 200ms linear` : "none",
          }}
        />
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-1.5 sm:flex-col sm:items-start sm:gap-y-2.5">
          {pages.map((p) => {
            const isActive = active === p.href;
            return (
              <li key={p.href}>
                <Link
                  href={p.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-2 ${isActive ? "text-ink" : "hover:text-ink"}`}
                >
                  <span
                    aria-hidden
                    ref={(el) => {
                      slots.current[p.href] = el;
                    }}
                    className="h-1.5 w-1.5 shrink-0"
                  />
                  {p.label}
                </Link>
              </li>
            );
          })}
          {external.map((e) => (
            <li key={e.href}>
              <a
                href={e.href}
                target={e.newTab ? "_blank" : undefined}
                rel={e.newTab ? "noreferrer" : undefined}
                className="flex items-center gap-2 hover:text-ink"
              >
                <span aria-hidden className="h-1.5 w-1.5 shrink-0" />
                {e.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-4 sm:flex-col sm:items-start sm:gap-4">
        <ul className="flex items-center gap-4">
          {site.social.map((s) => {
            const d = socialPaths[iconKey[s.name]];
            if (!d) return null;
            return (
              <li key={s.name}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.name}
                  title={s.name}
                  className="block text-ink-2 hover:text-ink"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden focusable="false">
                    <path d={d} />
                  </svg>
                </a>
              </li>
            );
          })}
        </ul>
        <p className="eyebrow normal-case whitespace-nowrap hidden sm:block">
          © {new Date().getFullYear()} Arnie
        </p>
      </div>
    </aside>
  );
}
