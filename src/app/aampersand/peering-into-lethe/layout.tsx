import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Peering into Lethe — Visual Plotline Tracking for Fiction Writers",
  description: "How aampersand's beat system tracks story claims independently from prose — so deleted text doesn't destroy your plot. aampersand devlog 2.",
  alternates: {
    canonical: 'https://taylormcneil.dev/aampersand/peering-into-lethe',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
