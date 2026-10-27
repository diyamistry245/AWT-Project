import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge, Glass } from "@/components/cp/ui";
import { useProfile } from "@/lib/use-profile";
import { RESOURCES, SEMESTER_PLAN, buildRoadmap, getCareer } from "@/lib/careerpilot";

const title = "Personalised Roadmap — CareerPilot AI";
const description = "A phase-by-phase roadmap generated from your skills, level, semester, study hours and learning style.";

export const Route = createFileRoute("/app/roadmap")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }] }),
  component: RoadmapPage,
});

function RoadmapPage() {
  const { profile } = useProfile();
  const phases = buildRoadmap(profile);
  const [open, setOpen] = useState<string | null>(phases.find((p) => p.status === "active")?.title ?? null);
  const [tab, setTab] = useState<"career" | "semester">("career");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{getCareer(profile.careerId).title} Roadmap</h1>
        <p className="mt-2 text-muted-foreground">Sized for {profile.dailyHours}h/day · {profile.learningStyle}-first learning · Semester {profile.semester}</p>
      </div>

      <div className="flex gap-2">
        {(["career", "semester"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-xl border px-4 py-2 text-sm ${tab === t ? "border-primary/60 bg-primary/20" : "border-border bg-secondary/40 text-muted-foreground"}`}>
            {t === "career" ? "Career roadmap" : "Semester-wise plan"}
          </button>
        ))}
      </div>

      {tab === "career" ? (
        <div className="space-y-3">
          {phases.map((p) => {
            const res = RESOURCES.filter((r) => r.skill === p.skill);
            const isOpen = open === p.title;
            return (
              <Glass key={p.title} hover={false} className="p-0">
                <button onClick={() => setOpen(isOpen ? null : p.title)} className="flex w-full items-center gap-4 px-6 py-5 text-left">
                  <span className={`h-3 w-3 shrink-0 rounded-full ${p.status === "done" ? "bg-success" : p.status === "active" ? "bg-warning" : "bg-muted-foreground/40"}`} />
                  <span className="flex-1 font-medium">{p.title}</span>
                  <Badge tone={p.status === "done" ? "success" : p.status === "active" ? "warn" : "muted"}>
                    {p.status === "done" ? "Completed" : p.status === "active" ? "In progress" : "Upcoming"}
                  </Badge>
                </button>
                {isOpen && (
                  <div className="space-y-4 border-t border-border px-6 py-5 text-sm">
                    <p className="text-muted-foreground">{p.description}</p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Info label="Difficulty" value={p.difficulty} />
                      <Info label="Estimated time" value={`~${p.hours} hours`} />
                      <Info label="Prerequisites" value={p.prerequisites.join(", ") || "None"} />
                    </div>
                    <Info label="Practice task" value={p.practice} />
                    <Info label="Project suggestion" value={p.project} />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Learning resources</p>
                      {res.length ? (
                        <ul className="mt-2 space-y-1">
                          {res.map((r) => (
                            <li key={r.title}>
                              <a href={r.url} target="_blank" rel="noreferrer" className="text-primary-glow hover:underline">{r.title}</a>
                              <span className="text-muted-foreground"> — {r.provider} · {r.type} · {r.cost}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-muted-foreground">Curated links for this skill are being added.</p>
                      )}
                    </div>
                  </div>
                )}
              </Glass>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {SEMESTER_PLAN.map((s) => (
            <Glass key={s.sem} className={s.sem === profile.semester ? "border-primary/50" : ""}>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Semester {s.sem}</h2>
                {s.sem === profile.semester && <Badge>You are here</Badge>}
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {s.focus.map((f) => <li key={f}>• {f}</li>)}
              </ul>
            </Glass>
          ))}
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1">{value}</p>
    </div>
  );
}
