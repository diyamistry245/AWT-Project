import { createFileRoute } from "@tanstack/react-router";
import { BrainCircuit, Compass, Gauge, GitBranch, NotebookPen, Rocket, Scale, Target, Trophy } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/cp/SiteNav";
import { Glass, SectionTitle } from "@/components/cp/ui";

const title = "Features — CareerPilot AI";
const description = "Career Reality Score, Dream vs Reality, skill gap analysis, personalised roadmaps, AI mentor, weekly goals and a career journal.";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: FeaturesPage,
});

const ITEMS = [
  { icon: Gauge, t: "Career Reality Score", d: "Weighted analysis across technical skills, projects, communication, portfolio, interview readiness, experience and academics — surfacing your single biggest blocker with an explanation of why." },
  { icon: Target, t: "Dream vs Reality", d: "Compare your profile with a target company role. Shows readiness, a preparation timeline, your current strengths and the gaps that matter — as a planning estimate, never a hiring prediction." },
  { icon: Compass, t: "Skill Gap Analyzer", d: "Required skills for your target career, split into what you already hold and what still needs work, with a gap percentage." },
  { icon: GitBranch, t: "Personalised Roadmap", d: "Phases built from your skills, level, daily study hours and learning style, each with description, difficulty, time estimate, prerequisites, practice task and project." },
  { icon: Rocket, t: "Project Recommendations", d: "Beginner to advanced project ideas ranked by how well they match what you already know, with time estimates and skills gained." },
  { icon: BrainCircuit, t: "AI Career Mentor", d: "Chat that answers using your stored profile: what to learn next, internship readiness, project ideas and study plans that fit your real hours." },
  { icon: Trophy, t: "Weekly Goals & Progress", d: "Weekly commitments with completion percentage, donut and radar charts, and a weekly progress line." },
  { icon: Scale, t: "Career Comparison", d: "Put two careers side by side on skills, difficulty, learning time, subjects and your own readiness for each." },
  { icon: NotebookPen, t: "Career Decision Journal", d: "Record why you chose a career, what you learned, what blocked you and what you will improve next week." },
];

function FeaturesPage() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="relative">
        <div className="pointer-events-none absolute inset-0 h-[420px] aurora opacity-60" />
        <div className="relative mx-auto max-w-7xl px-5 py-16">
          <SectionTitle eyebrow="Platform" title="Everything a student needs to plan a career honestly" subtitle="Each feature reads from one profile, so the advice stays consistent across the whole platform." />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {ITEMS.map((i) => (
              <Glass key={i.t}>
                <i.icon className="h-6 w-6 text-primary-glow" />
                <h3 className="mt-4 text-lg font-semibold">{i.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{i.d}</p>
              </Glass>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
