import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Glass } from "@/components/cp/ui";

const title = "Career Journal — CareerPilot AI";
const description =
  "Record why you chose your career, what you learned, the challenges you faced and what to improve next week.";

export const Route = createFileRoute("/app/journal")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: JournalPage,
});

const PROMPTS = [
  "Why did I choose this career?",
  "What did I learn this week?",
  "What challenges did I face?",
  "What will I improve next week?",
];

interface Entry {
  id: number;
  date: string;
  answers: string[];
}

function JournalPage() {
  const [entries, setEntries] = useState<Entry[]>([
    {
      id: 1,
      date: new Date().toLocaleDateString(),
      answers: [
        "Full stack lets me build complete products end to end.",
        "Array methods and fetch-based API calls.",
        "Async debugging took longer than expected.",
        "Finish the weather app and push it to GitHub.",
      ],
    },
  ]);
  const [draft, setDraft] = useState(["", "", "", ""]);

  const save = () => {
    if (draft.every((d) => !d.trim())) return;
    setEntries((e) => [
      { id: Date.now(), date: new Date().toLocaleDateString(), answers: draft },
      ...e,
    ]);
    setDraft(["", "", "", ""]);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Career Journal</h1>
        <p className="mt-2 text-muted-foreground">
          Reflection is what turns activity into direction.
        </p>
      </div>

      <Glass hover={false} className="space-y-4">
        {PROMPTS.map((p, i) => (
          <label key={p} className="block">
            <span className="mb-1.5 block text-sm text-muted-foreground">
              {p}
            </span>
            <textarea
              rows={2}
              value={draft[i]}
              onChange={(e) =>
                setDraft((d) => d.map((v, j) => (j === i ? e.target.value : v)))
              }
              className="w-full resize-none rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>
        ))}
        <button
          onClick={save}
          className="rounded-xl btn-gradient px-5 py-3 text-sm font-semibold"
        >
          Add entry
        </button>
      </Glass>

      <div className="space-y-4">
        {entries.map((e) => (
          <Glass key={e.id}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{e.date}</p>
              <button
                onClick={() =>
                  setEntries((all) => all.filter((x) => x.id !== e.id))
                }
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              {PROMPTS.map(
                (p, i) =>
                  e.answers[i]?.trim() && (
                    <div key={p}>
                      <dt className="text-muted-foreground">{p}</dt>
                      <dd className="mt-0.5">{e.answers[i]}</dd>
                    </div>
                  ),
              )}
            </dl>
          </Glass>
        ))}
      </div>
    </div>
  );
}
