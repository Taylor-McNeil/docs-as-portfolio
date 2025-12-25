"use client";

import { useState } from "react";
import { CodeBlock } from "./CodeBlock";

interface Tab {
  label: string;
  language: string;
  filename?: string;
  code: string;
}

interface CodeTabsProps {
  tabs: Tab[];
}

export function CodeTabs({ tabs }: CodeTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!tabs || tabs.length === 0) {
    return null;
  }

  const activeTab = tabs[activeIndex];

  return (
    <div className="my-6">
      {/* Tab buttons */}
      <div className="flex border-b border-border">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            onClick={() => setActiveIndex(index)}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeIndex === index
                ? "text-accent"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeIndex === index && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      <div className="[&>div]:my-0 [&>div]:rounded-t-none [&>div]:border-t-0">
        <CodeBlock
          code={activeTab.code}
          language={activeTab.language}
          filename={activeTab.filename}
        />
      </div>
    </div>
  );
}
