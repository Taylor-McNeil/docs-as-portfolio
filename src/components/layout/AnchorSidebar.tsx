"use client";

import { useEffect, useState } from "react";
import { useRightPanel } from "./RightPanelContext";

interface TocItem {
  id: string;
  label: string;
  level: number;
}

interface AnchorSidebarProps {
  items: TocItem[];
}

export function AnchorSidebar({ items }: AnchorSidebarProps) {
  const { setContent, setWidth } = useRightPanel();
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0% -80% 0%" }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    // Set narrow width for TOC
    setWidth("narrow");

    setContent(
      <div className="p-4 pt-6">
        <p className="text-[9px] font-semibold text-foreground-muted uppercase tracking-wider mb-4">
          On this page
        </p>

        <nav className="border-l border-border space-y-1">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`block text-[11px] leading-relaxed py-1.5 pl-3 -ml-px border-l transition-colors ${
                item.level === 3 ? "pl-5" : ""
              } ${
                activeId === item.id
                  ? "border-accent text-foreground font-medium"
                  : "border-transparent text-foreground-muted hover:text-foreground hover:border-foreground-muted"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    );

    return () => {
      setContent(null);
      setWidth("normal"); // Reset to normal when leaving
    };
  }, [items, activeId, setContent, setWidth]);

  return null;
}