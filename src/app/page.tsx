import { ResponsePanel } from "@/components/layout/ResponsePanel";
import { PageHeader } from "@/components/content/PageHeader";
import { JsonLd } from "@/components/content/JsonLd";
import Link from "next/link";

export const metadata = {
  title: "Developer Experience Engineer",
  description: "Taylor McNeil is a Developer Experience Engineer whose documentation and tutorials have helped 75,000+ developers across 6 continents get unstuck.",
  alternates: {
    canonical: 'https://taylormcneil.dev',
  },
};

export default function Home() {

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://taylormcneil.dev/#website',
        name: 'Taylor McNeil',
        url: 'https://taylormcneil.dev/',
        description: 'Developer Experience Engineer. Creator of aampersand.',
        publisher: {
          '@id': 'https://taylormcneil.dev/#person',
        },
      },
      {
        '@type': 'Person',
        '@id': 'https://taylormcneil.dev/#person',
        name: 'Taylor McNeil',
        alternateName: 'Aryn Wilder',
        url: 'https://taylormcneil.dev/',
        description:
          'Developer Experience Engineer and Technical Writer. Creator of aampersand, a visual narrative management tool for fiction writers. Writes dark fantasy romance under the pen name Aryn Wilder.',
        jobTitle: ['Developer Experience Engineer', 'Technical Writer', 'Founder'],
        knowsAbout: [
          'Developer Experience',
          'Technical Writing',
          'Documentation',
          'Software Development',
          'Fiction Writing',
          'Dark Fantasy Romance',
          'Worldbuilding',
        ],
        sameAs: [
          'https://www.arynwilder.com/',
          'https://www.aampersand.com/',
          'https://github.com/Taylor-McNeil',
          'https://www.linkedin.com/in/taylormcneil/',
          'https://archiveofourown.org/users/ArynWilder',
          'https://www.threads.net/@author.aryn.wilder',
        ],
        brand: {
          '@type': 'SoftwareApplication',
          '@id': 'https://www.aampersand.com/#application',
          name: 'aampersand',
          url: 'https://www.aampersand.com/',
          applicationCategory: 'Writing Tool',
          description:
            'A visual narrative management tool for fiction writers. Track plotlines, map your world, and see the shape of your story.',
          operatingSystem: 'Web',
          creator: {
            '@id': 'https://taylormcneil.dev/#person',
          },
        },
      },
    ],
  }

  return (
    <>
      <JsonLd data={jsonLd} />
    <div className="space-y-8">
      <ResponsePanel
        data={{
          status: 200,
          data: {
            roles: [
              "Developer Experience Engineer",
              "Technical Writer",
              "Developer Advocate"
            ],
            location: "Remote",
            github: "https://github.com/taylor-mcneil",
            linkedin: "https://linkedin.com/in/taylormcneil",
            availability: "Busy building"
          },
        }}
      />

      <PageHeader
        method="GET"
        endpoint="/taylor-mcneil/readme"
        title="Introduction"
        description="I design developer systems that reduce friction and scale adoption."
      />

      <div className="space-y-4">
        <p className="text-lg text-foreground-muted">
          I&apos;ve mass-configured 150 flash drives overnight for a robotics
          workshop. Explained HMAC authentication to a room that thought I said
          &quot;hammock.&quot; Built documentation systems that outlived two
          reorgs. Judged many a zany hackathon project.
        </p>

        <p className="text-lg text-foreground-muted">
          75,000+ developers across 6 continents have used something I wrote to
          get unstuck.
        </p>
      </div>

      <hr className="border-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground-heading">
          Why a docs site?
        </h2>

        <p className="text-lg text-foreground-muted">
          I wanted a portfolio that works the way I work: structured, searchable, 
          and slightly overengineered for the joy of it.
        </p>

        <p className="text-lg text-foreground-muted">
          Also, I thought it would be funny. <br/> It was. <br/> For about 40 hours of Next.js debugging.
        </p>


      </section>

      <hr className="border-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground-heading">
          Where to go from here
        </h2>

        <ul className="space-y-2 text-lg">
          <li>
            <Link
              href="/quickstart"
              className="text-accent hover:underline font-medium"
            >
              /quickstart
            </Link>
            <span className="text-foreground-muted"> — The TL;DR</span>
          </li>
          <li>
            <Link
              href="/aampersand"
              className="text-accent hover:underline font-medium"
            >
              /aampersand
            </Link>
             <span className="text-foreground-muted">
              {" "}
              — A writing tool that unfolds your story
            </span>
          </li>
          <li>
            <Link
              href="/changelog"
              className="text-accent hover:underline font-medium"
            >
              /changelog
            </Link>
            <span className="text-foreground-muted">
              {" "}
              — Career history as versioning
            </span>
          </li>
          <li>
            <Link
              href="/case-studies/stellar-api-docs"
              className="text-accent hover:underline font-medium"
            >
              /case-studies
            </Link>
            <span className="text-foreground-muted">
              {" "}
              — How I approach documentation
            </span>
          </li>
          <li>
            <Link
              href="/tutorials/mongodb-tanstack"
              className="text-accent hover:underline font-medium"
            >
              /tutorials
            </Link>
            <span className="text-foreground-muted">
              {" "}
              — How I approach teaching
            </span>
          </li>
        </ul>
      </section>
    </div>
    </>
  );
}