"use client";

import { useId, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, Folder } from "lucide-react";
import { NavItem } from "./NavItem";
import type { NavLink } from "@/components/content/navigation";

interface NavGroupProps {
  label: string;
  items: NavLink[];
  defaultOpen?: boolean;
  folder?: boolean;
}

export function NavGroup({ label, items, defaultOpen = false, folder = false }: NavGroupProps) {
  const pathname = usePathname();
  const containsActive = items.some((item) => item.href === pathname);
  const [isOpen, setIsOpen] = useState(defaultOpen || containsActive);
  const [prevContainsActive, setPrevContainsActive] = useState(containsActive);
  const listId = useId();

  // Reveal the active page when navigation lands inside a collapsed group.
  if (containsActive !== prevContainsActive) {
    setPrevContainsActive(containsActive);
    if (containsActive) setIsOpen(true);
  }

  return (
    <li>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center gap-1.5 rounded-md px-3 py-1.5 text-left text-[11px] font-semibold text-foreground-muted transition-colors hover:bg-surface-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
      >
        <ChevronRight
          aria-hidden="true"
          className={`h-3 w-3 shrink-0 transition-transform motion-reduce:transition-none ${
            isOpen ? "rotate-90" : ""
          }`}
        />
        {folder && <Folder aria-hidden="true" className="h-3 w-3 shrink-0" />}
        <span>{label}</span>
      </button>
      <ul
        id={listId}
        hidden={!isOpen}
        className="mt-1 ml-[18px] space-y-1 border-l border-border pl-2"
      >
        {items.map((item) => (
          <NavItem key={item.href} href={item.href} label={item.label} method={item.method} />
        ))}
      </ul>
    </li>
  );
}
