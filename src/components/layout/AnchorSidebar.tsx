"use client";

import { useEffect, useState } from "react";
import { useRightPanel } from "./RightPanelContext";
import { PanelRightClose } from "lucide-react";

interface TocItem {
  id: string;
  label: string;
  level: number;
}

interface AnchorSidebarProps {
  items: TocItem[];
}

export function AnchorSidebar({ items }: AnchorSidebarProps) {
  const { setContent, setWidth, toggleCollapsed } = useRightPanel();
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => heading instanceof HTMLElement);

    if (!headings.length) return;

    const getScrollParent = (element: HTMLElement): HTMLElement | Window => {
      let parent = element.parentElement;

      while (parent) {
        const { overflowY } = window.getComputedStyle(parent);
        const isScrollable = overflowY === "auto" || overflowY === "scroll";

        if (isScrollable && parent.scrollHeight > parent.clientHeight) {
          return parent;
        }

        parent = parent.parentElement;
      }

      return window;
    };

    const scrollRoot = getScrollParent(headings[0]);
    let frameId = 0;

    const updateActiveHeading = () => {
      const threshold = 140;
      const activeHeading =
        headings.findLast((heading) => heading.getBoundingClientRect().top <= threshold) ??
        headings[0];

      setActiveId((current) => (current === activeHeading.id ? current : activeHeading.id));
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateActiveHeading);
    };

    const syncWithHash = () => {
      const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));

      if (hash && headings.some((heading) => heading.id === hash)) {
        setActiveId(hash);
      }

      scheduleUpdate();
    };

    const observer = new IntersectionObserver(scheduleUpdate, {
      root: scrollRoot instanceof HTMLElement ? scrollRoot : null,
      rootMargin: "-96px 0px -55% 0px",
      threshold: [0, 1],
    });

    headings.forEach((heading) => observer.observe(heading));

    if (scrollRoot instanceof HTMLElement) {
      scrollRoot.addEventListener("scroll", scheduleUpdate, { passive: true });
    } else {
      window.addEventListener("scroll", scheduleUpdate, { passive: true });
    }

    window.addEventListener("hashchange", syncWithHash);
    window.addEventListener("resize", scheduleUpdate);
    syncWithHash();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);

      if (scrollRoot instanceof HTMLElement) {
        scrollRoot.removeEventListener("scroll", scheduleUpdate);
      } else {
        window.removeEventListener("scroll", scheduleUpdate);
      }

      window.removeEventListener("hashchange", syncWithHash);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [items]);

  useEffect(() => {
    // Set narrow width for TOC
    setWidth("narrow");

    setContent(
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[9px] font-semibold text-foreground-muted uppercase tracking-wider">
            On this page
          </p>
          <button
            onClick={toggleCollapsed}
            className="p-1 rounded text-foreground-muted hover:text-foreground hover:bg-surface-card transition-colors"
            title="Collapse panel"
          >
            <PanelRightClose size={14} />
          </button>
        </div>

        <nav className="border-l border-border space-y-1">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setActiveId(item.id)}
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
  }, [items, activeId, setContent, setWidth, toggleCollapsed]);

  return null;
}
