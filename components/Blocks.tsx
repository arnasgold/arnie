import type { Block } from "@/lib/content";

function Media({ b, eager }: { b: Block; eager?: boolean }) {
  if (b.type === "image" || b.type === "still") {
    return (
      <figure className="media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={b.src}
          alt={"alt" in b ? b.alt : ""}
          width={b.width}
          height={b.height}
          loading={eager ? "eager" : "lazy"}
        />
      </figure>
    );
  }
  if (b.type === "video") {
    return (
      <figure className="media">
        <video src={b.src} poster={b.poster ?? undefined} autoPlay muted loop playsInline preload="metadata" />
      </figure>
    );
  }
  return null;
}

function Text({ b }: { b: Block }) {
  switch (b.type) {
    case "heading": {
      if (b.level <= 2) return <h2 className="px text-[1.8rem] sm:text-[2.2rem]">{b.text}</h2>;
      return <h3 className="mt-2 text-lg font-medium">{b.text}</h3>;
    }
    case "label":
      return <p className="eyebrow">{b.text}</p>;
    case "paragraph":
      return <div className="prose text-[1.05rem] text-ink-2" dangerouslySetInnerHTML={{ __html: b.html }} />;
    case "list":
      return (
        <ul className="prose text-[1.05rem] text-ink-2">
          {b.items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      );
    case "quote":
      return <blockquote className="px text-2xl">{b.text}</blockquote>;
    case "button":
      return (
        <a
          href={b.href}
          target={b.href.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          className="btn"
        >
          {b.text} <span aria-hidden>↗</span>
        </a>
      );
    case "hr":
      return <hr className="border-line" />;
    case "embed":
      return b.src ? (
        <div className="media aspect-video">
          <iframe src={b.src} className="h-full w-full" allowFullScreen />
        </div>
      ) : null;
    default:
      return null;
  }
}

const isMedia = (b: Block) => b.type === "image" || b.type === "video" || b.type === "still";
const isText = (b: Block) => !isMedia(b) && b.type !== "gallery";

type Row =
  | { kind: "pair"; left: Block[]; right: Block[] }
  | { kind: "single"; block: Block }
  | { kind: "stills"; blocks: Block[] };

/** Group blocks into rows: consecutive left/right blocks sharing a row become two columns. */
function toRows(blocks: Block[]): Row[] {
  const rows: Row[] = [];
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    if (b.type === "still") {
      const group: Block[] = [];
      while (i < blocks.length && blocks[i].type === "still") group.push(blocks[i++]);
      rows.push({ kind: "stills", blocks: group });
      continue;
    }
    if (b.type === "gallery" || b.col === "full") {
      rows.push({ kind: "single", block: b });
      i++;
      continue;
    }
    // collect a cluster of non-full blocks that sit on the same row band
    const left: Block[] = [];
    const right: Block[] = [];
    const start = b.row ?? 0;
    let j = i;
    while (j < blocks.length) {
      const c = blocks[j];
      if (c.type === "gallery" || c.col === "full") break;
      const r = c.row ?? 0;
      const sameBand = Math.abs(r - start) <= 30 || (left.length + right.length > 0 && isText(c) && (isText(left[0] ?? c) || isText(right[0] ?? c)));
      if (!sameBand) break;
      if (c.col === "left") left.push(c);
      else right.push(c);
      j++;
    }
    if (left.length && right.length) rows.push({ kind: "pair", left, right });
    else for (const c of [...left, ...right]) rows.push({ kind: "single", block: c });
    i = j;
  }
  return rows;
}

function Stack({ blocks }: { blocks: Block[] }) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((b, k) => (isMedia(b) ? <Media key={k} b={b} /> : <Text key={k} b={b} />))}
    </div>
  );
}

export default function Blocks({ blocks }: { blocks: Block[] }) {
  const rows = toRows(blocks);
  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      {rows.map((row, k) => {
        if (row.kind === "stills") {
          const portrait = row.blocks.every((b) => b.type === "still" && b.height > b.width);
          return (
            <div
              key={k}
              className={
                portrait
                  ? "grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 md:max-w-[900px] mx-auto"
                  : "grid gap-6 md:grid-cols-2"
              }
            >
              {row.blocks.map((b, j) => (
                <Media key={j} b={b} />
              ))}
            </div>
          );
        }
        if (row.kind === "single") {
          const b = row.block;
          if (b.type === "gallery")
            return (
              <div key={k} className="flex flex-col gap-4">
                {b.images.map((im) => (
                  <figure key={im.src} className="media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={im.src} alt={im.alt} loading="lazy" />
                  </figure>
                ))}
              </div>
            );
          if (isMedia(b)) return <Media key={k} b={b} />;
          return (
            <div key={k} className="max-w-[720px]">
              <Text b={b} />
            </div>
          );
        }
        const textPair = row.left.every(isText) && row.right.every(isText);
        return (
          <div
            key={k}
            className={
              textPair
                ? "grid gap-6 sm:gap-10 md:grid-cols-[1fr_1.6fr] items-start"
                : "grid gap-6 sm:gap-8 md:grid-cols-2 items-start"
            }
          >
            <Stack blocks={row.left} />
            <Stack blocks={row.right} />
          </div>
        );
      })}
    </div>
  );
}
