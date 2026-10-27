import { createFileRoute } from "@tanstack/react-router";
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bar, Glass } from "@/components/cp/ui";
import { useProfile } from "@/lib/use-profile";
import { buildRoadmap, careerReality } from "@/lib/careerpilot";

const title = "Progress Dashboard — CareerPilot AI";
const description = "Donut, radar and weekly trend charts showing how your roadmap, skills, projects and interview prep are moving.";

export const Route = createFileRoute("/app/progress")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }] }),
  component: ProgressPage,
});

const WEEKLY = [
  { week: "W1", score: 18 }, { week: "W2", score: 24 }, { week: "W3", score: 29 },
  { week: "W4", score: 33 }, { week: "W5", score: 38 }, { week: "W6", score: 42 },
];

function ProgressPage() {
  const { profile } = useProfile();
  const r = careerReality(profile);
  const phases = buildRoadmap(profile);
  const donePct = Math.round((phases.filter((p) => p.status === "done").length / phases.length) * 100);
  const donut = [
    { name: "Completed", value: donePct },
    { name: "Remaining", value: 100 - donePct },
  ];
  const radar = [
    { area: "Technical", v: r.technical }, { area: "Projects", v: r.projects },
    { area: "Portfolio", v: r.portfolio }, { area: "Interview", v: r.interview },
    { area: "Communication", v: r.communication },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Progress Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Overall roadmap completion and dimension-level movement.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Glass hover={false}>
          <h2 className="text-lg font-semibold">Roadmap completion</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donut} dataKey="value" innerRadius={55} outerRadius={80} stroke="none">
                  <Cell fill="var(--primary)" />
                  <Cell fill="var(--secondary)" />
                </Pie>
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-2xl font-bold text-gradient">{donePct}%</p>
        </Glass>

        <Glass hover={false} className="lg:col-span-2">
          <h2 className="text-lg font-semibold">Weekly readiness trend</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={WEEKLY}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="score" stroke="var(--primary-glow)" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Glass>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Glass hover={false}>
          <h2 className="text-lg font-semibold">Skill dimensions</h2>
          <div className="mt-4 space-y-4">
            <Bar label="Overall Roadmap" value={donePct} />
            <Bar label="Technical Skills" value={r.technical} />
            <Bar label="Projects" value={r.projects} />
            <Bar label="Interview Preparation" value={r.interview} />
            <Bar label="Portfolio" value={r.portfolio} />
          </div>
        </Glass>
        <Glass hover={false}>
          <h2 className="text-lg font-semibold">Balance radar</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar} outerRadius="72%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="area" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <Radar dataKey="v" stroke="var(--primary-glow)" fill="var(--primary-glow)" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Glass>
      </div>
    </div>
  );
}
