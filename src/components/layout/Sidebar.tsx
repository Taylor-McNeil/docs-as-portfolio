import { ThemeToggle } from "./ThemeToggle";
import { NavSection } from "../navigation/NavSection";
import { NavItem } from "../navigation/NavItem";
import { navigation } from "@/components/content/navigation";

export function Sidebar() {
  return (
    <>
      {/* Header */}
      <div className="p-5 border-b border-border hidden md:flex items-center justify-between">
        <div>
          <h1 className="text-foreground-heading font-bold text-sm">Taylor McNeil</h1>
          <p className="text-foreground-muted font-mono text-[10px] mt-0.5">docs-as-portfolio v1.0</p>
        </div>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-8">
        {navigation.map((section) => (
          <NavSection key={section.title} title={section.title}>
            {section.items.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                method={item.method}
              />
            ))}
          </NavSection>
        ))}
      </nav>

      {/* CTA */}
      <div className="p-4 border-t border-border">
        <button className="w-full bg-accent text-white text-xs font-medium py-2.5 rounded hover:opacity-90 transition-opacity">
          Contact API →
        </button>
      </div>
    </>
  );
}