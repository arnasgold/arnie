"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { projects } from "@/lib/content";

type Msg = { role: "user" | "assistant"; content: string };

const DEFAULT_SUGGESTIONS = [
  "What are you building at GTE?",
  "Show me some of your motion work.",
  "How do you use AI in your process?",
  "Why call yourself a design engineer?",
  "What did you do at Ready?",
  "Are you actually Arnas?",
];

function ProjectCard({ slug }: { slug: string }) {
  const p = projects.find((x) => x.slug === slug);
  if (!p) return null;
  return (
    <Link href={`/archive/${p.slug}/`} className="group my-3 grid grid-cols-[112px_1fr] gap-4 border border-line hover:bg-paper-2">
      <div className="media aspect-[4/3]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.card} alt={p.title} className="h-full w-full object-cover" />
      </div>
      <div className="py-3 pr-4 min-w-0">
        <p className="eyebrow">{p.year.split(" ")[0]} · {p.category}</p>
        <p className="mt-1 font-medium">{p.title}</p>
        <p className="mt-1 text-sm text-ink-2 truncate">{p.deliverables.join(", ")}</p>
      </div>
    </Link>
  );
}

function Media({ src, caption }: { src: string; caption?: string }) {
  if (!src.startsWith("/media/")) return null;
  const video = /\.(mp4|webm)$/i.test(src);
  return (
    <figure className="my-3 max-w-[480px]">
      <div className="media">
        {video ? (
          <video src={src} autoPlay muted loop playsInline preload="metadata" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={caption ?? ""} loading="lazy" />
        )}
      </div>
      {caption && <figcaption className="mt-2 text-xs text-muted">{caption}</figcaption>}
    </figure>
  );
}

/** Render assistant text, expanding [[project:slug]] and [[media:/path|caption]] markers. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\[\[(?:project|media):[^\]]+\]\])/g);
  return (
    <div className="prose text-[1rem]">
      {parts.map((part, i) => {
        const m = part.match(/^\[\[(project|media):([^\]|]+)(?:\|([^\]]*))?\]\]$/);
        if (!m) {
          return part.split(/\n{2,}/).map((para, j) =>
            para.trim() ? (
              <p key={`${i}-${j}`} className="whitespace-pre-wrap">
                {para.trim()}
              </p>
            ) : null,
          );
        }
        if (m[1] === "project") return <ProjectCard key={i} slug={m[2].trim()} />;
        return <Media key={i} src={m[2].trim()} caption={m[3]?.trim()} />;
      })}
    </div>
  );
}

export default function Chat({
  context,
  suggestions = DEFAULT_SUGGESTIONS,
  compact = false,
  placeholder = "Ask me anything about my work…",
}: {
  context?: string;
  suggestions?: string[];
  compact?: boolean;
  placeholder?: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messages.length) endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: q }, { role: "assistant", content: "" }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(0, -1), context }),
      });
      if (!res.ok || !res.body) {
        const err = await res.text();
        setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: err || "Something went wrong." }]);
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: acc }]);
      }
    } catch {
      setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: "Connection dropped. Try again." }]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const showSuggestions = messages.length === 0;

  return (
    <div className="w-full">
      {messages.length > 0 && (
        <div className={`flex flex-col gap-6 ${compact ? "mb-6" : "mb-8"}`} aria-live="polite">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <p key={i} className="self-end max-w-[85%] border border-line px-4 py-2.5 text-[1rem]">
                {m.content}
              </p>
            ) : (
              <div key={i} className="max-w-[85%]">
                <p className="eyebrow mb-2">Arnie</p>
                {m.content ? <Rich text={m.content} /> : <span className="inline-block h-4 w-2 bg-ink animate-pulse" aria-label="Thinking" />}
              </div>
            ),
          )}
          <div ref={endRef} />
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border border-ink bg-paper focus-within:shadow-[4px_4px_0_var(--ink)] transition-shadow"
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          rows={compact ? 1 : 2}
          maxLength={1500}
          placeholder={placeholder}
          aria-label="Message Arnie"
          className="block w-full resize-none bg-transparent px-4 py-3 text-[1.05rem] outline-none placeholder:text-muted"
        />
        <div className="flex items-center justify-between px-3 pb-3">
          <span className="text-xs text-muted">
            Arnie is an AI trained on{" "}
            <a href="/arnie.md" className="underline underline-offset-2 hover:text-ink" target="_blank" rel="noreferrer">
              ARNIE.md
            </a>
            . Enter to send.
          </span>
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="btn !py-1.5 !px-3 disabled:opacity-40 disabled:hover:transform-none disabled:hover:shadow-none"
          >
            Send
          </button>
        </div>
      </form>

      {showSuggestions && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => send(s)}
                className="border border-line px-3 py-1.5 text-sm text-ink-2 hover:border-ink hover:text-ink"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
