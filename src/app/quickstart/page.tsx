import { ResponsePanel } from "@/components/layout/ResponsePanel";
import { PageHeader } from "@/components/content/PageHeader";
import { CodeBlock } from "@/components/content/CodeBlock";
import { Callout } from "@/components/content/Callout";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MethodBadge } from "@/components/navigation/MethodBadge";
import type { Metadata } from "next";
import { withSocial } from "@/lib/metadata";
import type { JsonValue } from "@/components/content/JsonRenderer";

const faqResponse: JsonValue = {
  "status": 200,
  "faq": [
    { "q": "Just want to see if I can write docs?", "a": "Sure. Here you go.", "read": "/professional-work" },
    { "q": "What are you working on right now?", "a": "AI docs at MongoDB, aampersand, AI evaluation consulting, this portfolio" },
    { "q": "Can you use AI? LLMs? CI/CD?", "a": "This website uses all three." },
    { "q": "Road warrior?", "a": "Retired after v3.0.0. I travel for fun now." },
    { "q": "What is this?", "a": "Docs-as-portfolio" },
    { "q": "What is aampersand?", "a": "A writing app for novelists that I'm building in public. See /aampersand" },
    { "q": "Why hire you?", "a": "Acquired taste. Keep exploring the portfolio." },
    { "q": "Do you have a highlight reel?", "a": "6 continents, 12 hackathons, 75k+ devs, and real products built and shipped to customers. See /introduction"}
  ],
  
}

const configCode = `import { Candidate } from '@taylor-mcneil/core';

export default new Candidate({
  role: 'Developer Experience Engineer',
  version: '4.2.0', // "Road Warrior" module retired after 3.0.0
  location: 'Remote',
  
  capabilities: {
    technical_writing: true,
    full_stack_development: true,
    api_design: true,
    strategy: 'systems-first'
  },

  stack: {
    languages: ['TypeScript', 'Python', 'Java', 'SQL'],
    frameworks: ['Next.js', 'FastAPI', 'React', 'Django'],
    tools: [
      'MongoDB Atlas',
      'OpenAPI',
      'Postman',
      'Playwright',
      'GitHub Actions',
    ],
    ai_workflow: [
      'Claude Code',
      'Codex',
      'T3 Code ★',
      'Agent Orchestration',
      'Agent Swarms',
      'Agent Skills',
    ]
  },

  preferences: {
    remote: true,
    async_communication: true,
  }
});`;

export const metadata: Metadata = withSocial({
  title: "TL;DR · Developer Experience Engineer",
  description: "The TL;DR on Taylor McNeil: skills, stack, and career stats, formatted as a developer config file.",
  alternates: {
    canonical: 'https://taylormcneil.dev/quickstart',
  },
});


export default function Quickstart() {
  return (
    <div className="space-y-8">
      <ResponsePanel data={faqResponse} />

      <PageHeader
        method="GET"
        endpoint="/quickstart"
        title="Quickstart"
        description="Configure a DevEx Engineer for your team."
      />

      {/* Prerequisites */}
      <div className="space-y-2">
        <p className="text-sm text-foreground-muted">
          <strong className="text-foreground">Time to complete:</strong> 2 minutes
        </p>
        <p className="text-sm text-foreground-muted">
          <strong className="text-foreground">Prerequisites:</strong>
        </p>
        <ul className="list-disc list-inside text-sm text-foreground-muted space-y-1 ml-2">
          <li>A product with an API or complex developer workflow</li>
          <li>Remote-friendly environment</li>
          <li>Belief that documentation is a part of the product</li>
        </ul>
      </div>

      {/* Shortcut for readers who only want writing samples */}
      <Link
        href="/professional-work"
        className="group flex flex-col gap-2 rounded-lg border border-border bg-surface-card p-5 transition-colors hover:border-accent"
      >
        <span className="flex items-center gap-2 font-mono text-xs text-accent">
          <MethodBadge method="GET" active />
          /professional-work
        </span>
        <span className="text-base font-bold text-foreground-heading">Just want to see if I can write docs?</span>
        <span className="text-sm text-foreground-muted">
          Sure. Here you go: published documentation for MongoDB&apos;s AI integrations, plus tutorials, guides and
          case studies.
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
          Read the docs
          <ArrowRight size={14} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>

      {/* Configuration */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground-heading">Configuration</h2>
        <p className="text-foreground-muted">
          Create a <code className="px-1.5 py-0.5 bg-surface-card border border-border rounded text-sm font-mono">taylor.config.js</code> in your project root:
        </p>
        <CodeBlock code={configCode} language="javascript" filename="taylor.config.js" />
        <Callout type="note">
          Version 4.2.0 runs on AI documentation, agent-built software and aampersand.
          For the legacy &quot;Evangelist&quot; build (80% travel), see{" "}
          <Link href="/changelog#stellar" className="text-accent underline hover:opacity-80">
            v3.0.0 in the Changelog
          </Link>.
        </Callout>
      </section>

      {/* Run Tests */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground-heading">Run Tests</h2>
        <p className="text-foreground-muted">
          Validate the integration is working:
        </p>
        <CodeBlock code="npm test" language="bash" />
        <CodeBlock
          code={`PASS  integration/taylor.test.js

        DevEx Integration
          ✓ reduces onboarding friction (40% improvement)
          ✓ decreases support ticket volume (40% reduction)
          ✓ scales developer reach (75k+ developers)
          ✓ eliminates documentation drift
          ✓ respects async-first communication
          ✓ blocks Friday deployments, mostly 😋

      Test Suites: 1 passed, 1 total
      Tests:       6 passed, 6 total
      Time:        3-6 months`}
          language="plaintext"
          filename="integration/taylor.test.js"
        />
      </section>

    </div>
  );
}