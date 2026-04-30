import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Oily Bodies in Karpathos — Stories Are Graphs, Not Lines",
  description: "A tagging experiment reveals that stories aren't timelines — they're graphs. How a schema crisis and a lucky bug led to aampersand's annotation engine. aampersand devlog 4.",
  alternates: {
    canonical: '/aampersand/oily-bodies-in-karpathos',
  },
  openGraph: {
    title: "Oily Bodies in Karpathos",
    description: "A tagging experiment reveals that stories aren't timelines — they're graphs. How a schema crisis and a lucky bug led to aampersand's annotation engine.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
