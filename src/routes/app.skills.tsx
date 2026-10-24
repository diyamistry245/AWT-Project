import { createFileRoute } from "@tanstack/react-router";
import { Badge, Bar, Glass } from "@/components/cp/ui";
import { useProfile } from "@/lib/use-profile";
import { ALL_SKILLS, CAREERS, skillGap } from "@/lib/careerpilot";

const title = "Skill Gap Analyzer — CareerPilot AI";
const description = "Compare your current skills against the requirements of your target career and see exactly what is missing.";

export const Route = createFileRoute("/app/skills")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }] }),
  component: SkillsPage,
});

function SkillsPage() {
  const { profile, save } = useProfile();
  const gap = skillGap(profile);
  const toggle = (s: string) => save({ skills: profile.skills.includes(s) ? profile.skills.filter((x) => x !== s) : [...profile.skills, s] });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Skill Gap Analysis</h1>
        <p className="mt-2 text-muted-foreground">Target: {gap.career.title}</p>
      </div>

      <Glass hover={false}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">Change target career</span>
          <select
            value={profile.careerId}
            onChange={(e) => save({ careerId: e.target.value })}
            className="rounded-xl border border-input bg-secondary px-3 py-2 text-sm"
          >
            {CAREERS.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Bar label="Skill coverage" value={gap.coverage} />
          <Bar label="Skill gap" value={gap.gap} />
        </div>
      </Glass>

      <div className="grid gap-5 lg:grid-cols-2">
        <Glass>
          <h2 className="text-lg font-semibold text-success">Already strong</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {gap.have.length ? gap.have.map((s) => <Badge key={s} tone="success">✓ {s}</Badge>) : <p className="text-sm text-muted-foreground">No required skills yet — start with the first roadmap phase.</p>}
          </div>
        </Glass>
        <Glass>
          <h2 className="text-lg font-semibold text-warning">Need improvement</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {gap.missing.length ? gap.missing.map((s) => <Badge key={s} tone="warn">○ {s}</Badge>) : <p className="text-sm text-muted-foreground">You cover every required skill. Focus on depth and projects.</p>}
          </div>
        </Glass>
      </div>

      <Glass hover={false}>
        <h2 className="text-lg font-semibold">Your skills</h2>
        <p className="mt-1 text-sm text-muted-foreground">Tap to add or remove — every analysis on the platform updates instantly.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {ALL_SKILLS.map((s) => {
            const on = profile.skills.includes(s);
            return (
              <button key={s} onClick={() => toggle(s)} className={`rounded-xl border px-3.5 py-2 text-sm transition ${on ? "border-primary/60 bg-primary/20" : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"}`}>
                {s}
              </button>
            );
          })}
        </div>
      </Glass>
    </div>
  );
}
