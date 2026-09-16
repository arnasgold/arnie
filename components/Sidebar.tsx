import Link from "next/link";
import { site } from "@/lib/content";
import { socialPaths } from "@/lib/social-paths";

const pages = [
  { href: "/", label: "Home" },
  { href: "/about/", label: "About" },
];

const iconKey: Record<string, string> = {
  Twitter: "x",
  Instagram: "instagram",
  LinkedIn: "linkedin",
};

export default function Sidebar() {
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
          {pages.map((p) => (
            <li key={p.href}>
              <Link href={p.href} className="hover:text-ink">
                {p.label}
              </Link>
            </li>
          ))}
          <li>
            <a href="/arnie.md" target="_blank" rel="noreferrer" className="hover:text-ink">
              ARNIE.md
            </a>
          </li>
          <li>
            <a href={`mailto:${site.email}`} className="hover:text-ink">
              Contact
            </a>
          </li>
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
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </aside>
  );
}
