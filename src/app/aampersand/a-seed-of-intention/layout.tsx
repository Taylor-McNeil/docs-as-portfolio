import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A Seed of Intention — Building Offline Resilience Without a Sync Engine",
  description: "Why offline mode for a solo SaaS annotation graph meant an intent-replay queue instead of a sync engine, and what it took to make reconnection honest. aampersand devlog 6.",
  alternates: {
    canonical: 'https://taylormcneil.dev/aampersand/a-seed-of-intention',
  },
  openGraph: {
    title: "A Seed of Intention",
    description: "Why offline mode for a solo SaaS annotation graph meant an intent-replay queue instead of a sync engine, and what it took to make reconnection honest.",
    type: "article",
    images: [{ width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
