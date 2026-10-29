import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { Glass, Ring } from "@/components/cp/ui";
import { getStudentData, saveStudentData } from "@/lib/student-data";

const title = "Weekly Goals — CareerPilot AI";
const description =
  "Turn your roadmap into five weekly commitments and track your completion rate.";

export const Route = createFileRoute("/app/goals")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: GoalsPage,
});

type Goal = {
  id: string;
  text: string;
  done: boolean;
};

type GoalsDocument = {
  goals: Goal[];
};

function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [text, setText] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load the latest saved goals from MongoDB.
  useEffect(() => {
    let cancelled = false;

    async function loadGoals() {
      try {
        setLoading(true);
        setError("");

        const records = await getStudentData<GoalsDocument>("weekly-goals");

        if (cancelled) return;

        // Each save stores a complete snapshot of the goals.
        const latest = records[0];

        if (latest?.data && Array.isArray(latest.data.goals)) {
          setGoals(latest.data.goals);
        } else {
          setGoals([]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load your weekly goals.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadGoals();

    return () => {
      cancelled = true;
    };
  }, []);

  // Persist a complete snapshot of the current goals.
  const persistGoals = useCallback(async (updatedGoals: Goal[]) => {
    setSaving(true);
    setError("");

    try {
      await saveStudentData("weekly-goals", {
        goals: updatedGoals,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save your goals.");
    } finally {
      setSaving(false);
    }
  }, []);

  const add = async () => {
    const trimmedText = text.trim();

    if (!trimmedText) return;

    let updatedGoals: Goal[];

    if (editing !== null) {
      updatedGoals = goals.map((goal) =>
        goal.id === editing ? { ...goal, text: trimmedText } : goal,
      );

      setEditing(null);
    } else {
      updatedGoals = [
        ...goals,
        {
          id: crypto.randomUUID(),
          text: trimmedText,
          done: false,
        },
      ];
    }

    setGoals(updatedGoals);
    setText("");

    await persistGoals(updatedGoals);
  };

  const toggleGoal = async (id: string) => {
    const updatedGoals = goals.map((goal) =>
      goal.id === id ? { ...goal, done: !goal.done } : goal,
    );

    setGoals(updatedGoals);

    await persistGoals(updatedGoals);
  };

  const deleteGoal = async (id: string) => {
    const updatedGoals = goals.filter((goal) => goal.id !== id);

    setGoals(updatedGoals);

    if (editing === id) {
      setEditing(null);
      setText("");
    }

    await persistGoals(updatedGoals);
  };

  const editGoal = (goal: Goal) => {
    setEditing(goal.id);
    setText(goal.text);
  };

  const pct = goals.length
    ? Math.round((goals.filter((goal) => goal.done).length / goals.length) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">This Week's Goals</h1>

        <p className="mt-2 text-muted-foreground">Small, checkable commitments beat vague plans.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-[auto_1fr]">
        <Glass className="flex items-center justify-center">
          <Ring value={pct} caption="Complete" />
        </Glass>

        <Glass hover={false}>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void add();
            }}
          >
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Add a goal for this week..."
              className="flex-1 rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm outline-none focus:border-primary"
            />

            <button
              type="submit"
              disabled={!text.trim() || saving}
              className="inline-flex items-center gap-2 rounded-xl btn-gradient px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {editing !== null ? "Save" : "Add"}
            </button>
          </form>

          {saving && (
            <p className="mt-3 text-xs text-muted-foreground">Saving changes to your account...</p>
          )}

          {error && (
            <div
              role="alert"
              className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          {loading ? (
            <p className="mt-5 text-sm text-muted-foreground">Loading your goals...</p>
          ) : (
            <ul className="mt-5 space-y-2.5">
              {goals.map((goal) => (
                <li
                  key={goal.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3"
                >
                  <button
                    type="button"
                    onClick={() => void toggleGoal(goal.id)}
                    aria-label={goal.done ? "Mark goal incomplete" : "Mark goal complete"}
                    className={`grid h-5 w-5 place-items-center rounded-md border ${
                      goal.done ? "border-success bg-success/20 text-success" : "border-border"
                    }`}
                  >
                    {goal.done && <Check className="h-3 w-3" />}
                  </button>

                  <span
                    className={`flex-1 text-sm ${
                      goal.done ? "text-muted-foreground line-through" : ""
                    }`}
                  >
                    {goal.text}
                  </span>

                  <button
                    type="button"
                    onClick={() => editGoal(goal)}
                    aria-label="Edit goal"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => void deleteGoal(goal.id)}
                    aria-label="Delete goal"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}

              {!goals.length && (
                <li className="text-sm text-muted-foreground">
                  No goals yet — add your first one above.
                </li>
              )}
            </ul>
          )}
        </Glass>
      </div>
    </div>
  );
}
