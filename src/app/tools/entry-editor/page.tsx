import { notFound } from "next/navigation";
import { loadComponentRegistrySources } from "@/components/interactive/LiveComponentRegistry";
import EntryEditor from "./entry-editor";

export const metadata = {
  title: "Entry Editor",
  robots: { index: false, follow: false },
};

export default function EntryEditorPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return <EntryEditor componentRegistrySources={loadComponentRegistrySources()} />;
}
