import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { Glass, Ring } from "@/components/cp/ui";
import { WEEKLY_GOALS } from "@/lib/careerpilot";

const title = "Weekly Goals — CareerPilot AI";
const description = "Turn your roadmap into five weekly commitments and track your completion rate.";

export const Route = createFileRoute("/app/goals")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }] }),
  component: GoalsPage,
});

function GoalsPage() {
  const [goals, setGoals] = useState(WEEKLY_GOALS);
  const [text, setText] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const pct = goals.length ? Math.round((goals.filter((g) => g.done).length / goals.length) * 100) : 0;

  const add = () => {
    if (!text.trim()) return;
    if (editing !== null) {
      setGoals((g) => g.map((x) => (x.id === editing ? { ...x, text } : x)));
      setEditing(null);
    } else {
      setGoals((g) => [...g, { id: Date.now(), text, done: false }]);
    }
    setText("");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">This Week's Goals</h1>
        <p className="mt-2 text-muted-foreground">Small, checkable commitments beat vague plans.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-[auto_1fr]">
        <Glass className="flex items-center justify-center"><Ring value={pct} caption="Complete" /></Glass>
        <Glass hover={false}>
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Add a goal for this week..."
              className="flex-1 rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <button onClick={add} className="inline-flex items-center gap-2 rounded-xl btn-gradient px-4 py-3 text-sm font-semibold">
              <Plus className="h-4 w-4" /> {editing !== null ? "Save" : "Add"}
            </button>
          </div>
          <ul className="mt-5 space-y-2.5">
            {goals.map((g) => (
              <li key={g.id} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3">
                <button onClick={() => setGoals((all) => all.map((x) => (x.id === g.id ? { ...x, done: !x.done } : x)))} className={`grid h-5 w-5 place-items-center rounded-md border ${g.done ? "border-success bg-success/20 text-success" : "border-border"}`}>
                  {g.done && <Check className="h-3 w-3" />}
                </button>
                <span className={`flex-1 text-sm ${g.done ? "text-muted-foreground line-through" : ""}`}>{g.text}</span>
                <button onClick={() => { setEditing(g.id); setText(g.text); }} className="text-muted-foreground hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => setGoals((all) => all.filter((x) => x.id !== g.id))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
            {!goals.length && <p className="text-sm text-muted-foreground">No goals yet — add your first one above.</p>}
          </ul>
        </Glass>
      </div>
    </div>
  );
}
