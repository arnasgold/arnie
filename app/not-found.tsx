import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-[1200px] px-5 sm:px-8 pt-24 sm:pt-40 text-center">
      <p className="eyebrow mb-4">404</p>
      <h1 className="px text-[clamp(2.4rem,6vw,5rem)]">This page doesn&apos;t exist.</h1>
      <Link href="/" className="inline-block underline underline-offset-4 mt-8 text-sm text-ink-2 hover:text-ink">
        Back home
      </Link>
    </section>
  );
}
