import type { Metadata } from "next";
import { withSocial } from "@/lib/metadata";

export const metadata: Metadata = withSocial({
  title: "A Siren's Song — Building a Writing Tool for Complex Fiction",
  description: "Why VS Code's multi-pane interface is wrong for writers, and how a failed first design led to a two-pane architecture for complex fiction. aampersand devlog 1.",
  alternates: {
    canonical: 'https://taylormcneil.dev/aampersand/a-sirens-song',
  },
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
