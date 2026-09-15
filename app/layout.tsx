import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { site } from "@/lib/content";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"], weight: ["400", "500", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://arnie.vercel.app"),
  title: { default: `${site.name} · Talk to ARNIE.md`, template: `%s — ${site.name}` },
  description:
    "Design engineer. Eighteen years of brand, product and motion, now shipped as working software. Currently designing and building GTE.",
  openGraph: {
    title: site.name,
    description: "Design engineer. Eighteen years of brand, product and motion, now shipped as working software.",
    images: ["/media/site/logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
