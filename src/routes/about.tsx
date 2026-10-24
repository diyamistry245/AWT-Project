import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/cp/SiteNav";
import { Glass, SectionTitle } from "@/components/cp/ui";

const title = "About — CareerPilot AI";
const description = "CareerPilot AI is an intelligent career planning platform for college students, built as a Software Engineering and Advanced Web Technology semester project.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: About,
});

const DOCS = [
  "Problem Statement", "Objectives", "Scope", "Functional Requirements",
  "Non-functional Requirements", "SRS", "Use Case Diagram", "Activity Diagram",
  "Sequence Diagram", "Class Diagram", "ER Diagram", "DFD", "Database Design",
  "Testing", "Future Scope",
];

function About() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="relative">
        <div className="pointer-events-none absolute inset-0 h-[420px] aurora opacity-60" />
        <div className="relative mx-auto max-w-4xl px-5 py-16">
          <SectionTitle eyebrow="About" title="An intelligent personal career planning platform" subtitle="Built for college students who know the destination but not the road." />
          <Glass hover={false} className="mt-10 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p><span className="font-semibold text-foreground">Problem.</span> Students collect skills in a scattered way and only discover their real gaps during placement season. Generic roadmaps ignore the student's semester, hours and current level.</p>
            <p><span className="font-semibold text-foreground">Approach.</span> CareerPilot captures one structured profile, diffs it against career requirements, scores readiness across seven dimensions and generates a roadmap sized to the hours the student actually has.</p>
            <p><span className="font-semibold text-foreground">Honesty.</span> The platform never claims to predict hiring outcomes. Company comparisons are preparation estimates based on the stated profile and target role.</p>
          </Glass>

          <h2 className="mt-14 text-2xl font-bold">Documentation coverage</h2>
          <p className="mt-2 text-sm text-muted-foreground">The system is structured so the following artefacts can be documented directly from the implementation.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {DOCS.map((d) => (
              <span key={d} className="rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs">{d}</span>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
