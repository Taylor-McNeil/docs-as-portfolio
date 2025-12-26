import { ResponsePanel } from "@/components/layout/ResponsePanel";
import { PageHeader } from "@/components/content/PageHeader";
import { Callout } from "@/components/content/Callout";
import { CodeBlock } from "@/components/content/CodeBlock";
import { CollapsibleCode } from "@/components/content/CollapsibleCode";
import {
  accountsEndpointSnippet,
  parametersSnippet,
  fileStructure,
} from "@/components/snippets/stellar-snippets";

const responseData = {
  project: "Stellar API Documentation",
  client: "Stellar Development Foundation",
  spec_version: "OpenAPI 3.0",
  components_created: {
    parameters: "50+",
    schemas: "30+",
    endpoints: "40+",
    examples: "30+",
  },
  apis_documented: ["Horizon API", "Anchor Platform"],
  output: "Auto-generated Docusaurus site",
  status: "Live in production",
};

export default function StellarCaseStudy() {
  return (
    <div className="space-y-8">
      <ResponsePanel data={responseData} />

      <PageHeader
        method="GET"
        endpoint="/case-studies/stellar-api-docs"
        title="Stellar API Documentation"
      />

      <Callout type="context">
        This work was completed during my time at the Stellar Development Foundation in 2022-2023.
      </Callout>

      {/* Intro */}
      <p className="text-base text-foreground-muted">
        Stellar&apos;s API documentation kept falling out of sync with their
        code. I was brought in to read the codebase, work with the engineering
        team, and create the OpenAPI spec files that now feed directly into
        their doc generator—so when the spec changes, the website updates
        automatically.
      </p>

      <hr className="border-border" />

      {/* Context */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground-heading">Context</h2>

        <p className="text-base text-foreground-muted">
          <strong className="text-foreground">Stellar</strong> is a
          decentralized payment network for fast, low-cost cross-border
          transactions.
        </p>

        <p className="text-base text-foreground-muted">
          <strong className="text-foreground">Horizon</strong> is Stellar&apos;s
          REST API for interacting with the network—querying accounts,
          submitting transactions, streaming ledger data.
        </p>

        <p className="text-base text-foreground-muted">
          <strong className="text-foreground">The Anchor Platform</strong>{" "}
          handles the bridge between Stellar and traditional finance, managing
          KYC, deposits, withdrawals, and compliance.
        </p>

        <p className="text-base text-foreground-muted">
          Both APIs serve developers building on Stellar. Both needed
          documentation that could scale.
        </p>
      </section>

      <hr className="border-border" />

      {/* Approach */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground-heading">
          The Approach
        </h2>

        <p className="text-base text-foreground-muted">
          I was asked to lead the effort of translating Stellar&apos;s APIs into
          a formal OpenAPI specification. There was no existing spec to work
          from—I had to derive it.
        </p>

        <p className="text-base text-foreground-muted">That meant:</p>

        <ul className="list-disc list-outside ml-6 space-y-2 text-base text-foreground-muted">
          <li>
            <strong className="text-foreground">Reading the codebase</strong> to
            understand what the APIs actually did, not what the old docs claimed
          </li>
          <li>
            <strong className="text-foreground">
              Reviewing existing documentation
            </strong>{" "}
            to identify gaps and inconsistencies
          </li>
          <li>
            <strong className="text-foreground">
              Interviewing senior engineers
            </strong>{" "}
            to clarify intent, edge cases, and undocumented behavior
          </li>
        </ul>

        <p className="text-base text-foreground-muted">
          From there, I designed a modular file structure where components are
          defined once and referenced everywhere:
        </p>

        <CodeBlock
          code={fileStructure}
          language="plaintext"
          filename="File Structure"
        />

        <p className="text-base text-foreground-muted">
          The key insight:{" "}
          <strong className="text-foreground">
            reusability through <code className="text-accent">$ref</code>
          </strong>
          . Instead of repeating parameter definitions across dozens of
          endpoints, define them once in{" "}
          <code className="text-accent">parameters.yml</code> and reference
          them.
        </p>
      </section>

      <hr className="border-border" />

      {/* How It Works */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-foreground-heading">
          How It Works
        </h2>

        {/* Shared Parameters */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground-heading">
            Shared Parameters
          </h3>

          <p className="text-base text-foreground-muted">
            Common patterns like pagination, sorting, and account IDs are
            defined once:
          </p>

          <CollapsibleCode
            code={parametersSnippet}
            language="yaml"
            filename="parameters.yml"
            title="parameters.yml"
          />

          <p className="text-base text-foreground-muted">
            These four parameters appear across 30+ endpoints. Define once,
            reference everywhere.
          </p>
        </div>

        {/* Endpoint Definitions */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground-heading">
            Endpoint Definitions
          </h3>

          <p className="text-base text-foreground-muted">
            Endpoints wire together parameters, schemas, and examples through
            references:
          </p>

          <CollapsibleCode
            code={accountsEndpointSnippet}
            language="yaml"
            filename="endpoints/accounts.yml"
            title="accounts.yml"
          />

          <p className="text-base text-foreground-muted">
            Notice every <code className="text-accent">$ref</code>—the endpoint
            doesn&apos;t duplicate definitions, it composes them. The response
            schema uses <code className="text-accent">allOf</code> to combine
            the links structure with the account data shape.
          </p>
        </div>

      </section>

      <hr className="border-border" />

      {/* Outcome */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground-heading">
          The Outcome
        </h2>

        <p className="text-base text-foreground-muted">
          The specifications now power the{" "}
          <a
            href="https://developers.stellar.org/docs/data/apis/horizon/api-reference"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Stellar API documentation
          </a>
          , auto-generated through Docusaurus.
        </p>

        <p className="text-base text-foreground-muted">
          <strong className="text-foreground">What changed:</strong>
        </p>

        <ul className="list-disc list-outside ml-6 space-y-2 text-base text-foreground-muted">
          <li>
            <strong className="text-foreground">Single source of truth</strong>{" "}
            — The spec <em>is</em> the contract
          </li>
          <li>
            <strong className="text-foreground">
              Update once, propagate everywhere
            </strong>{" "}
            — Change <code className="text-accent">CursorParam</code> and every
            endpoint using it reflects the change
          </li>
          <li>
            <strong className="text-foreground">
              Docs that can&apos;t drift
            </strong>{" "}
            — Generated from the spec means always in sync
          </li>
          <li>
            <strong className="text-foreground">
              Reduced maintenance burden
            </strong>{" "}
            — Adding a new endpoint means composing existing components
          </li>
        </ul>

        <Callout type="note">
          The full specification lives in the{" "}
          <a
            href="https://github.com/stellar/stellar-docs/tree/main/openapi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            stellar-docs repository
          </a>
          .
        </Callout>
      </section>

      <hr className="border-border" />

   {/* What Else You Can Do */}
<section className="space-y-4">
  <h2 className="text-xl font-bold text-foreground-heading">
    Beyond Documentation
  </h2>

  <p className="text-md text-foreground-muted">
    The spec files aren&apos;t just for docs. Once you have a formal OpenAPI
    definition, it becomes infrastructure for the entire API lifecycle:
  </p>

  <ul className="list-disc list-outside ml-6 space-y-2 text-md text-foreground-muted">
    <li>
      <strong className="text-foreground">SDK generation</strong> —
      Auto-generate client libraries in Python, JavaScript, Go, etc.
    </li>
    <li>
      <strong className="text-foreground">Mock servers</strong> — Spin up
      fake APIs for frontend development before the backend is ready
    </li>
    <li>
      <strong className="text-foreground">Contract testing</strong> —
      Validate that the implementation matches the spec
    </li>
    <li>
      <strong className="text-foreground">Postman collections</strong> —
      Auto-import endpoints for manual testing
    </li>
    <li>
      <strong className="text-foreground">Changelog diffing</strong> —
      Compare spec versions to see exactly what changed between releases
    </li>
  </ul>


</section>
    </div>
  );
}