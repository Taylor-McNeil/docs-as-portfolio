export interface TocItem {
  id: string;
  label: string;
  level: 2 | 3;
  duplicate: boolean;
}


export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[`*_~]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function extractToc(source: string): TocItem[] {
  const seen = new Set<string>();
  const items: TocItem[] = [];
  let inFence = false;

  for (const line of source.replace(/\r\n/g, "\n").split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(##|###)\s+(.+?)\s*$/.exec(line);
    if (!match) continue;

    const label = match[2].replace(/\s+#+\s*$/, "").trim();
    const id = slugifyHeading(label);
    if (!id) continue;

    const duplicate = seen.has(id);
    items.push({ id, label: label.replace(/[`*_~]/g, ""), level: match[1].length as 2 | 3, duplicate });
    seen.add(id);
  }

  return items;
}

