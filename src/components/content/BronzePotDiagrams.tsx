import type { ReactNode } from "react";

/*
 * Diagrams for "A Tortoise in a Bronze Pot" (aampersand devlog #8).
 * They match LayoutDiagram, the boxes-and-arrows style earlier devlogs use:
 * a title bar over the terminal surface, square boxes, terminal-blue mono text.
 * Built from HTML rather than ASCII so they reflow to one column on phones.
 */

function Frame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <figure className="my-6 overflow-hidden rounded-lg border border-border">
      <figcaption className="border-b border-border bg-surface-card px-4 py-2 font-mono text-xs text-foreground-muted">
        {title}
      </figcaption>
      <div
        className="bg-surface-terminal p-4 text-foreground-terminal"
        style={{ fontFamily: "var(--font-jetbrains), monospace", fontVariantLigatures: "none" }}
      >
        {children}
      </div>
    </figure>
  );
}

function ColumnLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-foreground-terminal/60">
      {children}
    </p>
  );
}

type BoxTone = "plain" | "highlight" | "dashed";

const boxTones: Record<BoxTone, string> = {
  plain: "border-foreground-terminal/80",
  highlight: "border-2 border-foreground-terminal bg-foreground-terminal/10",
  dashed: "border-dashed border-foreground-terminal/50 text-foreground-terminal/75",
};

function Box({
  title,
  sub,
  tone = "plain",
  center = false,
  className = "",
}: {
  title: ReactNode;
  sub?: ReactNode;
  tone?: BoxTone;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={`border px-3 py-2 ${boxTones[tone]} ${center ? "text-center" : ""} ${className}`}>
      <p className={tone === "dashed" ? "whitespace-nowrap text-[11px]" : `text-[13px] ${tone === "highlight" ? "font-semibold" : ""}`}>{title}</p>
      {sub ? <p className="mt-0.5 text-xs leading-4 text-foreground-terminal/70">{sub}</p> : null}
    </div>
  );
}

function DownArrow() {
  return (
    <div className="flex justify-center py-1 text-[10px] leading-none text-foreground-terminal" aria-hidden="true">
      ▼
    </div>
  );
}

/** Points down on small screens and right from `md` up. */
function FlowArrow() {
  return (
    <div className="flex shrink-0 items-center justify-center py-1 text-[10px] text-foreground-terminal md:px-1.5 md:py-0" aria-hidden="true">
      <span className="md:hidden">▼</span>
      <span className="hidden md:inline">▶</span>
    </div>
  );
}

function VerticalFlow({ items }: { items: ReactNode[] }) {
  return (
    <ol className="list-none p-0">
      {items.map((item, index) => (
        <li key={index}>
          {index > 0 && <DownArrow />}
          {item}
        </li>
      ))}
    </ol>
  );
}

function HorizontalFlow({ items }: { items: ReactNode[] }) {
  return (
    <ol className="flex list-none flex-col p-0 md:flex-row md:items-stretch">
      {items.map((item, index) => (
        <li key={index} className="flex flex-col md:flex-1 md:flex-row">
          {index > 0 && <FlowArrow />}
          <div className="flex-1 [&>div]:flex [&>div]:h-full [&>div]:flex-col [&>div]:justify-center">{item}</div>
        </li>
      ))}
    </ol>
  );
}

export function SceneDesignerDiagram() {
  return (
    <Frame title="The Scene Designer built each scene from blocks">
      <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
        <div className="border border-foreground-terminal/60 p-3">
          <p className="text-[13px] font-semibold">Scene Designer</p>
          <p className="mb-3 text-xs text-foreground-terminal/70">one card per scene, built for how I plan</p>
          <div className="space-y-2">
            {["Setting", "Characters", "The scene’s goal", "Sparks and beats to hit"].map((block) => (
              <Box key={block} title={block} />
            ))}
          </div>
        </div>
        <p className="text-center font-mono text-[11px] text-foreground-terminal/80">
          <span className="md:hidden">▼ later split ▼</span>
          <span className="hidden md:inline">later split ▶</span>
        </p>
        <div className="space-y-3">
          <Box title="Outline" sub="its own screen in the Lab" />
          <Box title="Storyboard" sub="its own screen in the Lab" />
        </div>
      </div>
    </Frame>
  );
}

export function CardSaveDiagram() {
  return (
    <Frame title="Moving one card took five careful steps. It needed two.">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <ColumnLabel>What the save did</ColumnLabel>
          <VerticalFlow
            items={[
              "Name the card and its exact version",
              "Lock the whole book until it saves",
              "Write the move, a receipt and an undo",
              "Run checks far beyond the one card",
              "Make every later change wait in line",
            ].map((step) => (
              <Box key={step} title={step} />
            ))}
          />
          <p className="mt-2 text-xs italic text-foreground-terminal/80">
            One refused change, and everything behind it stalled.
          </p>
        </div>
        <div>
          <ColumnLabel>What it needed to do</ColumnLabel>
          <VerticalFlow
            items={["Write the card’s new position", "If two moves collide, keep the later"].map((step) => (
              <Box key={step} title={step} tone="highlight" />
            ))}
          />
        </div>
      </div>
    </Frame>
  );
}

