"use client";

import { AnnotationSurface } from "./AnnotationSurface";
import {
  annotationSourceHash,
  type AnnotationSet,
} from "./annotation-model";
import { Mermaid } from "./Mermaid";

export interface AnnotatedMermaidProps {
  chart: string;
  label: string;
  annotationSet: AnnotationSet;
  className?: string;
}

export function AnnotatedMermaid({
  chart,
  label,
  annotationSet,
  className = "",
}: AnnotatedMermaidProps) {
  const currentSourceHash = annotationSourceHash(chart);
  const sourceChanged = annotationSet.sourceHash !== currentSourceHash;

  return (
    <div
      className={className}
      data-annotated-mermaid
      data-annotation-source-hash={annotationSet.sourceHash}
      data-current-source-hash={currentSourceHash}
    >
      {sourceChanged && process.env.NODE_ENV !== "production" && (
        <p className="mb-2 rounded-md border border-method-put/40 bg-method-put/5 px-3 py-2 text-xs text-method-put" role="status">
          This Mermaid source changed after it was annotated. Review the mark placement before publishing.
        </p>
      )}
      <AnnotationSurface
        label={label}
        marks={annotationSet.marks}
        artboard={annotationSet.artboard}
        showBackground={annotationSet.showBackground !== false}
      >
        <Mermaid chart={chart} className="!my-0" />
      </AnnotationSurface>
    </div>
  );
}
