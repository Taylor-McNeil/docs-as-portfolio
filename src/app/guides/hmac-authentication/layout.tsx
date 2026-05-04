import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HMAC Authentication Guide",
  description: "A practical guide to HMAC API authentication — how request signing works, why it matters, and how to implement it step by step.",
  alternates: {
    canonical: 'https://taylormcneil.dev/guides/hmac-authentication',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
