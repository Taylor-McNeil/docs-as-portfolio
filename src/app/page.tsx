import { JsonLd } from "@/components/content/JsonLd";
import { ResponseBody } from "@/components/content/ResponseBody";
import { MethodBadge } from "@/components/navigation/MethodBadge";
import type { Method } from "@/components/content/navigation";
import { ConstellationHero } from "@/components/home/ConstellationHero";
import { devlogCount } from "@/components/home/constellationData";
import Link from "next/link";
import type { Metadata } from "next";
import { withSocial } from "@/lib/metadata";

export const metadata: Metadata = withSocial({
  title: "Developer Experience Engineer",
  description: "Taylor McNeil is a Developer Experience Engineer whose documentation and tutorials have helped 75,000+ developers across 6 continents get unstuck.",
  alternates: {
    canonical: 'https://taylormcneil.dev',
  },
});

const numberWords = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
const devlogsLabel = numberWords[devlogCount] ?? String(devlogCount);

const doors: { method: Method; route: string; href: string; title: string; text: string }[] = [
  {
    method: "GET",
    route: "/quickstart",
    href: "/quickstart",
    title: "Hiring?",
    text: "The TL;DR: skills, stack and career stats as a config file.",
  },
  {
    method: "PUT",
    route: "/aampersand",
    href: "/aampersand",
    title: "Building in public",
    text: `${devlogsLabel} devlogs on building a creative writing tool for fiction writers.`,
  },
  {
    method: "GET",
    route: "/professional-work",
    href: "/professional-work",
    title: "Read the work",
    text: "MongoDB x TanStack, Java Game Dev, HMAC Authentication and more.",
  },
];

const stats = [
  { value: "75k+", label: "developers" },
  { value: "6", label: "continents" },
  { value: "12", label: "hackathons" },
];

export default function Home() {

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://taylormcneil.dev/#website',
        name: 'Taylor McNeil',
        url: 'https://taylormcneil.dev/',
        description: 'Developer Experience Engineer. Creator of aampersand, a creative writing tool for fiction writers.',
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
          'Developer Experience Engineer and Technical Writer. Creator of aampersand, a creative writing tool for fiction writers. Writes dark fantasy romance under the pen name Aryn Wilder.',
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
            'A creative writing tool for fiction writers. Write your prose, tag what matters, and see your characters, plotlines, and world — all connected.',
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
      <ConstellationHero />

      <div className="space-y-10 px-6 py-10 md:px-10">
        <nav aria-label="Where to go from here" className="grid gap-4 md:grid-cols-3">
          {doors.map((door) => (
            <Link
              key={door.route}
              href={door.href}
              className="flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-surface-card p-5 transition-colors hover:border-accent"
            >
              <span className="flex items-center gap-2 font-mono text-xs text-accent">
                <MethodBadge method={door.method} active />
                {door.route}
              </span>
              <b className="text-base text-foreground-heading">{door.title}</b>
              <span className="text-sm text-foreground-muted">{door.text}</span>
            </Link>
          ))}
        </nav>

        <section className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="space-y-3 text-base text-foreground-muted">
            <p>
              I&apos;ve mass-configured 150 flash drives overnight for a robotics workshop. Explained HMAC
              authentication to a room that thought I said &quot;hammock.&quot; Built documentation systems that
              outlived two reorgs. Judged many a zany hackathon project.
            </p>
            <p>
              Why a docs site? I wanted a portfolio that works the way I work: structured, searchable, and slightly
              overengineered for the joy of it.{" "}
              <Link href="/field-notes/on-building-a-doc-system" className="font-medium text-accent hover:underline">
                Building Docs from Scratch
              </Link>
            </p>
          </div>
          <dl className="grid grid-cols-3 overflow-hidden rounded-lg border border-border">
            {stats.map((stat) => (
              <div key={stat.label} className="min-w-0 border-r border-border p-3.5 last:border-r-0">
                <dd className="font-mono text-xl font-bold tabular-nums text-foreground-heading sm:text-2xl">{stat.value}</dd>
                <dt className="text-xs text-foreground-muted">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </section>

        <ResponseBody
          request="GET /taylor-mcneil/readme"
          data={{
            status: 200,
            data: {
              roles: ["Developer Experience Engineer", "Technical Writer", "Developer Advocate"],
              location: "Remote",
              github: "https://github.com/Taylor-McNeil",
              linkedin: "https://linkedin.com/in/taylormcneil",
              availability: "Busy building",
            },
          }}
        />
      </div>
    </>
  );
}
