import Link from "next/link";
import { site } from "@/lib/content";

const pages = [
  { href: "/", label: "Home" },
  { href: "/about/", label: "About" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="mx-auto max-w-[1100px] px-5 sm:px-8 py-10 flex flex-col gap-5 text-sm text-ink-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
          <ul className="flex flex-wrap gap-x-5 gap-y-2 sm:justify-end">
            {site.social.map((s) => (
              <li key={s.name}>
                <a className="hover:text-ink" href={s.href} target="_blank" rel="noreferrer">
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p className="eyebrow normal-case sm:text-right">
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  );
}
