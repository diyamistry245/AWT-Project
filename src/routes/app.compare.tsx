import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge, Bar, Glass } from "@/components/cp/ui";
import { useProfile } from "@/lib/use-profile";
import { CAREERS, skillGap } from "@/lib/careerpilot";

const title = "Career Comparison — CareerPilot AI";
const description =
  "Compare two career tracks on skills, difficulty, timeline, subjects and your own current readiness.";

export const Route = createFileRoute("/app/compare")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { profile } = useProfile();
  const [a, setA] = useState("ai-engineer");
  const [b, setB] = useState("full-stack");
  const ga = skillGap(profile, a);
  const gb = skillGap(profile, b);
  const better = ga.coverage >= gb.coverage ? ga : gb;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Career Comparison</h1>
        <p className="mt-2 text-muted-foreground">
          See which track your current profile fits better today.
        </p>
      </div>

      <Glass hover={false} className="flex flex-wrap gap-4">
        <Select value={a} onChange={setA} label="Career A" />
        <Select value={b} onChange={setB} label="Career B" />
      </Glass>

      <div className="grid gap-5 lg:grid-cols-2">
        {[ga, gb].map((g) => (
          <Glass
            key={g.career.id}
            className={
              g.career.id === better.career.id ? "border-primary/50" : ""
            }
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{g.career.title}</h2>
              {g.career.id === better.career.id && (
                <Badge>Better match today</Badge>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {g.career.tagline}
            </p>
            <div className="mt-5 space-y-4">
              <Bar label="Your readiness" value={g.coverage} />
              <Row label="Difficulty" value={g.career.difficulty} />
              <Row label="Learning time" value={`~${g.career.months} months`} />
              <Row
                label="Required skills"
                value={`${g.career.skills.length}`}
              />
              <Row label="Subjects" value={g.career.subjects.join(", ")} />
              <Row label="Career path" value={g.career.path.join(" → ")} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {g.have.map((s) => (
                <Badge key={s} tone="success">
                  {s}
                </Badge>
              ))}
              {g.missing.map((s) => (
                <Badge key={s} tone="muted">
                  {s}
                </Badge>
              ))}
            </div>
          </Glass>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 border-b border-border pb-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function Select({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <label className="text-sm">
      <span className="mb-1.5 block text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-input bg-secondary px-3 py-2 text-sm"
      >
        {CAREERS.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>
    </label>
  );
}
