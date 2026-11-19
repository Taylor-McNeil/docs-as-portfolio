import type { Metadata } from "next";

const SITE_NAME = "Taylor McNeil";

type PageMetadata = Metadata & {
  title: string;
  description?: string;
  alternates: { canonical: string };
};

/**
 * Fills in a page's link-preview tags (Open Graph and Twitter) from its own
 * title, description and canonical URL. Without this, Next.js reuses the root
 * layout's preview, so shared links show the homepage's title, text and URL.
 * Anything the page sets in `openGraph` or `twitter` itself wins.
 */
export function withSocial(metadata: PageMetadata): Metadata {
  const url = metadata.alternates.canonical;
  const title =
    typeof metadata.openGraph?.title === "string"
      ? metadata.openGraph.title
      : `${metadata.title} · ${SITE_NAME}`;
  const description = metadata.openGraph?.description ?? metadata.description;

  return {
    ...metadata,
    openGraph: {
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
      ...metadata.openGraph,
      title,
      description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      ...metadata.twitter,
      title,
      description,
    },
  };
}
