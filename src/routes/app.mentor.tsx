import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BrainCircuit, Send } from "lucide-react";
import { Glass } from "@/components/cp/ui";
import { useProfile } from "@/lib/use-profile";
import { mentorReply } from "@/lib/careerpilot";

const title = "AI Career Mentor — CareerPilot AI";
const description =
  "Chat with a mentor that answers using your stored profile, skills, career goal, roadmap and progress.";

export const Route = createFileRoute("/app/mentor")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: MentorPage,
});

const SUGGESTIONS = [
  "What should I learn next?",
  "Am I ready for an internship?",
  "How can I improve my skills?",
  "What projects should I build?",
  "I only have 2 hours per day. Make me a plan.",
];

interface Msg {
  role: "user" | "ai";
  text: string;
}

function MentorPage() {
  const { profile } = useProfile();
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "ai",
      text: `Hi ${profile.name.split(" ")[0]} — I can see your profile: semester ${profile.semester}, ${profile.skills.length} skills recorded, ${profile.dailyHours}h/day available. Ask me anything about your path.`,
    },
  ]);
  const [input, setInput] = useState("");

  const send = (q: string) => {
    if (!q.trim()) return;
    setMsgs((m: any) => [
      ...m,
      { role: "user", text: q },
      { role: "ai", text: mentorReply(q, profile) },
    ]);
    setInput("");
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <BrainCircuit className="h-7 w-7 text-primary-glow" /> CareerPilot AI
          Mentor
        </h1>
        <p className="mt-2 text-muted-foreground">
          Grounded in your saved profile — not generic advice.
        </p>
      </div>

      <Glass hover={false} className="flex min-h-[55vh] flex-col gap-4 p-6">
        <div className="flex-1 space-y-4 overflow-y-auto">
          {msgs.map((m: { role: string; text: any }, i: any) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "btn-gradient" : "border border-border bg-secondary/50"}`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-xl border border-border bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e: { target: { value: any } }) =>
              setInput(e.target.value)
            }
            onKeyDown={(e: { key: string }) => e.key === "Enter" && send(input)}
            placeholder="Ask your mentor..."
            className="flex-1 rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <button
            onClick={() => send(input)}
            className="rounded-xl btn-gradient px-4 py-3"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </Glass>
    </div>
  );
}
