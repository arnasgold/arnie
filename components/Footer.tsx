import { site } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="mx-auto max-w-[1100px] px-5 sm:px-8 py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-ink-2">
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {site.social.map((s) => (
            <li key={s.name}>
              <a className="hover:text-ink" href={s.href} target="_blank" rel="noreferrer">
                {s.name}
              </a>
            </li>
          ))}
        </ul>
        <p className="eyebrow normal-case">
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  );
}
