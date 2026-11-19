import type { Metadata } from "next";
import { withSocial } from "@/lib/metadata";

export const metadata: Metadata = withSocial({
  title: "MongoDB + TanStack Tutorial",
  description: "A full-stack integration guide connecting TanStack Start to MongoDB Atlas, written for MongoDB's official driver documentation.",
  alternates: {
    canonical: 'https://taylormcneil.dev/professional-work/tutorials/mongodb-tanstack',
  },
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
