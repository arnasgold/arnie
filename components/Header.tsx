import Link from "next/link";
import { site } from "@/lib/content";

export default function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto max-w-[1100px] px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/site/logo.png" alt="" className="pixelated h-6 w-6 dark:invert" />
          <span className="px text-[1.05rem] tracking-[-0.02em]">Arnas Goldberg</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/about/" className="text-ink-2 hover:text-ink">
            About
          </Link>
          <a href="/arnie.md" target="_blank" rel="noreferrer" className="text-ink-2 hover:text-ink">
            ARNIE.md
          </a>
          <a href={`mailto:${site.email}`} className="text-ink-2 hover:text-ink">
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
