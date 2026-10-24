import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BrainCircuit,
  Compass,
  GitBranch,
  Gauge,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/cp/SiteNav";
import { Badge, Glass, Ring, SectionTitle, Stat } from "@/components/cp/ui";
import { CAREERS } from "@/lib/careerpilot";

const title = "CareerPilot AI — AI Career Mentor & Skills Roadmap";
const description =
  "AI-powered career guidance for students: analyse your skills, find your gaps, and follow a personalised roadmap to your dream career.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Gauge, title: "Career Reality Score", body: "A weighted read of your skills, projects, portfolio, communication and interview prep — not just a skill checklist." },
  { icon: Target, title: "Dream vs Reality", body: "Compare your current profile against a target company role, with an honest preparation timeline." },
  { icon: GitBranch, title: "Personalised Roadmap", body: "Phases generated from your skills, semester, study hours and learning style." },
  { icon: Compass, title: "Skill Gap Analyzer", body: "See exactly which required skills you already hold and which ones still block you." },
  { icon: BrainCircuit, title: "AI Career Mentor", body: "Ask questions and get answers grounded in your own stored profile and progress." },
  { icon: Trophy, title: "Weekly Goals & Progress", body: "Small weekly commitments, tracked with charts, streaks and milestone cards." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteNav />

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 aurora opacity-70" />
          <div className="pointer-events-none absolute inset-0 grid-bg" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 lg:grid-cols-2 lg:py-28">
            <div>
              <Badge>
                <Sparkles className="mr-2 h-3.5 w-3.5" /> AI Career Mentor & Skills Roadmap Platform
              </Badge>
              <h1 className="mt-6 text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl">
                Your Career.
                <br />
                Your Skills.
                <br />
                <span className="text-gradient">Your Personalized Roadmap.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                AI-powered career guidance that analyzes your skills, identifies your gaps, and
                creates a personalized path toward your dream career.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl btn-gradient px-6 py-3 font-semibold"
                >
                  Start Your Career Journey <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/careers"
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 font-medium hover:bg-secondary"
                >
                  Explore Careers
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat value="10+" label="Career Paths" />
                <Stat value="100+" label="Skills" />
                <Stat value="Custom" label="Roadmaps" />
                <Stat value="Live" label="Progress" />
              </div>
            </div>

            <div className="relative [perspective:1200px]">
              <Glass className="relative z-10 rounded-3xl p-7">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl btn-gradient text-lg font-bold">
                    RP
                  </div>
                  <div>
                    <p className="font-semibold">Riddhi Patel</p>
                    <p className="text-sm text-muted-foreground">Computer Engineering · Semester 5</p>
                  </div>
                </div>

                <div className="mt-7 flex items-center justify-between gap-6">
                  <Ring value={42} caption="Readiness" />
                  <div className="flex-1 space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Target</span><span className="font-medium">Full Stack Developer</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Dream</span><span className="font-medium">Google SWE</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Timeline</span><span className="font-medium">18 months</span></div>
                  </div>
                </div>

                <div className="mt-7 space-y-3">
                  {["Frontend foundations", "JavaScript & TypeScript", "Backend & databases"].map((s, i) => (
                    <div key={s} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${i === 0 ? "bg-success" : i === 1 ? "bg-warning" : "bg-muted-foreground/50"}`} />
                      <span className="text-sm">{s}</span>
                    </div>
                  ))}
                </div>
              </Glass>

              <div className="floaty absolute -left-5 top-40 z-20 hidden rounded-2xl glass px-4 py-3 text-sm sm:block">
                <BrainCircuit className="mb-1 h-4 w-4 text-primary-glow" />
                AI Mentor
              </div>
              <div className="floaty absolute -right-4 bottom-16 z-20 hidden rounded-2xl glass px-4 py-3 text-sm sm:block" style={{ animationDelay: "1.5s" }}>
                +12 skills mapped
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20">
          <SectionTitle
            eyebrow="Features"
            title="Not another static roadmap website"
            subtitle="CareerPilot analyses your whole profile — skills, projects, portfolio, preparation — and tells you the one thing holding you back right now."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Glass key={f.title}>
                <f.icon className="h-6 w-6 text-primary-glow" />
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </Glass>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-20">
          <SectionTitle eyebrow="Careers" title="Popular career tracks" subtitle="Each track ships with required skills, subjects, projects and a phase-by-phase roadmap." />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CAREERS.slice(0, 8).map((c) => (
              <Glass key={c.id} className="flex flex-col">
                <Badge tone="muted">{c.difficulty}</Badge>
                <h3 className="mt-4 font-semibold">{c.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{c.tagline}</p>
                <p className="mt-4 text-xs text-muted-foreground">~{c.months} months · {c.skills.length} core skills</p>
              </Glass>
            ))}
          </div>
          <div className="mt-10">
            <Link to="/careers" className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm hover:bg-secondary">
              View all career tracks <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-24">
          <Glass hover={false} className="relative overflow-hidden rounded-3xl p-10 text-center">
            <div className="pointer-events-none absolute inset-0 aurora opacity-60" />
            <div className="relative">
              <h2 className="text-3xl font-bold sm:text-4xl">Ready to see where you actually stand?</h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Build your profile in a few minutes and get your Career Reality Score, skill gap and
                a roadmap that fits the hours you really have.
              </p>
              <Link to="/register" className="mt-8 inline-flex items-center gap-2 rounded-xl btn-gradient px-6 py-3 font-semibold">
                Start Your Career Journey <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Glass>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
