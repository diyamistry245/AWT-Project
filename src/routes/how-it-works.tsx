import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/cp/SiteNav";
import { Glass, SectionTitle } from "@/components/cp/ui";

const title = "How It Works — CareerPilot AI";
const description = "From student profile to career readiness in ten steps: skills, goal, gap, reality score, roadmap, projects, goals and progress.";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: HowItWorks,
});

const STEPS = [
  ["Current student profile", "College, branch, semester, CGPA and goals are captured during onboarding."],
  ["Current skills", "Select what you actually know today across programming, web, data, cloud and security."],
  ["Career goal", "Choose a target track and, optionally, a dream company role."],
  ["Skill gap", "We diff your skills against the requirements of that track."],
  ["Career Reality Score", "A weighted score across seven dimensions, not just skills."],
  ["Dream vs Reality", "An honest preparation estimate against your dream role."],
  ["Personalised roadmap", "Phases sized to your daily study time and learning style."],
  ["Projects + resources", "Matched project ideas and vetted learning material for each phase."],
  ["Weekly goals", "Turn the roadmap into five things you will actually do this week."],
  ["Progress & readiness", "Track movement over time and watch your readiness rise."],
];

function HowItWorks() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="relative">
        <div className="pointer-events-none absolute inset-0 h-[420px] aurora opacity-60" />
        <div className="relative mx-auto max-w-4xl px-5 py-16">
          <SectionTitle eyebrow="How it works" title="One profile, ten connected steps" subtitle="Nothing in CareerPilot is generic — every screen reads the same student profile." />
          <ol className="mt-12 space-y-4">
            {STEPS.map(([t, d], i) => (
              <li key={t}>
                <Glass className="flex gap-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl btn-gradient text-sm font-bold">{i + 1}</span>
                  <div>
                    <h3 className="font-semibold">{t}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{d}</p>
                  </div>
                </Glass>
              </li>
            ))}
          </ol>
          <Link to="/register" className="mt-10 inline-block rounded-xl btn-gradient px-6 py-3 font-semibold">Start your career journey</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
