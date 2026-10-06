import type { Metadata } from "next";
import { GuideHeader } from "@/components/content/GuideHeader";

const description = "The importer I didn't have 63 days before launch. Three file formats with three ideas of what a chapter is, a review screen that asks before it assumes, and the 300 hours I decided not to spend.";

export const metadata: Metadata = {
  title: "An Alphabet Too Short",
  description,
  alternates: { canonical: "https://taylormcneil.dev/aampersand/an-alphabet-too-short" },
  openGraph: { title: "An Alphabet Too Short", description, type: "article" },
};

export default function AnAlphabetTooShortPage() {
  return (
    <div className="space-y-8">
      <GuideHeader title="An Alphabet Too Short" method="GET" endpoint="/aampersand/an-alphabet-too-short" />
      <p className="font-mono text-sm text-foreground-muted">Jul–Aug 2026 · translation</p>
      <p className="text-lg leading-8 text-foreground-muted">{description}</p>
      <figure className="border border-border-card bg-surface-terminal p-6">
        <pre className="text-sm leading-7 text-foreground">{`.scriv   binder
.docx    styles
.md      #  ---
     ↓
part ▸ chapter ▸ scene`}</pre>
        <figcaption className="mt-4 text-sm italic text-foreground-muted">close enough is a book</figcaption>
      </figure>
    </div>
  );
}
