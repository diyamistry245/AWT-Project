import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  CheckCircle2,
  Flag,
  Rocket,
  Trophy,
  Wrench,
} from "lucide-react";
import { Glass } from "@/components/cp/ui";

const title = "Notifications — CareerPilot AI";
const description =
  "Roadmap steps, weekly goals, completed skills, milestones, project ideas and new resources.";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: NotificationsPage,
});

const ITEMS = [
  {
    icon: Flag,
    t: "New roadmap step unlocked",
    d: "JavaScript phase is now in progress.",
    w: "2h ago",
  },
  {
    icon: Trophy,
    t: "Weekly goal completed",
    d: "You finished 'JavaScript functions & closures'.",
    w: "Yesterday",
  },
  {
    icon: CheckCircle2,
    t: "Skill marked complete",
    d: "CSS added to your verified skill set.",
    w: "2 days ago",
  },
  {
    icon: Rocket,
    t: "Progress milestone",
    d: "Career readiness crossed 40% for the first time.",
    w: "4 days ago",
  },
  {
    icon: Wrench,
    t: "Recommended project",
    d: "Weather Application matches your current skills.",
    w: "5 days ago",
  },
  {
    icon: BookOpen,
    t: "New learning resource",
    d: "TypeScript Handbook added to your roadmap phase.",
    w: "1 week ago",
  },
];

function NotificationsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h1 className="text-3xl font-bold">Notifications</h1>
      <div className="space-y-3">
        {ITEMS.map((i) => (
          <Glass key={i.t} className="flex gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/20 text-primary-glow">
              <i.icon className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <p className="font-medium">{i.t}</p>
              <p className="text-sm text-muted-foreground">{i.d}</p>
            </div>
            <span className="text-xs text-muted-foreground">{i.w}</span>
          </Glass>
        ))}
      </div>
    </div>
  );
}
