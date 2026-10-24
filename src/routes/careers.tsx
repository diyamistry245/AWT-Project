import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/cp/SiteNav";
import { Badge, Glass, SectionTitle } from "@/components/cp/ui";
import { CAREERS } from "@/lib/careerpilot";

const title = "Career Tracks — CareerPilot AI";
const description =
  "Explore 8 in-demand career tracks with required skills, college subjects, timelines and roadmaps.";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: CareersPage,
});

function CareersPage() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="relative">
        <div className="pointer-events-none absolute inset-0 h-[420px] aurora opacity-60" />
        <div className="relative mx-auto max-w-7xl px-5 py-16">
          <SectionTitle
            eyebrow="Career Library"
            title="Pick a destination, then let the roadmap adapt to you"
            subtitle="Every track lists the skills employers expect, the college subjects that map to it, and a realistic preparation window."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {CAREERS.map((c) => (
              <Glass key={c.id} className="flex flex-col">
                <div className="flex items-center justify-between">
                  <Badge tone="muted">{c.difficulty}</Badge>
                  <span className="text-xs text-muted-foreground">~{c.months} months</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.tagline}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {c.skills.slice(0, 6).map((s) => (
                    <span key={s} className="rounded-lg border border-border bg-secondary/50 px-2.5 py-1 text-xs">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Subjects: {c.subjects.join(", ")}
                </p>
                <Link
                  to="/register"
                  className="mt-6 rounded-xl btn-gradient px-4 py-2 text-center text-sm font-semibold"
                >
                  Build my roadmap
                </Link>
              </Glass>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}