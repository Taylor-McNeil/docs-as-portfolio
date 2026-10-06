// entry-editor:generated
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "An Alphabet Too Short — aampersand Builder Journal",
  description: "How I built a manuscript importer for Scrivener, Word, and Markdown in 63 days, and why perfect import fidelity was never the goal.",
  alternates: { canonical: "https://taylormcneil.dev/aampersand/an-alphabet-too-short" },
  openGraph: {
    title: "An Alphabet Too Short",
    description: "Three file formats, three ideas of what a chapter is, and 63 days to make them all speak aampersand.",
    type: "article",
    url: "https://taylormcneil.dev/aampersand/an-alphabet-too-short",
    images: [{ url: "https://taylormcneil.dev/aampersand/an-alphabet-too-short/opengraph-image.png", width: 1200, height: 630, alt: "An Alphabet Too Short" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "An Alphabet Too Short",
    description: "Three file formats, three ideas of what a chapter is, and 63 days to make them all speak aampersand.",
    images: ["https://taylormcneil.dev/aampersand/an-alphabet-too-short/opengraph-image.png"],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
