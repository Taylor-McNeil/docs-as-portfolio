import { ResponsePanel } from "@/components/layout/ResponsePanel";
import { PageHeader } from "@/components/content/PageHeader";
import { CodeBlock } from "@/components/content/CodeBlock";
import { Callout } from "@/components/content/Callout";
import Link from "next/link";

const faqResponse = {
  "status": 200,
  "faq": [
    { "q": "What have you been doing the past 18 months?", "a": "Building. Learning. Improving my skills." },
    { "q": "What are you working on right now?", "a": "aampersand, LLM Eval, this portfolio" },
    { "q": "Can you use AI? LLMs? CI/CD?", "a": " This website uses all three." },
    { "q": "Road warrior?", "a": "Deprecated in v4.0" },
    { "q": "What is this?", "a": "Docs-as-portfolio" },
    { "q": "Why hire you?", "a": "Acquired taste. Keep exploring the portfolio." },
    { "q": "Do you have a highlight reel?", "a": "6 continents, 11 hackathons, 75k+ devs. See /introduction"}
  ],
  
}

const configCode = `import { Candidate } from '@taylor-mcneil/core';

export default new Candidate({
  role: 'Developer Experience Engineer',
  version: '4.0.0', // Deprecates "Road Warrior" module
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
    tools: ['OpenAPI', 'GitHub Actions', 'MongoDB'],
    ai_workflow: ['Prompt Engineering', 'Multi-Model Evaluation']
  },

  preferences: {
    remote: true,
    async_communication: true,
  }
});`;

export const metadata = {
  title: "TL;DR · Developer Experience Engineer",
  description: "The TL;DR on Taylor McNeil — skills, stack, and career stats, formatted as a developer config file.",
  alternates: {
    canonical: '/quickstart',
  },
};


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

      {/* Configuration */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground-heading">Configuration</h2>
        <p className="text-foreground-muted">
          Create a <code className="px-1.5 py-0.5 bg-surface-card border border-border rounded text-sm font-mono">taylor.config.js</code> in your project root:
        </p>
        <CodeBlock code={configCode} language="javascript" filename="taylor.config.js" />
        <Callout type="note">
          Version 4.0.0 focuses on high-leverage developer enablement.
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