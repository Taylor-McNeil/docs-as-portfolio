"use client";

import { Children, ReactNode, useRef, useState, useEffect } from "react";

interface HorizontalScrollProps {
  children: ReactNode;
  gap?: string;
  itemWidth?: string;
}

export function HorizontalScroll({
  children,
  gap = "1rem",
  itemWidth = "300px",
}: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const childCount = Children.count(children);

  const scrollTo = (index: number) => {
    if (!scrollRef.current) return;
    const items = scrollRef.current.children;
    if (items[index]) {
      const item = items[index] as HTMLElement;
      scrollRef.current.scrollTo({
        left: item.offsetLeft - 16,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollLeft = container.scrollLeft;
    const items = Array.from(container.children) as HTMLElement[];

    let closest = 0;
    let closestDistance = Infinity;

    items.forEach((item, i) => {
      const distance = Math.abs(item.offsetLeft - 16 - scrollLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = i;
      }
    });

    setActiveIndex(closest);
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    handleScroll();
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const canScrollLeft = activeIndex > 0;
  const canScrollRight = activeIndex < childCount - 1;

  return (
    <div className="-mx-4 px-4 my-8">
      <div className="relative">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scrollTo(activeIndex - 1)}
            className="hidden md:flex absolute -left-14 top-1/2 -translate-y-1/2 z-10
              w-8 h-8 items-center justify-center
              bg-surface-card border border-border text-foreground
              rounded cursor-pointer text-xl hover:bg-surface-sidebar transition-colors"
            aria-label="Previous"
          >
            &#8249;
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scrollTo(activeIndex + 1)}
            className="hidden md:flex absolute -right-14 top-1/2 -translate-y-1/2 z-10
              w-8 h-8 items-center justify-center
              bg-surface-card border border-border text-foreground
              rounded cursor-pointer text-xl hover:bg-surface-sidebar transition-colors"
            aria-label="Next"
          >
            &#8250;
          </button>
        )}

        <div
          ref={scrollRef}
          style={{ gap }}
          className="flex overflow-x-auto snap-x snap-mandatory pb-4
            scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
          {Children.map(children, (child, i) => (
            <div
              key={i}
              style={{ flex: `0 0 ${itemWidth}` }}
              className="snap-start"
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      {childCount > 2 && (
        <div className="flex justify-center gap-2 mt-2">
          {Array.from({ length: childCount - 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`w-2 h-2 rounded-full border-none p-0 cursor-pointer transition-colors ${
                i === activeIndex
                  ? "bg-foreground"
                  : "bg-border"
              }`}
              aria-label={`Go to item ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/*
 * USAGE EXAMPLE:
 *
 * <HorizontalScroll itemWidth="320px" gap="1rem">
 *   <ScrollImage src="/images/shot1.png" alt="Screenshot 1" caption="Homepage" />
 *   <ScrollImage src="/images/shot2.png" alt="Screenshot 2" caption="Dashboard" />
 *   <ScrollImage src="/images/shot3.png" alt="Screenshot 3" caption="Settings" />
 * </HorizontalScroll>
 *
 * Props:
 * - children: ReactNode (required) - Items to scroll through
 * - gap?: string - Gap between items (default: "1rem")
 * - itemWidth?: string - Width of each item (default: "300px")
 *
 * ASCII REPRESENTATION:
 *
 *         ┌────────────────────────────────────────┐
 *    ‹    │  [Item 1]  [Item 2]  [Item 3] ...     │    ›
 *         └────────────────────────────────────────┘
 *                      ● ○ ○ ○
 *
 * - Horizontal snap scroll with arrow navigation (desktop)
 * - Touch/swipe on mobile, dot indicators for position
 */
