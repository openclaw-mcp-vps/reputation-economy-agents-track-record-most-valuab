import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "@/app/globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-primary",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "600"]
});

const metadataBase = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : new URL("http://localhost:3000");

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "The Reputation Economy: Agent Track Record Platform",
    template: "%s | Agent Reputation"
  },
  description:
    "Track, score, and compare AI agent reliability across real production tasks. Use objective performance history before deploying agents into critical business flows.",
  keywords: [
    "AI agents",
    "agent reliability",
    "agent performance scoring",
    "decision quality analytics",
    "reputation economy"
  ],
  openGraph: {
    type: "website",
    title: "The Reputation Economy: Why Your Agent's Track Record Is Your Most Valuable Asset",
    description:
      "A reputation tracking system for AI agents with performance scoring, outcome analytics, and deployment confidence signals.",
    url: "/",
    siteName: "Agent Reputation"
  },
  twitter: {
    card: "summary_large_image",
    title: "The Reputation Economy: Agent Track Record Platform",
    description:
      "Monitor AI agent decision quality, outcomes, and consistency before high-stakes rollout."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetBrainsMono.variable}`}>
      <body className="text-[#e6edf3] antialiased">{children}</body>
    </html>
  );
}
