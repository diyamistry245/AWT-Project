import { createFileRoute } from "@tanstack/react-router";
import { Badge, Glass } from "@/components/cp/ui";
import { useProfile } from "@/lib/use-profile";

type Project = {
  level: "Beginner" | "Intermediate" | "Advanced";
  title: string;
  hours: number;
  skills: string[];
  description: string;
  gains: string[];
};

const projectIdeas: Project[] = [
  {
    level: "Beginner",
    title: "Personal Portfolio Website",
    hours: 6,
    skills: ["HTML", "CSS", "JavaScript"],
    description:
      "Build a responsive portfolio to showcase your work and introduce yourself.",
    gains: ["Responsive design", "Web accessibility"],
  },
  {
    level: "Beginner",
    title: "Task Tracker",
    hours: 8,
    skills: ["HTML", "CSS", "JavaScript"],
    description:
      "Create a simple task list with the ability to add, complete, and remove tasks.",
    gains: ["DOM manipulation", "Local storage"],
  },
  {
    level: "Intermediate",
    title: "Weather Dashboard",
    hours: 12,
    skills: ["JavaScript", "React", "API integration"],
    description:
      "Build a dashboard that retrieves and displays current weather conditions.",
    gains: ["API integration", "Async JavaScript"],
  },
  {
    level: "Intermediate",
    title: "Expense Tracker",
    hours: 16,
    skills: ["React", "TypeScript", "CSS"],
    description:
      "Track expenses by category and visualize monthly spending trends.",
    gains: ["State management", "Data visualization"],
  },
  {
    level: "Advanced",
    title: "Collaborative Project Board",
    hours: 32,
    skills: ["React", "TypeScript", "Node.js", "SQL"],
    description:
      "Create a multi-user board for managing projects, tasks, and team activity.",
    gains: ["Authentication", "Full-stack development"],
  },
  {
    level: "Advanced",
    title: "Recommendation Service",
    hours: 40,
    skills: ["Python", "Machine Learning", "SQL"],
    description:
      "Develop a service that suggests relevant items from user preferences and activity.",
    gains: ["Model evaluation", "Backend APIs"],
  },
];

function recommendProjects(profile: { skills: string[] }) {
  return Object.fromEntries(
    (["Beginner", "Intermediate", "Advanced"] as const).map((level) => [
      level,
      projectIdeas
        .filter((project) => project.level === level)
        .sort((a, b) => {
          const knownA = a.skills.filter((skill) =>
            profile.skills.includes(skill),
          ).length;
          const knownB = b.skills.filter((skill) =>
            profile.skills.includes(skill),
          ).length;
          return knownB - knownA;
        }),
    ]),
  ) as Record<Project["level"], Project[]>;
}

const title = "Project Recommendations — CareerPilot AI";
const description =
  "Beginner to advanced project ideas matched to your current skills, with time estimates and skills gained.";

export const Route = createFileRoute("/app/projects")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { profile } = useProfile();
  const rec = recommendProjects(profile);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Recommended Projects</h1>
        <p className="mt-2 text-muted-foreground">
          Ranked by how much of each project you can already build with your
          current skills.
        </p>
      </div>

      {(["Beginner", "Intermediate", "Advanced"] as const).map((level) => (
        <section key={level}>
          <h2 className="text-lg font-semibold">{level}</h2>
          <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {rec[level].map((p) => {
              const known = p.skills.filter((s) => profile.skills.includes(s));
              return (
                <Glass key={p.title} className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <Badge tone="muted">{p.level}</Badge>
                    <span className="text-xs text-muted-foreground">
                      ~{p.hours}h
                    </span>
                  </div>
                  <h3 className="mt-4 font-semibold">{p.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">
                    {p.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.skills.map((s) => (
                      <span
                        key={s}
                        className={`rounded-lg border px-2.5 py-1 text-xs ${profile.skills.includes(s) ? "border-success/40 bg-success/10 text-success" : "border-border bg-secondary/50 text-muted-foreground"}`}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">
                    You already know {known.length}/{p.skills.length} required
                    skills · Gains: {p.gains.join(", ")}
                  </p>
                </Glass>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
