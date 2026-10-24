import { createFileRoute } from "@tanstack/react-router";
import { Badge, Glass } from "@/components/cp/ui";
import { useProfile } from "@/lib/use-profile";
import { recommendProjects } from "@/lib/careerpilot";

const title = "Project Recommendations — CareerPilot AI";
const description = "Beginner to advanced project ideas matched to your current skills, with time estimates and skills gained.";

export const Route = createFileRoute("/app/projects")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }] }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { profile } = useProfile();
  const rec = recommendProjects(profile);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Recommended Projects</h1>
        <p className="mt-2 text-muted-foreground">Ranked by how much of each project you can already build with your current skills.</p>
      </div>

      {(["Beginner", "Intermediate", "Advanced"] as const).map((level) => (
        <section key={level}>
          <h2 className="text-lg font-semibold">{level}</h2>
          <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {rec[level].map((p) => {
              const known = p.skills.filter((s) => profile.skills.includes(s));
              return (
                <Glass key={p.title} className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <Badge tone="muted">{p.level}</Badge>
                    <span className="text-xs text-muted-foreground">~{p.hours}h</span>
                  </div>
                  <h3 className="mt-4 font-semibold">{p.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.skills.map((s) => (
                      <span key={s} className={`rounded-lg border px-2.5 py-1 text-xs ${profile.skills.includes(s) ? "border-success/40 bg-success/10 text-success" : "border-border bg-secondary/50 text-muted-foreground"}`}>{s}</span>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">You already know {known.length}/{p.skills.length} required skills · Gains: {p.gains.join(", ")}</p>
                </Glass>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
