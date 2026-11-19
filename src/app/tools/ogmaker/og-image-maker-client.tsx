"use client";

import dynamic from "next/dynamic";

// Client-only: the maker reads saved work from localStorage on first render,
// which the server can't know about.
const OgImageMaker = dynamic(() => import("./og-image-maker"), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gray-50" />,
});

export default function OgImageMakerClient() {
  return <OgImageMaker />;
}
