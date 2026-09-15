import Link from "next/link";
import Chat from "@/components/Chat";

export default function Home() {
  return (
    <section className="mx-auto max-w-[760px] px-5 sm:px-8 pt-20 sm:pt-32 pb-16">
      <Link href="/" className="flex justify-center" aria-label="Arnas Goldberg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/site/logo.png" alt="" className="pixelated h-12 w-12 dark:invert" />
      </Link>
      <div className="mt-14">
        <Chat />
      </div>
    </section>
  );
}
