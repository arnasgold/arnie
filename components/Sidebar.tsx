"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

function Item({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden className={`h-1.5 w-1.5 shrink-0 ${active ? "bg-ink" : "bg-transparent"}`} />
      {children}
    </span>
  );
}

export default function Sidebar() {
  const pathname = trim(usePathname() ?? "/");

  return (
    <aside
      className="
        z-20 flex items-center justify-between gap-6
        border-b border-line px-5 py-4 text-sm text-ink-2
        sm:fixed sm:inset-y-0 sm:left-0 sm:w-[200px] sm:flex-col sm:items-stretch
        sm:border-b-0 sm:border-r sm:px-6 sm:py-8
      "
    >
      <nav>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-1.5 sm:flex-col sm:items-start sm:gap-y-2.5">
          {pages.map((p) => {
            const active = pathname === trim(p.href);
            return (
              <li key={p.href}>
                <Link
                  href={p.href}
                  aria-current={active ? "page" : undefined}
                  className={active ? "text-ink" : "hover:text-ink"}
                >
                  <Item active={active}>{p.label}</Item>
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
                className="hover:text-ink"
              >
                <Item>{e.label}</Item>
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
