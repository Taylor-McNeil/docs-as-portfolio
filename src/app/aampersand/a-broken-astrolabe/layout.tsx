import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A Broken Astrolabe — Why Deep Customization Demands Strict Primitives",
  description: "A Tailwind CSS collision broke my navbar. Fixing it revealed that wild user customization requires rigid UI primitives underneath — not the other way around. aampersand devlog 3.",
  alternates: {
    canonical: 'https://taylormcneil.dev/aampersand/a-broken-astrolabe',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
