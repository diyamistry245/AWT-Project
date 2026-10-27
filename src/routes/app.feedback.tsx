import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Star } from "lucide-react";
import { Glass } from "@/components/cp/ui";

const title = "Feedback — CareerPilot AI";
const description =
  "Share what is working and what should improve in CareerPilot AI.";

export const Route = createFileRoute("/app/feedback")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: FeedbackPage,
});

function FeedbackPage() {
  const [rating, setRating] = useState(4);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Feedback</h1>
      <Glass hover={false}>
        {sent ? (
          <p className="rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
            Thanks — your feedback has been recorded.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              How useful is CareerPilot for your planning?
            </p>
            <div className="mt-3 flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  aria-label={`${n} stars`}
                >
                  <Star
                    className={`h-7 w-7 ${n <= rating ? "fill-warning text-warning" : "text-muted-foreground"}`}
                  />
                </button>
              ))}
            </div>
            <textarea
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What should we improve?"
              className="mt-5 w-full resize-none rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <button
              onClick={() => setSent(true)}
              className="mt-4 rounded-xl btn-gradient px-5 py-3 text-sm font-semibold"
            >
              Submit feedback
            </button>
          </>
        )}
      </Glass>
    </div>
  );
}
