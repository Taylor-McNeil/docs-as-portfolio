import { marked } from "marked";

const allowedTags = new Set([
  "a",
  "abbr",
  "acronym",
  "address",
  "b",
  "big",
  "blockquote",
  "br",
  "caption",
  "center",
  "cite",
  "code",
  "col",
  "colgroup",
  "dd",
  "del",
  "details",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
  "figcaption",
  "figure",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "img",
  "ins",
  "kbd",
  "li",
  "ol",
  "p",
  "pre",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "small",
  "span",
  "strike",
  "strong",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tt",
  "u",
  "ul",
  "var",
]);

const allowedAttributes = new Set([
  "align",
  "alt",
  "axis",
  "class",
  "height",
  "href",
  "name",
  "src",
  "title",
  "width",
]);

const removeWithContents = new Set(["script", "style", "iframe", "form", "input"]);
const spacedBlockTags = new Set([
  "blockquote",
  "center",
  "details",
  "div",
  "dl",
  "figure",
  "hr",
  "ol",
  "pre",
  "table",
  "ul",
]);

export function convertMarkdownToAo3Html(markdown: string): string {
  const rawHtml = marked(markdown, {
    async: false,
    breaks: true,
    gfm: true,
  });

  return formatAo3Html(sanitizeAo3Html(rawHtml));
}

export function sanitizeAo3Html(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  sanitizeChildren(doc.body);

  return Array.from(doc.body.childNodes)
    .map(serializeNode)
    .join("");
}

function sanitizeChildren(parent: Node) {
  for (const child of Array.from(parent.childNodes)) {
    if (child.nodeType !== Node.ELEMENT_NODE) {
      continue;
    }

    sanitizeElement(child as Element);
  }
}

function sanitizeElement(element: Element) {
  const tagName = element.tagName.toLowerCase();

  if (removeWithContents.has(tagName)) {
    element.remove();
    return;
  }

  sanitizeChildren(element);

  if (!allowedTags.has(tagName)) {
    element.replaceWith(...Array.from(element.childNodes));
    return;
  }

  for (const attribute of Array.from(element.attributes)) {
    const name = attribute.name.toLowerCase();
    const value = attribute.value;

    if (!allowedAttributes.has(name) || !isSafeAttributeValue(tagName, name, value)) {
      element.removeAttribute(attribute.name);
    }
  }
}

function isSafeAttributeValue(tagName: string, attrName: string, value: string) {
  if (attrName === "href") {
    return isSafeUrl(value, ["http:", "https:", "mailto:"]);
  }

  if (attrName === "src") {
    return tagName === "img" && isSafeUrl(value, ["http:", "https:"]);
  }

  return true;
}

function isSafeUrl(value: string, allowedProtocols: string[]) {
  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  if (trimmed.startsWith("#") || trimmed.startsWith("/") || trimmed.startsWith("./") || trimmed.startsWith("../")) {
    return true;
  }

  try {
    return allowedProtocols.includes(new URL(trimmed).protocol);
  } catch {
    return false;
  }
}

function formatAo3Html(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const lines: string[] = [];

  for (const node of Array.from(doc.body.childNodes)) {
    const serialized = serializeNode(node).trim();

    if (!serialized) {
      continue;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = (node as Element).tagName.toLowerCase();

      if (spacedBlockTags.has(tagName)) {
        pushBlank(lines);
        lines.push(serialized);
        pushBlank(lines);
        continue;
      }
    }

    lines.push(serialized);
  }

  while (lines[0] === "") {
    lines.shift();
  }

  while (lines[lines.length - 1] === "") {
    lines.pop();
  }

  return lines.join("\n");
}

function pushBlank(lines: string[]) {
  if (lines.length > 0 && lines[lines.length - 1] !== "") {
    lines.push("");
  }
}

function serializeNode(node: Node) {
  if (node.nodeType === Node.ELEMENT_NODE) {
    return normalizeVoidTags((node as Element).outerHTML);
  }

  return node.textContent ?? "";
}

function normalizeVoidTags(html: string) {
  return html
    .replace(/<br>/g, "<br />")
    .replace(/<hr>/g, "<hr />")
    .replace(/<img([^>]*)>/g, "<img$1 />");
}
