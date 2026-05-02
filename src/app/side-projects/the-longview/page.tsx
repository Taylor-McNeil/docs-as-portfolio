import { ResponsePanel } from "@/components/layout/ResponsePanel";
import { PageHeader } from "@/components/content/PageHeader";

export const metadata = {
  title: "The Long View",
  description: "A free, no-signup year-at-a-glance digital planner. Built with React and localStorage — everything stays on your device.",
  alternates: {
    canonical: '/side-projects/the-longview',
  },
};

export default function TheLongView() {
  return (
    <div className="space-y-8">
      <ResponsePanel
        data={{
          project: "The Long View",
          status: "Shipped",
          type: "Calendar",
          stack: ["React", "TypeScript", "Tailwind v4", "dnd-kit"],
          storage: "localStorage",
          backend: "None",
          repo: "https://github.com/Taylor-McNeil/the-longview",
          live: "https://thelongview.dev",
        }}
      />

      <PageHeader
        method="POST"
        endpoint="/side-projects/the-longview"
        title="The Long View"
        description="A year-at-a-glance planner. No signups, no servers."
      />

      {/* Context */}
      <section className="space-y-4">
        <p className="text-lg text-foreground-muted">
          You&apos;ve seen those $50 &quot;Big Calendars&quot; on TikTok—giant
          wall posters that show your whole year at a glance. I wanted a digital
          version that was free, portable, and didn&apos;t require an account.
        </p>
      </section>

      {/* Live Demo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground-heading">Try It</h2>
        <div className="relative rounded-lg border border-border overflow-hidden">
          <iframe
            src="https://thelongview.dev"
            className="w-full h-[500px]"
            title="The Long View - Year Planner"
          />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </div>
        <a
          href="https://thelongview.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-accent hover:underline"
        >
          Open full app →
        </a>
      </section>

      {/* Interesting Problems */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground-heading">
          Interesting Problems
        </h2>

        <h3 className="text-xl font-semibold text-foreground-heading">
          Lane Calculation
        </h3>
        <p className="text-lg text-foreground-muted">
          When events overlap, they need to stack vertically without colliding.
          The naive approach is O(n²)—compare every event to every other event.
          For a personal calendar with &lt;100 events, this is fine. I kept it
          simple instead of prematurely optimizing.
        </p>

        

        <h3 className="text-xl font-semibold text-foreground-heading">
          Multi-Day Rendering
        </h3>
        <p className="text-lg text-foreground-muted">
          A 14-day vacation needs to render as one draggable bar spanning
          multiple cells. CSS Grid handles the layout, but the tricky part is
          calculating which cells an event occupies when months have different
          lengths. February 28th + 5 days = March 5th, not February 33rd.
        </p>

        

        <h3 className="text-xl font-semibold text-foreground-heading">
          No Backend
        </h3>
        <p className="text-lg text-foreground-muted">
          Everything lives in localStorage. This means no auth, no database, no
          server costs—but also no sync across devices. I added JSON
          export/import so users own their data completely. Trade-offs.
        </p>

        <h3 className="text-xl font-semibold text-foreground-heading">
          UI Design
        </h3>
        <p className="text-lg text-foreground-muted">
          The UI presented a challenge. The calendar grid itself came together
          quickly. It&apos;s just data in boxes. But the header and toolbar? I
          went through probably a dozen iterations trying to figure out where
          zoom controls, year navigation, theme picker, and import/export should
          live. Nothing felt quite right.
        </p>
        <p className="text-lg text-foreground-muted">
          The current layout works. It&apos;s not embarrassing. But I&apos;m
          still not fully satisfied with how the controls are organized.
          I&apos;d probably focus on a collapsible settings panel or a command
          palette instead of everything visible at once.
        </p>
      </section>

      {/* Made with */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground-heading">Stack</h2>
        {/* Fixed: Moved ul out of p tag for valid HTML */}
        <ul className="list-disc list-inside text-lg text-foreground-muted">
          <li>React</li>
          <li>TypeScript</li>
          <li>shadcn</li>
          <li>dnd-kit</li>
        </ul>
      </section>

      {/* Links */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground-heading">Links</h2>
        <ul className="space-y-2 text-lg">
          <li>
            <a
              href="https://thelongview.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              → Live Site
            </a>
          </li>
          <li>
            <a
              href="https://github.com/Taylor-McNeil/the-longview"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              → Source Code
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
