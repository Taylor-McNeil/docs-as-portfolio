export const DEFAULT_ANNOTATION_ARTBOARD = {
  width: 1000,
  height: 700,
} as const;

export interface AnnotationPoint {
  x: number;
  y: number;
}

interface AnnotationMarkBase {
  id: string;
  color?: string;
}

export interface InkAnnotation extends AnnotationMarkBase {
  type: "ink";
  points: AnnotationPoint[];
  width?: number;
}

export interface ArrowAnnotation extends AnnotationMarkBase {
  type: "arrow";
  points: AnnotationPoint[];
  width?: number;
}

export interface TextAnnotation extends AnnotationMarkBase {
  type: "text";
  x: number;
  y: number;
  text: string;
  size?: number;
  width?: number;
  rotation?: number;
}

export type AnnotationMark = InkAnnotation | ArrowAnnotation | TextAnnotation;

export interface AnnotationSet {
  version: 1;
  sourceHash: string;
  showBackground?: boolean;
  artboard?: {
    width: number;
    height: number;
  };
  marks: AnnotationMark[];
}

export type AnnotationTool = "select" | "pen" | "arrow" | "text" | "erase";

export function annotationSourceHash(source: string): string {
  const normalized = source.replace(/\r\n/g, "\n").trim();
  let hash = 0x811c9dc5;

  for (let index = 0; index < normalized.length; index += 1) {
    hash ^= normalized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function createAnnotationMarkId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `mark-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createAnnotationSet(
  source: string,
  marks: AnnotationMark[] = [],
  showBackground = true,
): AnnotationSet {
  return {
    version: 1,
    sourceHash: annotationSourceHash(source),
    showBackground,
    artboard: { ...DEFAULT_ANNOTATION_ARTBOARD },
    marks,
  };
}

export function annotationPath(points: AnnotationPoint[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y} l 0.01 0`;
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  const segments = [`M ${points[0].x} ${points[0].y}`];
  for (let index = 1; index < points.length - 1; index += 1) {
    const point = points[index];
    const next = points[index + 1];
    const midpoint = {
      x: (point.x + next.x) / 2,
      y: (point.y + next.y) / 2,
    };
    segments.push(`Q ${point.x} ${point.y} ${midpoint.x} ${midpoint.y}`);
  }

  const last = points[points.length - 1];
  segments.push(`L ${last.x} ${last.y}`);
  return segments.join(" ");
}

function chartLinesExpression(chart: string): string {
  return chart
    .replace(/\r\n/g, "\n")
    .trim()
    .split("\n")
    .map((line) => `    ${JSON.stringify(line)},`)
    .join("\n");
}

export function annotatedMermaidMarkup({
  chart,
  label,
  annotationSet,
}: {
  chart: string;
  label: string;
  annotationSet: AnnotationSet;
}): string {
  const serializedAnnotations = JSON.stringify(annotationSet, null, 2);
  return `<AnnotatedMermaid
  chart={[
${chartLinesExpression(chart)}
  ].join("\\n")}
  label=${JSON.stringify(label.trim())}
  annotationSet={${serializedAnnotations}}
/>`;
}
