import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Glass } from "@/components/cp/ui";
import { ALL_SKILLS, CAREERS, type Level } from "@/lib/careerpilot";
import { useProfile } from "@/lib/use-profile";
import { COMPANIES } from "@/lib/careerpilot";

const title = "Onboarding — CareerPilot AI";
const description = "Build your career profile: skills, level, interests, study time, learning style and dream career.";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Onboarding,
});

const INTERESTS = ["Web Development", "AI/ML", "Data Science", "Cybersecurity", "Cloud", "Mobile Development", "Software Development", "Data Analytics"];
const STYLES = ["Video", "Reading", "Practice", "Projects", "Mixed"];
const STEPS = ["Personal", "Academics", "Skills", "Level", "Interests", "Study time", "Learning style", "Dream career", "Dream company"];

function Onboarding() {
  const navigate = useNavigate();
  const { profile, save } = useProfile();
  const [step, setStep] = useState(0);

  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const next = () => (step === STEPS.length - 1 ? navigate({ to: "/app" }) : setStep((s) => s + 1));

  return (
    <div className="relative min-h-screen px-5 py-12">
      <div className="pointer-events-none absolute inset-0 aurora opacity-60" />
      <div className="relative mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-primary-glow">Step {step + 1} of {STEPS.length}</p>
        <h1 className="mt-3 text-3xl font-bold">{STEPS[step]}</h1>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%`, backgroundImage: "var(--gradient-primary)" }} />
        </div>

        <Glass hover={false} className="mt-8 rounded-3xl p-8">
          {step === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full name" value={profile.name} onChange={(v) => save({ name: v })} />
              <Input label="College" value={profile.college} onChange={(v) => save({ college: v })} />
            </div>
          )}
          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Branch" value={profile.branch} onChange={(v) => save({ branch: v })} />
              <Input label="Semester" value={String(profile.semester)} onChange={(v) => save({ semester: Number(v) || 1 })} />
              <Input label="CGPA" value={String(profile.cgpa)} onChange={(v) => save({ cgpa: Number(v) || 0 })} />
            </div>
          )}
          {step === 2 && (
            <Chips options={ALL_SKILLS} selected={profile.skills} onToggle={(v) => save({ skills: toggle(profile.skills, v) })} />
          )}
          {step === 3 && (
            <Chips options={["Beginner", "Intermediate", "Advanced"]} selected={[profile.level]} onToggle={(v) => save({ level: v as Level })} />
          )}
          {step === 4 && (
            <Chips options={INTERESTS} selected={profile.interests} onToggle={(v) => save({ interests: toggle(profile.interests, v) })} />
          )}
          {step === 5 && (
            <Chips options={["1 hour", "2 hours", "3 hours", "4+ hours"]} selected={[`${profile.dailyHours}${profile.dailyHours >= 4 ? "+ hours" : profile.dailyHours === 1 ? " hour" : " hours"}`]} onToggle={(v) => save({ dailyHours: parseInt(v, 10) })} />
          )}
          {step === 6 && (
            <Chips options={STYLES} selected={[profile.learningStyle]} onToggle={(v) => save({ learningStyle: v })} />
          )}
          {step === 7 && (
            <Chips options={CAREERS.map((c) => c.title)} selected={[CAREERS.find((c) => c.id === profile.careerId)?.title ?? ""]} onToggle={(v) => save({ careerId: CAREERS.find((c) => c.title === v)?.id ?? profile.careerId })} />
          )}
          {step === 8 && (
            <Chips options={COMPANIES.map((c) => c.name)} selected={[profile.dreamCompany]} onToggle={(v) => save({ dreamCompany: v })} />
          )}

          <div className="mt-8 flex items-center justify-between">
            <button disabled={step === 0} onClick={() => setStep((s) => s - 1)} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm disabled:opacity-40">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button onClick={next} className="inline-flex items-center gap-2 rounded-xl btn-gradient px-5 py-2.5 text-sm font-semibold">
              {step === STEPS.length - 1 ? "Go to dashboard" : "Continue"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </Glass>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40" />
    </label>
  );
}

function Chips({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            onClick={() => onToggle(o)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition ${on ? "border-primary/60 bg-primary/20 text-foreground" : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"}`}
          >
            {on && <Check className="h-3.5 w-3.5 text-primary-glow" />}
            {o}
          </button>
        );
      })}
    </div>
  );
}
