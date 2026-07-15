"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { Callout } from "@/components/content/Callout";
import { CodeBlock } from "@/components/content/CodeBlock";
import { CodeTabs } from "@/components/content/CodeTabs";
import { Mermaid } from "@/components/content/Mermaid";
import { MySpaceCustomizer } from "@/components/interactive/MySpaceCustomizer";
import { StoryGraph } from "@/components/interactive/story-graph";
import { TicTacToeGame } from "@/components/interactive/TicTacToeGame";

type DetailTab = "what" | "where" | "source";

export type ComponentRegistrySources = Record<
  string,
  { code: string; filename: string }
>;

interface RegistryEntry {
  id: string;
  label: string;
  description: string;
  usage: { label: string; href: string };
  renderPreview: () => ReactNode;
}

const COMPONENTS: RegistryEntry[] = [
  {
    id: "callout",
    label: "Callout",
    description:
      "A reusable context block with visual variants for notes, warnings, tips, tests, and celebrations.",
    usage: {
      label: "HMAC authentication guide",
      href: "/guides/hmac-authentication",
    },
    renderPreview: () => (
      <Callout type="tip" title="The component is the documentation">
        Use the shape that makes the idea easiest to understand.
      </Callout>
    ),
  },
  {
    id: "code-tabs",
    label: "CodeTabs",
    description:
      "A language switcher that groups equivalent code samples without making readers scroll past every version.",
    usage: {
      label: "HMAC authentication guide",
      href: "/guides/hmac-authentication",
    },
    renderPreview: () => (
      <CodeTabs
        tabs={[
          {
            label: "JavaScript",
            language: "javascript",
            filename: "hello.js",
            code: 'console.log("Hello from MDX");',
          },
          {
            label: "Python",
            language: "python",
            filename: "hello.py",
            code: 'print("Hello from MDX")',
          },
        ]}
      />
    ),
  },
  {
    id: "myspace-customizer",
    label: "MySpaceCustomizer",
    description:
      "An interactive CSS-variable playground that lets a reader restyle the experience instead of only reading about customization.",
    usage: {
      label: "A Broken Astrolabe",
      href: "/aampersand/a-broken-astrolabe",
    },
    renderPreview: () => <MySpaceCustomizer scope="container" />,
  },
  {
    id: "story-graph",
    label: "StoryGraph",
    description:
      "An interactive model that transforms a linear reading order into the connected graph underneath it.",
    usage: {
      label: "Oily Bodies in Karpathos",
      href: "/aampersand/oily-bodies-in-karpathos",
    },
    renderPreview: () => <StoryGraph />,
  },
  {
    id: "mermaid",
    label: "Mermaid",
    description:
      "A theme-aware renderer that turns a text diagram definition into an inline visual explanation.",
    usage: {
      label: "A Seed of Intention",
      href: "/aampersand/a-seed-of-intention",
    },
    renderPreview: () => (
      <Mermaid
        chart={`flowchart LR
          MDX[MDX page] --> React[React component]
          React --> Reader[Interactive explanation]`}
      />
    ),
  },
  {
    id: "tic-tac-toe",
    label: "TicTacToe",
    description:
      "A playable terminal-style game embedded at the end of a Java tutorial so readers can try the finished result.",
    usage: {
      label: "Build Tic Tac Toe in Java",
      href: "/tutorials/java-game-dev",
    },
    renderPreview: () => <TicTacToeGame />,
  },
];

const DETAIL_TABS: { id: DetailTab; label: string }[] = [
  { id: "what", label: "What it does" },
  { id: "where", label: "Where it is used" },
  { id: "source", label: "Source" },
];

