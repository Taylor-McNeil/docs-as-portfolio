import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A Sword for Every Hand — One Primitive, Infinite Surfaces",
  description: "Five writers pick up aampersand for the first time. Their feature requests reveal that one primitive — the Spark — can power every surface they need. aampersand devlog 5.",
  alternates: {
    canonical: 'https://taylormcneil.dev/aampersand/a-sword-for-every-hand',
  },
  openGraph: {
    title: "A Sword for Every Hand",
    description: "Five writers pick up aampersand for the first time. Their feature requests reveal that one primitive — the Spark — can power every surface they need.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
