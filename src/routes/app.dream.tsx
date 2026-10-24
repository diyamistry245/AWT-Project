import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown } from "lucide-react";
import { Badge, Glass, Ring } from "@/components/cp/ui";
import { useProfile } from "@/lib/use-profile";
import { COMPANIES, dreamVsReality } from "@/lib/careerpilot";

const title = "Dream vs Reality — CareerPilot AI";
const description = "See how your current profile compares with your dream company role, with an honest preparation timeline and gap list.";

export const Route = createFileRoute("/app/dream")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }] }),
  component: DreamPage,
});

const JOURNEY = ["Current Level", "Skill Development", "Projects", "Open Source", "Interview Preparation", "Target Career"];

function DreamPage() {
  const { profile, save } = useProfile();
  const d = dreamVsReality(profile);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dream vs Reality</h1>
        <p className="mt-2 text-muted-foreground">A preparation comparison — not a hiring prediction.</p>
      </div>

      <Glass hover={false}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">Dream company</span>
          <select value={profile.dreamCompany} onChange={(e) => save({ dreamCompany: e.target.value })} className="rounded-xl border border-input bg-secondary px-3 py-2 text-sm">
            {COMPANIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      </Glass>

      <div className="grid gap-5 lg:grid-cols-3">
        <Glass className="lg:col-span-1">
          <p className="text-xs uppercase tracking-[0.2em] text-primary-glow">Dream</p>
          <h2 className="mt-2 text-2xl font-bold">{d.company.name} {d.company.role}</h2>
          <p className="mt-3 text-sm text-muted-foreground">Typical preparation bar for this role: {d.company.bar}%.</p>
          <p className="mt-4 text-sm text-muted-foreground">Focus areas: {d.company.focus.join(", ")}</p>
        </Glass>

        <Glass className="flex items-center gap-6">
          <Ring value={d.readiness} size={140} caption="Readiness" />
          <div>
            <p className="text-sm text-muted-foreground">Estimated preparation timeline</p>
            <p className="text-3xl font-bold text-gradient">{d.months} months</p>
            <p className="mt-2 text-xs text-muted-foreground">At {profile.dailyHours}h/day of consistent study.</p>
          </div>
        </Glass>

        <Glass>
          <h3 className="font-semibold">Current strengths</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {d.strengths.length ? d.strengths.map((s) => <Badge key={s} tone="success">{s}</Badge>) : <p className="text-sm text-muted-foreground">None recorded yet.</p>}
          </div>
          <h3 className="mt-5 font-semibold">Major gaps</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {d.gaps.map((s) => <Badge key={s} tone="warn">{s}</Badge>)}
          </div>
        </Glass>
      </div>

      <Glass hover={false}>
        <h2 className="text-lg font-semibold">Your journey</h2>
        <div className="mt-6 flex flex-col items-center gap-2">
          {JOURNEY.map((j, i) => (
            <div key={j} className="flex w-full max-w-md flex-col items-center">
              <div className={`w-full rounded-2xl border px-5 py-3 text-center text-sm ${i === 0 ? "border-success/50 bg-success/10" : i === JOURNEY.length - 1 ? "border-primary/50 bg-primary/15" : "border-border bg-secondary/40"}`}>
                {j}
              </div>
              {i < JOURNEY.length - 1 && <ArrowDown className="my-1 h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </Glass>

      <div className="grid gap-5 lg:grid-cols-2">
        <Glass>
          <h2 className="text-lg font-semibold">What you need to improve</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• {d.reality.weakest.label} is your lowest dimension at {d.reality.weakest.value}%.</li>
            <li>• {d.gaps.length} required areas are still missing from your profile.</li>
            <li>• Interview readiness sits at {d.reality.interview}% against a {d.company.bar}% bar.</li>
          </ul>
        </Glass>
        <Glass>
          <h2 className="text-lg font-semibold">Recommended next steps</h2>
          <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>1. {d.reality.recommendation}</li>
            <li>2. Start {d.gaps[0] ?? "depth work"} this month and log it in weekly goals.</li>
            <li>3. Publish every project on GitHub with a written README.</li>
            <li>4. Re-run this comparison monthly to see the timeline shrink.</li>
          </ol>
        </Glass>
      </div>
    </div>
  );
}