export function JevDiagram() {
  return (
    <Frame title="Jev was meant to judge the result. It ended up steering every click.">
      <ColumnLabel>What I wanted</ColumnLabel>
      <HorizontalFlow
        items={[
          <Box key="in" title="Finished screen + design" center />,
          <Box key="jev" title="Jev" tone="highlight" center />,
          <Box key="out" title="Pass or fail" center />,
        ]}
      />
      <div className="mt-6">
        <ColumnLabel>What actually happened</ColumnLabel>
        <HorizontalFlow
          items={[
            <Box key="ask" title="Agent asks Jev" center />,
            <Box key="pick" title="Jev picks one" tone="highlight" center />,
            <Box key="read" title="Agent interprets it" center />,
            <Box key="click" title="Agent clicks" center />,
          ]}
        />
        <div className="mx-[12%] mt-1 hidden h-4 border-x border-b border-dashed border-foreground-terminal/60 md:block" aria-hidden="true" />
        <p className="mt-1 text-center text-xs text-foreground-terminal/80">
          <span aria-hidden="true">↺ </span>again, for every single step
        </p>
      </div>
    </Frame>
  );
}

function MockRow({ real, mock }: { real: "A" | "B"; mock: "A" | "B" }) {
  const realBox = <Box title={`Feature ${real}`} center className="flex-1" />;
  const mockBox = <Box title={`stand-in for ${mock}`} tone="dashed" center className="flex-1" />;
  return (
    <div className="flex items-center gap-1">
      {real === "A" ? realBox : mockBox}
      <span className="h-px w-2 shrink-0 bg-foreground-terminal/60" aria-hidden="true" />
      {real === "A" ? mockBox : realBox}
      <span className="shrink-0 pl-1 text-xs text-accent-success">passes</span>
    </div>
  );
}

export function MockedJoinDiagram() {
  return (
    <Frame title="Each piece passed. The join between them was never tested.">
      <div className="grid gap-6 md:grid-cols-2 md:divide-x md:divide-foreground-terminal/20">
        <div className="space-y-3 md:pr-6">
          <ColumnLabel>How the tests saw it</ColumnLabel>
          <MockRow real="A" mock="B" />
          <MockRow real="B" mock="A" />
        </div>
        <div className="md:pl-6">
          <ColumnLabel>How a writer sees it</ColumnLabel>
          <div className="mt-6 flex items-center gap-1">
            <Box title="Feature A" center className="flex-1" />
            <span className="flex shrink-0 items-center text-red-500 dark:text-red-400" aria-label="broken join">
              <span className="w-3 border-t border-dashed border-current" aria-hidden="true" />
              <span className="px-0.5 text-base font-bold leading-none" aria-hidden="true">✕</span>
              <span className="w-3 border-t border-dashed border-current" aria-hidden="true" />
            </span>
            <Box title="Feature B" center className="flex-1" />
          </div>
          <p className="mt-2 text-center text-xs text-foreground-terminal/80">the bug lives in the join</p>
        </div>
      </div>
    </Frame>
  );
}

const beforeCode = [
  ["1. Idea", "mine, or grabbed from somewhere"],
  ["2. Plan with agents", "what we’re building, and how"],
  ["3. Adversarial run", "what’s wrong? what are we missing?"],
  ["4. Design", "iterate the UI and empty states"],
  ["5. Replan", "fit the plan to the real design"],
];

const loopSteps = [
  ["7. Helpers build", "until the failing test passes"],
  ["8. Code review", "a different agent reads the code"],
  ["9. Verification", "another checks what really changed"],
  ["10. UI check", "the build held up to the design"],
];

export function BuildLoopDiagram() {
  return (
    <Frame title="Every stage is checked by someone who didn’t build it">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <ColumnLabel>Before any code</ColumnLabel>
          <VerticalFlow items={beforeCode.map(([title, sub]) => <Box key={title} title={title} sub={sub} />)} />
          <p className="mt-2 text-right font-mono text-[11px] text-foreground-terminal/80">then on to step 6 ▶</p>
        </div>
        <div>
          <ColumnLabel>Building it</ColumnLabel>
          <div className="pr-20">
          <Box title="6. Orchestrator" sub="splits tasks, writes failing tests" />
          <DownArrow />
          <div className="relative">
            <VerticalFlow items={loopSteps.map(([title, sub]) => <Box key={title} title={title} sub={sub} />)} />
            <div
              className="absolute -right-6 bottom-6 top-6 w-3 border-y border-r border-dashed border-foreground-terminal/60"
              aria-hidden="true"
            />
            <p className="absolute -right-20 top-1/2 w-12 -translate-y-1/2 text-[11px] leading-4 text-foreground-terminal/80">
              <span aria-hidden="true">◀ </span>
              issues loop back
            </p>
          </div>
          <DownArrow />
          <Box title="11. Final review" sub="me, looking at it and playing with it" tone="highlight" />
          </div>
        </div>
      </div>
    </Frame>
  );
}
