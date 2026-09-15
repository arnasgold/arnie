import type { Metadata } from "next";
import { deck } from "@/lib/content";

export const metadata: Metadata = { title: "Portfolio deck", robots: { index: false, follow: false } };

export default function DeckPage() {
  return (
    <>
      <section className="mx-auto max-w-[1100px] px-5 sm:px-8 pt-16 sm:pt-24">
        <p className="eyebrow mb-4">2022 deck</p>
        <h1 className="px text-[clamp(2.4rem,6vw,5rem)]">{deck.title}</h1>
        <p className="mt-8 eyebrow">{deck.kicker}</p>
        <p className="px mt-2 text-[1.5rem] sm:text-[2rem] text-ink-2">{deck.clients}</p>
      </section>
      <section className="mx-auto max-w-[1100px] px-5 sm:px-8 mt-14 flex flex-col gap-4 sm:gap-6">
        {deck.slides.map((s, i) => (
          <figure key={s} className="media aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s} alt={`Slide ${i + 1}`} loading={i < 2 ? "eager" : "lazy"} />
          </figure>
        ))}
      </section>
      <p className="px text-center text-[2rem] sm:text-[3rem] mt-20">{deck.outro}</p>
    </>
  );
}
