"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ChangelogVersion, VersionColor } from "@/components/changelog/changelog";
import { ChangelogBadge } from "./ChangelogBadge";

interface TimelineItemProps {
  version: ChangelogVersion;
  defaultExpanded?: boolean;
  isLast?: boolean;
}

const lineColors: Record<VersionColor, string> = {
  green: "bg-accent-success",
  blue: "bg-method-get",
  purple: "bg-method-patch",
  orange: "bg-accent",
  yellow: "bg-method-put",
  pink: "bg-timeline-pink",
  gray: "bg-border",
};

const dotColors: Record<VersionColor, string> = {
  green: "bg-accent-success border-accent-success",
  blue: "bg-method-get border-method-get",
  purple: "bg-method-patch border-method-patch",
  orange: "bg-accent border-accent",
  yellow: "bg-method-put border-method-put",
  gray: "bg-surface-bg border-foreground-muted",
  pink: "bg-timeline-pink border-timeline-pink",
};

export function TimelineItem({ version, defaultExpanded = false, isLast = false }: TimelineItemProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="relative pl-8 pb-8 last:pb-0">
      {/* Timeline line */}
      {!isLast && (
        <div
          className={`absolute left-[7px] top-4 bottom-0 w-0.5 ${lineColors[version.color]}`}
        />
      )}

      {/* Timeline dot */}
      <div
        className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 ${dotColors[version.color]}`}
      />

      {/* Header - clickable */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left group"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-foreground-muted">
                {version.version}
              </span>
              <span className="text-foreground-muted">—</span>
              <span className="font-semibold text-foreground-heading">
                {version.title}
              </span>
            </div>
            <p className="text-xs text-foreground-muted mt-0.5">
              {version.dateRange}
            </p>
          </div>
          <div className="text-foreground-muted group-hover:text-foreground transition-colors mt-1">
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
        </div>

        <p className="text-sm text-foreground-muted mt-2">{version.summary}</p>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-4 space-y-4">
          {/* Entries */}
          <div className="space-y-2 p-4 bg-surface-card border border-border-card rounded-lg">
            {version.entries.map((entry, index) => (
              <div key={index} className="flex items-start gap-3">
                <ChangelogBadge type={entry.type} />
                <span className="text-sm text-foreground-muted flex-1">{entry.text}</span>
              </div>
            ))}
          </div>

          {/* Stack */}
          {version.stack && (
            <div className="flex flex-wrap gap-2">
              {version.stack.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 text-xs font-mono bg-surface-terminal border border-border rounded text-foreground-muted"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}