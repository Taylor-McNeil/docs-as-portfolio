import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Java Game Development Tutorial",
  description: "A step-by-step Java tutorial for building Tic Tac Toe in the console. 75,000+ views. Kept intentionally beginner-friendly.",
  alternates: {
    canonical: 'https://taylormcneil.dev/tutorials/java-game-dev',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
