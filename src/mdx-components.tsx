import type { MDXComponents } from "mdx/types";
import { CodeBlock } from "@/components/content/CodeBlock";
import { CollapsibleCode } from "@/components/content/CollapsibleCode";
import { Callout } from "@/components/content/Callout";
import { Example } from "@/components/content/Example";
import { CodeTabs } from "@/components/content/CodeTabs";
import { TutorialHeader } from "@/components/content/TutorialHeader";
import { Figure } from "@/components/content/Figure";
import { LayoutDiagram } from "@/components/content/LayoutDiagram";
import { DevlogCTA } from "@/components/content/DevlogCTA";
import { TicTacToeGame } from "@/components/interactive/TicTacToeGame";
import { BreadcrumbPill } from "@/components/content/BreadcrumbPill";
import { DevlogCallout } from "@/components/content/DevlogCallout";
import { HeroQuote } from "@/components/content/HeroQuote";
import { EmphasizedText } from "@/components/content/EmphasizedText";
import { AnatomyOfABeat } from "@/components/content/AnatomyOfABeat";
import { FeatureCard, FeatureCardGroup } from "@/components/content/FeatureCard";
import { ContrastCallout } from "@/components/content/ContrastCallout";
import { AnnotatedCodeBlock } from "@/components/content/AnnotatedCodeBlock";
import { FooterTeaser } from "@/components/content/FooterTeaser";
import { HorizontalScroll } from "@/components/content/HorizontalScroll";
import { ScrollImage } from "@/components/content/ScrollImage";
import { StoryGraph } from "@/components/interactive/story-graph";
import { SceneBreak } from "@/components/content/SceneBreak";




function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({ children }) => {
      const id = slugify(String(children));
      return (
        <h2 id={id} className="text-2xl font-bold text-foreground-heading mt-10 mb-4 scroll-mt-6">
          {children}
        </h2>
      );
    },
    h3: ({ children }) => {
      const id = slugify(String(children));
      return (
        <h3 id={id} className="text-xl font-semibold text-foreground-heading mt-8 mb-3 scroll-mt-6">
          {children}
        </h3>
      );
    },
    hr: () => (
      <div className="flex items-center justify-center gap-3 my-10 select-none" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-mono tracking-widest text-foreground-muted/40">~#~</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    ),
    p: ({ children }) => (
      <p className="text-foreground-muted leading-relaxed mb-4">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-outside pl-5 text-foreground-muted mb-4 space-y-1">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-outside pl-5 text-foreground-muted mb-4 space-y-4">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="pl-1 [&>p]:mb-2 [&>p+p]:mt-2 last:[&>p:last-child]:mb-0">{children}</li>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    a: ({ href, children }) => (
      <a href={href} className="text-accent hover:underline">
        {children}
      </a>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-6">
        <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-surface-card text-foreground-heading">{children}</thead>
    ),
    th: ({ children }) => (
      <th className="px-4 py-2 text-center first:text-left font-semibold border-b border-border">{children}</th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-2 text-center first:text-left text-foreground-muted border-b border-border">{children}</td>
    ),
    pre: ({ children }) => {
      // Extract code content and metadata from the child
      const codeElement = children as React.ReactElement<{ className?: string; children?: string }>;
      const className = codeElement?.props?.className || "";
      const code = codeElement?.props?.children || "";

      // Parse language and filename from className (e.g., "language-java:TicTacToe.java")
      const match = className.match(/language-(\w+)(?::(.+))?/);
      const language = match?.[1];
      const filename = match?.[2];

      return <CodeBlock code={code.trim()} language={language} filename={filename} />;
    },
    code: ({ className, children }) => {
      // Inline code (no language class)
      if (!className) {
        return (
          <code className="px-1.5 py-0.5 rounded text-sm font-mono bg-surface-card text-accent">
            {children}
          </code>
        );
      }
      // Block code is handled by pre
      return <code className={className}>{children}</code>;
    },

    // Custom components
    InlineCode: ({ children }: { children: React.ReactNode }) => (
      <code className="px-1.5 py-0.5 rounded text-sm font-mono bg-surface-card text-accent">
        {children}
      </code>
    ),
    Callout,
    Example,
    CodeBlock,
    CodeTabs,
    CollapsibleCode,
    LayoutDiagram,
    TutorialHeader,
    Figure,
    DevlogCTA,
    TicTacToeGame,
    BreadcrumbPill,
    DevlogCallout,
    HeroQuote,
    EmphasizedText,
    AnatomyOfABeat,
    FeatureCard,
    FeatureCardGroup,
    ContrastCallout,
    AnnotatedCodeBlock,
    FooterTeaser,
    HorizontalScroll,
    ScrollImage,
    StoryGraph,
    SceneBreak,

    ...components,
  };
}