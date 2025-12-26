"use client";

import { ReactNode, useState } from "react";
import { Menu, X, PanelRightOpen } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { RightPanelProvider, useRightPanel } from "./RightPanelContext";

interface ShellProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function ShellInner({ sidebar, children }: ShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { content: rightPanelContent, width: panelWidth, isCollapsed, toggleCollapsed } = useRightPanel();

  return (
    <div className="h-screen bg-surface-bg overflow-hidden grid grid-rows-[auto_1fr] md:grid-rows-[1fr]">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-surface-sidebar">
        <div>
          <h1 className="text-foreground-heading font-bold text-sm">Taylor McNeil</h1>
          <p className="text-foreground-muted font-mono text-[10px]">docs-as-portfolio v1.0</p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-foreground-muted"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Three-Panel Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] lg:grid-cols-[256px_1fr] overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`
            absolute inset-0 z-20 w-64 bg-surface-sidebar border-r border-border
            transform transition-transform duration-300 flex flex-col overflow-hidden
            md:relative md:translate-x-0
            ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {sidebar}
        </aside>

        {/* Main Content */}
        <main className={`overflow-y-auto transition-[padding] duration-300 ${
          rightPanelContent && !isCollapsed
            ? panelWidth === "narrow" ? "lg:pr-56" : "lg:pr-96"
            : ""
        }`}>
          <div className="max-w-3xl mx-auto p-6 md:p-12">
            {children}
          </div>
        </main>
      </div>

      {/* Right Panel - Fixed position with slide animation */}
      {rightPanelContent && (
        <aside
          className={`
            hidden lg:block fixed top-0 right-0 h-full bg-surface-terminal border-l border-border overflow-y-auto
            transform transition-transform duration-300 ease-in-out
            ${panelWidth === "narrow" ? "w-56" : "w-96"}
            ${isCollapsed ? "translate-x-full" : "translate-x-0"}
          `}
        >
          {rightPanelContent}
        </aside>
      )}

      {/* Expand Panel Button (when collapsed) */}
      {rightPanelContent && isCollapsed && (
        <button
          onClick={toggleCollapsed}
          className="hidden lg:flex fixed right-4 top-4 z-30 p-2 rounded text-foreground-muted hover:text-foreground hover:bg-surface-card transition-colors"
          title="Expand panel"
        >
          <PanelRightOpen size={16} />
        </button>
      )}
    </div>
  );
}

export function Shell({ sidebar, children }: ShellProps) {
  return (
    <RightPanelProvider>
      <ShellInner sidebar={sidebar}>{children}</ShellInner>
    </RightPanelProvider>
  );
}