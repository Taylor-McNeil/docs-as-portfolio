import { ResponsePanel } from "@/components/layout/ResponsePanel";
import { PageHeader } from "@/components/content/PageHeader";

export default function Home() {
  return (
    <div className="space-y-8">
      <ResponsePanel
        data={{
          status: 200,
          data: {
            roles: [ "Developer Experience Engineer", "Technical Writer", "Developer Advocate"],
            location: "Remote",
            email: "mcneiltaylor@live.com",
            github: "https://github.com/taylor-mcneil",
            linkedin: "https://linkedin.com/in/taylormcneil",
            availability: "Open for opportunities",
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
        <p className="text-md text-foreground-muted">
          I&apos;ve mass-configured 150 flash drives overnight for a robotics workshops.
          Explained HMAC authentication to a room that thought I said
          &quot;hammock.&quot; Built documentation systems that outlived two
          reorgs. Judged many a zany hackathon project. I like building, this website is a
          reflection of that.
        </p>

        <p className="text-md text-foreground-muted">
          75,000+ developers across 6 continents have used something I wrote to
          get unstuck. I once helped someone in Great Britain do their homework, while hosting a Python workshop.
        </p>
      </div>

      <hr className="border-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground-heading">
          Why a docs site?
        </h2>

      <p className="text-md text-foreground-muted">
        I wanted a portfolio that could handle everything I throw at it—writing, code, case studies, weird interactive demos. Seems to be holding up. <i>Time will tell</i>.
      </p>

        <p className="text-md text-foreground-muted">
          Also, I thought it would be fun. <br/>
           It was for about ... 2 hours.
        </p>
      </section>


    
    </div>
  );
}