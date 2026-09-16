import Chat from "@/components/Chat";
import Mark from "@/components/Mark";

export default function Home() {
  return (
    <section className="flex flex-1 flex-col justify-center px-5 sm:px-8 py-16">
      <div className="mx-auto w-full max-w-[760px]">
        <div className="flex justify-center">
          <Mark cell={11} />
        </div>
        <div className="mt-10">
          <Chat />
        </div>
      </div>
    </section>
  );
}
