import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "On Good Tutorials",
  description: "I built a tool to score AI-generated tutorials against rubrics. The scores converged — then diverged. What the numbers can't tell you about teaching.",
  alternates: {
    canonical: 'https://www.taylormcneil.dev/case-studies/on-good-tutorials',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
