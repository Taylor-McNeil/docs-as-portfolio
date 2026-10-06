import { notFound } from "next/navigation";
import { loadComponentRegistrySources } from "@/components/interactive/LiveComponentRegistry";
import { PreviewFrame } from "./preview-frame";

export const metadata = { title: "Entry phone preview", robots: { index: false, follow: false } };

export default function PreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <PreviewFrame componentRegistrySources={loadComponentRegistrySources()} />;
}
