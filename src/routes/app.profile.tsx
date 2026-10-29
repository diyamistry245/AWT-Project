import { createFileRoute } from "@tanstack/react-router";
import { Badge, Bar, Glass } from "@/components/cp/ui";
import { useProfile } from "@/lib/use-profile";
import { CAREERS, COMPANIES, careerReality, getCareer } from "@/lib/careerpilot";

const title = "My Profile — CareerPilot AI";
const description =
  "Manage your college details, CGPA, career goal, dream company, skills and portfolio signals.";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, save } = useProfile();
  const r = careerReality(profile);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>

      <div className="grid gap-5 lg:grid-cols-3">
        <Glass className="text-center">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-3xl btn-gradient text-2xl font-bold">
            {profile.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <h2 className="mt-4 text-lg font-semibold">{profile.name}</h2>
          <p className="text-sm text-muted-foreground">{profile.branch}</p>
          <p className="mt-1 text-xs text-muted-foreground">{profile.college}</p>
          <div className="mt-5">
            <Bar label="Career readiness" value={r.overall} />
          </div>
        </Glass>

        <Glass hover={false} className="lg:col-span-2">
          <h2 className="text-lg font-semibold">Details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Text label="Full name" value={profile.name} onChange={(v) => save({ name: v })} />
            <Text label="College" value={profile.college} onChange={(v) => save({ college: v })} />
            <Text label="Branch" value={profile.branch} onChange={(v) => save({ branch: v })} />
            <Num
              label="Semester"
              value={profile.semester}
              onChange={(v) => save({ semester: v })}
            />
            <Num label="CGPA" value={profile.cgpa} onChange={(v) => save({ cgpa: v })} step={0.1} />
            <Num
              label="Projects completed"
              value={profile.projectsDone}
              onChange={(v) => save({ projectsDone: v })}
            />
            <Num
              label="GitHub repositories"
              value={profile.githubRepos}
              onChange={(v) => save({ githubRepos: v })}
            />
            <Num
              label="Internships"
              value={profile.internships}
              onChange={(v) => save({ internships: v })}
            />
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Career goal</span>
              <select
                value={profile.careerId}
                onChange={(e) => save({ careerId: e.target.value })}
                className="w-full rounded-xl border border-input bg-secondary px-3 py-2.5 text-sm"
              >
                {CAREERS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-muted-foreground">Dream company</span>
              <select
                value={profile.dreamCompany}
                onChange={(e) => save({ dreamCompany: e.target.value })}
                className="w-full rounded-xl border border-input bg-secondary px-3 py-2.5 text-sm"
              >
                {COMPANIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Glass>
      </div>

      <Glass hover={false}>
        <h2 className="text-lg font-semibold">Skills</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {profile.skills.map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Target: {getCareer(profile.careerId).title} · Interests: {profile.interests.join(", ")}
        </p>
      </Glass>
    </div>
  );
}

function Text({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="text-sm">
      <span className="mb-1.5 block text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function Num({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <label className="text-sm">
      <span className="mb-1.5 block text-muted-foreground">{label}</span>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
