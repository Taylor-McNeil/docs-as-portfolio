import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Building Docs From Scratch",
  description: "What I learned building a file-based documentation system on Next.js and MDX instead of reaching for Docusaurus or Mintlify — and where hand-rolling it hurts.",
  alternates: {
    canonical: 'https://taylormcneil.dev/field-notes/on-building-a-doc-system',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
