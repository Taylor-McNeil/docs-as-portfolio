import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { NavSection } from "../navigation/NavSection";
import { NavItem } from "../navigation/NavItem";
import { NavGroup } from "../navigation/NavGroup";
import { navigation, type NavEntry } from "@/components/content/navigation";

export function Sidebar({ themeControl }: { themeControl?: ReactNode } = {}) {
  return (
    <>
      {/* Header */}
      <div className="p-5 border-b border-border hidden md:flex items-center justify-between">
        <div>
          <Link href="/"><h1 className="text-foreground-heading font-bold text-sm">Taylor McNeil</h1></Link>
          <p className="text-foreground-muted font-mono text-[10px] mt-0.5">docs-as-portfolio v1.10</p>
        </div>
        {themeControl ?? <ThemeToggle />}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-8">
        {navigation.map((section) => (
          <NavSection
            key={section.title}
            title={section.title}
            subtitle={section.subtitle}
          >
            <NavEntries entries={section.items} />
          </NavSection>
        ))}
      </nav>

      {/* CTA */}
      <div className="p-4 border-t border-border">
        <a
          href="https://linkedin.com/in/taylormcneil"
          className="block w-full bg-accent text-white text-xs font-medium py-2.5 rounded hover:opacity-90 transition-opacity text-center"
        >
          Contact
        </a>
      </div>
    </>
  );
}

function NavEntries({ entries }: { entries: NavEntry[] }) {
  return entries.map((item) =>
    item.type === "group" ? (
      <NavGroup
        key={`group:${item.label}`}
        label={item.label}
        items={item.children}
        defaultOpen={item.defaultOpen}
        folder={item.folder}
      />
    ) : (
      <NavItem key={item.href} href={item.href} label={item.label} method={item.method}>
        {item.children ? <NavEntries entries={item.children} /> : null}
      </NavItem>
    ),
  );
}
