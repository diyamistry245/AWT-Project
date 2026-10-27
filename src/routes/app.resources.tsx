import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Badge, Glass } from "@/components/cp/ui";
import { RESOURCES } from "@/lib/careerpilot";

const title = "Learning Resources — CareerPilot AI";
const description =
  "Filterable library of documentation, courses, practice sites and books for every roadmap skill.";

export const Route = createFileRoute("/app/resources")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ResourcesPage,
});

const COSTS = ["All", "Free", "Paid"] as const;
const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"] as const;

function ResourcesPage() {
  const [cost, setCost] = useState<(typeof COSTS)[number]>("All");
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("All");

  const list = RESOURCES.filter(
    (r) =>
      (cost === "All" || r.cost === cost) &&
      (level === "All" || r.level === level),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Learning Resources</h1>
        <p className="mt-2 text-muted-foreground">
          Only real, verifiable sources — no invented links.
        </p>
      </div>

      <Glass hover={false} className="flex flex-wrap gap-6">
        <Filter label="Cost" options={COSTS} value={cost} onChange={setCost} />
        <Filter
          label="Level"
          options={LEVELS}
          value={level}
          onChange={setLevel}
        />
      </Glass>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {list.map((r) => (
          <Glass key={r.title} className="flex flex-col">
            <div className="flex items-center justify-between">
              <Badge tone="muted">{r.type}</Badge>
              <Badge tone={r.cost === "Free" ? "success" : "warn"}>
                {r.cost}
              </Badge>
            </div>
            <h3 className="mt-4 font-semibold">{r.title}</h3>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">
              {r.provider} · {r.level} · {r.skill}
            </p>
            <a
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-primary-glow hover:underline"
            >
              Open resource <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Glass>
        ))}
        {!list.length && (
          <p className="text-sm text-muted-foreground">
            No resources match these filters.
          </p>
        )}
      </div>
    </div>
  );
}

function Filter<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`rounded-xl border px-3.5 py-1.5 text-sm ${value === o ? "border-primary/60 bg-primary/20" : "border-border bg-secondary/40 text-muted-foreground"}`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