export function ComponentRegistry({
  sources,
}: {
  sources?: ComponentRegistrySources;
}) {
  const instanceId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeDetail, setActiveDetail] = useState<DetailTab>("what");
  const activeComponent = COMPONENTS[activeIndex];
  const activeSource = sources?.[activeComponent.id];
  const availableDetailTabs = activeSource
    ? DETAIL_TABS
    : DETAIL_TABS.filter((tab) => tab.id !== "source");

  const selectComponent = (index: number) => {
    setActiveIndex(index);
    setActiveDetail("what");
  };

  const handleComponentKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % COMPONENTS.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + COMPONENTS.length) % COMPONENTS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = COMPONENTS.length - 1;
    }

    if (nextIndex === null) return;
    event.preventDefault();
    selectComponent(nextIndex);
    event.currentTarget.parentElement
      ?.querySelector<HTMLButtonElement>(`[data-component-index="${nextIndex}"]`)
      ?.focus();
  };

  const componentButtons = (location: "mobile" | "desktop") =>
    COMPONENTS.map((component, index) => {
      const isActive = index === activeIndex;
      return (
        <button
          key={component.id}
          type="button"
          data-component-index={index}
          aria-pressed={isActive}
          aria-controls={`${instanceId}-preview`}
          onClick={() => selectComponent(index)}
          onKeyDown={(event) => handleComponentKeyDown(event, index)}
          className={`shrink-0 border-accent px-3 py-2 text-left text-xs font-medium transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset ${
            location === "desktop" ? "w-full border-l-2" : "border-b-2"
          } ${
            isActive
              ? "bg-accent/10 text-accent"
              : "border-transparent text-foreground-muted hover:bg-surface-card hover:text-foreground"
          }`}
        >
          {component.label}
        </button>
      );
    });

  const handleDetailKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % availableDetailTabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex =
        (index - 1 + availableDetailTabs.length) % availableDetailTabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = availableDetailTabs.length - 1;
    }

    if (nextIndex === null) return;
    event.preventDefault();
    setActiveDetail(availableDetailTabs[nextIndex].id);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [nextIndex]?.focus();
  };

  return (
    <section
      aria-label="Live component registry"
      className="my-8 overflow-hidden rounded-xl border border-border bg-surface-bg"
    >
      <div className="border-b border-border bg-surface-card/60 px-4 py-3">
        <p className="m-0 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground-muted">
          Component registry
        </p>
      </div>

      <nav
        aria-label="Choose a component"
        className="flex overflow-x-auto border-b border-border md:hidden"
      >
        {componentButtons("mobile")}
      </nav>

      <div className="md:grid md:grid-cols-[10.5rem_minmax(0,1fr)]">
        <nav
          aria-label="Choose a component"
          className="hidden flex-col border-r border-border bg-surface-card/30 py-2 md:flex"
        >
          {componentButtons("desktop")}
        </nav>

        <div
          id={`${instanceId}-preview`}
          aria-live="polite"
          aria-label={`${activeComponent.label} preview`}
          className="min-h-80 max-h-[34rem] overflow-auto p-4 [scrollbar-gutter:stable] sm:p-5 [&_.mermaid-diagram]:my-0 [&>div>div]:first:mt-0 [&>div>div]:last:mb-0"
        >
          <div key={activeComponent.id}>{activeComponent.renderPreview()}</div>
        </div>
      </div>

      <div className="border-t border-border bg-surface-card/30">
        <div
          role="tablist"
          aria-label={`${activeComponent.label} details`}
          className="flex overflow-x-auto border-b border-border px-2"
        >
          {availableDetailTabs.map((tab, index) => {
            const isActive = activeDetail === tab.id;
            return (
              <button
                key={tab.id}
                id={`${instanceId}-${tab.id}-tab`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`${instanceId}-detail-panel`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveDetail(tab.id)}
                onKeyDown={(event) => handleDetailKeyDown(event, index)}
                className={`relative shrink-0 px-3 py-3 text-xs font-medium transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset ${
                  isActive
                    ? "text-accent after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-accent"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          id={`${instanceId}-detail-panel`}
          role="tabpanel"
          aria-labelledby={`${instanceId}-${activeDetail}-tab`}
          className={`px-4 py-4 text-sm leading-relaxed text-foreground-muted ${
            activeDetail === "source" ? "" : "min-h-24"
          }`}
        >
          {activeDetail === "what" && <p className="m-0">{activeComponent.description}</p>}
          {activeDetail === "where" && (
            <p className="m-0">
              See it in{" "}
              <a className="font-medium text-accent hover:underline" href={activeComponent.usage.href}>
                {activeComponent.usage.label}
              </a>
              .
            </p>
          )}
          {activeDetail === "source" && activeSource && (
            <div className="max-h-96 overflow-auto rounded-lg [&>div]:my-0">
              <CodeBlock
                code={activeSource.code}
                language="typescript"
                filename={activeSource.filename}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
