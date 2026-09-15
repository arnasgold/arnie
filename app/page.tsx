import Chat from "@/components/Chat";
import Mark from "@/components/Mark";

export default function Home() {
  return (
    <section className="mx-auto max-w-[760px] px-5 sm:px-8 pt-20 sm:pt-32 pb-16">
      <div className="flex justify-center">
        <Mark cell={11} />
      </div>
      <div className="mt-10">
        <Chat />
      </div>
    </section>
  );
}
