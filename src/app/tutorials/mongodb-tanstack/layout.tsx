import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MongoDB + TanStack Tutorial",
  description: "A full-stack integration guide connecting TanStack Start to MongoDB Atlas, written for MongoDB's official driver documentation.",
  alternates: {
    canonical: '/tutorials/mongodb-tanstack',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
