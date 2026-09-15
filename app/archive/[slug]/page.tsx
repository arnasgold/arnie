import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, getProject } from "@/lib/content";
import Blocks from "@/components/Blocks";
import Chat from "@/components/Chat";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  return { title: p?.title ?? "Project", robots: { index: false, follow: false }, openGraph: p ? { images: [p.cover.src] } : undefined };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const idx = projects.findIndex((p) => p.slug === slug);
  const next = projects[(idx + 1) % projects.length];
  const prev = projects[(idx - 1 + projects.length) % projects.length];

  return (
    <article>
      <header className="mx-auto max-w-[1100px] px-5 sm:px-8 pt-14 sm:pt-24">
        <Link href="/archive/" className="eyebrow inline-block mb-8 hover:text-ink">← Archive</Link>
        <p className="eyebrow mb-4">
          {project.year} · {project.category}
        </p>
        <h1 className="px text-[clamp(2.6rem,7vw,6rem)] max-w-[14ch]">{project.title}</h1>
      </header>

      <div className="mx-auto max-w-[1400px] px-3 sm:px-6 mt-12">
        <figure className="media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.cover.src}
            alt={project.title}
            width={project.cover.width}
            height={project.cover.height}
            loading="eager"
          />
        </figure>
      </div>

      <section className="mx-auto max-w-[1100px] px-5 sm:px-8 mt-16 sm:mt-24 grid gap-10 md:grid-cols-[1fr_1.6fr]">
        <aside className="flex flex-col gap-8 text-sm md:sticky md:top-24 self-start">
          <div>
            <p className="eyebrow mb-3">Deliverables</p>
            <ul className="flex flex-col gap-1 text-ink-2">
              {project.deliverables.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-3">Year</p>
            <p className="text-ink-2">{project.year}</p>
          </div>
          {project.link && (
            <a
              href={project.link.href}
              target="_blank"
              rel="noreferrer"
              className="btn w-fit"
            >
              {project.link.text} <span aria-hidden>↗</span>
            </a>
          )}
        </aside>
        <div className="flex flex-col gap-8">
          <Blocks blocks={project.intro} />
        </div>
      </section>

      {project.introMedia.length > 0 && (
        <section className="mx-auto max-w-[1100px] px-5 sm:px-8 mt-16 sm:mt-24">
          <Blocks blocks={project.introMedia} />
        </section>
      )}

      {project.sections.map((s, i) => (
        <section
          key={i}
          className={
            s.theme === "dark-bold"
              ? "mt-20 sm:mt-28 border-t border-line pt-16 sm:pt-24"
              : s.theme === "bright"
                ? "mt-20 sm:mt-28 pt-16 sm:pt-24 border-t border-line"
                : "mt-20 sm:mt-28"
          }
        >
          <div className="mx-auto max-w-[1100px] px-5 sm:px-8">
            <Blocks blocks={s.blocks} />
          </div>
        </section>
      ))}

      <section className="mx-auto max-w-[1100px] px-5 sm:px-8 mt-24 sm:mt-32">
        <p className="eyebrow mb-4">Ask about this project</p>
        <div className="max-w-[760px]">
          <Chat
            compact
            context={project.slug}
            placeholder={`Ask me about ${project.title}…`}
            suggestions={[
              "What did you actually build here?",
              "What would you do differently today?",
              "What was the hardest part?",
              "Who was the team?",
            ]}
          />
        </div>
      </section>

      <nav className="mx-auto max-w-[1100px] px-5 sm:px-8 mt-28 grid grid-cols-2 gap-6 border-t border-line pt-10">
        <Link href={`/archive/${prev.slug}/`} className="group">
          <p className="eyebrow mb-2">← Previous</p>
          <p className="px text-2xl sm:text-3xl group-hover:text-ink-2">{prev.title}</p>
        </Link>
        <Link href={`/archive/${next.slug}/`} className="group text-right">
          <p className="eyebrow mb-2">Next →</p>
          <p className="px text-2xl sm:text-3xl group-hover:text-ink-2">{next.title}</p>
        </Link>
      </nav>
    </article>
  );
}
