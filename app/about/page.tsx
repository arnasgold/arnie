import type { Metadata } from "next";
import { about, site } from "@/lib/content";
import Blocks from "@/components/Blocks";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  const heading = about.find((b) => b.type === "heading");
  const rest = about.filter((b) => b !== heading && b.type !== "image").map((b) => ({ ...b, col: "full" as const }));
  return (
    <section className="mx-auto max-w-[1100px] px-5 sm:px-8 pt-16 sm:pt-24">
      <div className="grid gap-12 md:grid-cols-[1fr_1.6fr] items-start">
        <div className="media aspect-square max-w-[360px] md:sticky md:top-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/about/profile-photo.webp" alt={site.name} loading="eager" />
        </div>
        <div>
          <p className="eyebrow mb-4">About</p>
          <h1 className="px text-[clamp(2.2rem,5vw,3.6rem)] mb-10">
            {heading && heading.type === "heading" ? heading.text : site.name}
          </h1>
          <Blocks blocks={rest} />
        </div>
      </div>
    </section>
  );
}
