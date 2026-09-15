import Link from "next/link";
import { site } from "@/lib/content";
import { socialPaths } from "@/lib/social-paths";

const pages = [
  { href: "/", label: "Home" },
  { href: "/about/", label: "About" },
];

const iconKey: Record<string, string> = {
  Dribbble: "dribbble",
  Twitter: "x",
  Instagram: "instagram",
  LinkedIn: "linkedin",
};

export default function Footer() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="mx-auto max-w-[1100px] px-5 sm:px-8 py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5 text-sm text-ink-2">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
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

        <div className="flex items-center gap-5">
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
          <p className="eyebrow normal-case">
            © {new Date().getFullYear()} {site.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
