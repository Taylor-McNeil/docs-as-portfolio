import type { Metadata } from "next";
import { withSocial } from "@/lib/metadata";

export const metadata: Metadata = withSocial({
  title: "Java Game Development Tutorial",
  description: "A step-by-step Java tutorial for building Tic Tac Toe in the console. 75,000+ views. Kept intentionally beginner-friendly.",
  alternates: {
    canonical: 'https://taylormcneil.dev/professional-work/tutorials/java-game-dev',
  },
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
