import { createFileRoute } from "@tanstack/react-router";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { Bar, Glass, Ring } from "@/components/cp/ui";
import { useProfile } from "@/lib/use-profile";
import { careerReality, getCareer } from "@/lib/careerpilot";

const title = "Career Reality Score — CareerPilot AI";
const description =
  "A weighted readiness report across technical skills, projects, communication, portfolio, interviews, experience and academics.";

export const Route = createFileRoute("/app/reality")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: RealityPage,
});

function RealityPage() {
  const { profile } = useProfile();
  const r = careerReality(profile);
  const data = [
    { area: "Technical", v: r.technical },
    { area: "Projects", v: r.projects },
    { area: "Communication", v: r.communication },
    { area: "Portfolio", v: r.portfolio },
    { area: "Interview", v: r.interview },
    { area: "Experience", v: r.experience },
    { area: "Academics", v: r.academics },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Career Reality Report</h1>
        <p className="mt-2 text-muted-foreground">
          How prepared you currently are for {getCareer(profile.careerId).title}{" "}
          — based on your saved profile, not guesswork.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Glass className="flex flex-col items-center justify-center">
          <Ring value={r.overall} size={180} caption="Overall readiness" />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Semester {profile.semester} · CGPA {profile.cgpa} ·{" "}
            {profile.internships} internships
          </p>
        </Glass>

        <Glass className="lg:col-span-2">
          <h2 className="text-lg font-semibold">Dimension breakdown</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Bar label="Technical Skills" value={r.technical} />
            <Bar label="Projects" value={r.projects} />
            <Bar label="Communication" value={r.communication} />
            <Bar label="Portfolio" value={r.portfolio} />
            <Bar label="Interview Readiness" value={r.interview} />
            <Bar label="Internship Experience" value={r.experience} />
            <Bar label="Academics" value={r.academics} />
          </div>
        </Glass>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Glass hover={false}>
          <h2 className="text-lg font-semibold">Profile radar</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data} outerRadius="72%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="area"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <Radar
                  dataKey="v"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Glass>

        <Glass hover={false} className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary-glow">
            Most important improvement
          </p>
          <h2 className="mt-3 text-2xl font-bold">{r.recommendation}</h2>
          <p className="mt-4 text-sm text-muted-foreground">{r.why}</p>
          <div className="mt-6 rounded-2xl border border-border bg-secondary/40 p-4 text-sm">
            <p className="font-medium">Weakest dimension</p>
            <p className="mt-1 text-muted-foreground">
              {r.weakest.label} at {r.weakest.value}% — fixing this moves your
              overall score more than anything else right now.
            </p>
          </div>
        </Glass>
      </div>
    </div>
  );
}
