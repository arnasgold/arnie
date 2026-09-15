import type { Metadata } from "next";
import Link from "next/link";
import { projects, home } from "@/lib/content";
import Showreel from "@/components/Showreel";

export const metadata: Metadata = {
  title: "Archive",
  robots: { index: false, follow: false },
};

export default function ArchivePage() {
  return (
    <section className="mx-auto max-w-[1100px] px-5 sm:px-8 pt-16 sm:pt-24">
      <p className="eyebrow mb-4">Archive · 2017–2025</p>
      <h1 className="px text-[clamp(2.2rem,5vw,3.6rem)] max-w-[24ch]">Selected work from the pre-AI era.</h1>
      <p className="mt-6 max-w-[60ch] text-ink-2">
        Case studies kept for reference. This page isn&apos;t linked from the site and is excluded from search engines.
      </p>

      <div className="mt-14 max-w-[820px]">
        <Showreel youtube={home.showreel.youtube} cover={home.showreel.cover} />
      </div>

      <div className="mt-14">
        {projects.map((p) => (
          <Link key={p.slug} href={`/archive/${p.slug}/`} className="row-link">
            <span className="eyebrow">{p.year.split(" ")[0]}</span>
            <span className="text-[1.05rem]">{p.title}</span>
            <span className="text-sm text-ink-2 text-right hidden sm:block">{p.category}</span>
          </Link>
        ))}
        <Link href="/archive/deck/" className="row-link">
          <span className="eyebrow">2022</span>
          <span className="text-[1.05rem]">Product design portfolio deck</span>
          <span className="text-sm text-ink-2 text-right hidden sm:block">21 slides</span>
        </Link>
      </div>
    </section>
  );
}
