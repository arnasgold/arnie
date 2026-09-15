import Chat from "@/components/Chat";

export default function Home() {
  return (
    <section className="mx-auto max-w-[1100px] px-5 sm:px-8 pt-16 sm:pt-28 pb-16">
      <div className="max-w-[760px]">
        <p className="eyebrow mb-5">Arnas Goldberg · Design engineer</p>
        <h1 className="px text-[clamp(2rem,5.5vw,4.2rem)]">
          Talk to ARNIE.md
        </h1>
        <p className="mt-5 text-[1.05rem] text-ink-2 max-w-[56ch]">
          Eighteen years of brand, product and motion, now shipped as working software. I wrote everything I&apos;m
          happy to say about myself into one file and put an AI in front of it. Ask it anything you&apos;d ask me.
        </p>
      </div>
      <div className="mt-12 max-w-[760px]">
        <Chat />
      </div>
    </section>
  );
}
