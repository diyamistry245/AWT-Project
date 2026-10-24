import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Glass } from "@/components/cp/ui";
import { Field } from "./login";

const title = "Forgot Password — CareerPilot AI";
const description = "Reset your CareerPilot AI password and get back to your career roadmap.";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="relative grid min-h-screen place-items-center px-5">
      <div className="pointer-events-none absolute inset-0 aurora opacity-70" />
      <Glass hover={false} className="relative w-full max-w-md rounded-3xl p-8">
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="mt-1 text-sm text-muted-foreground">We will send a reset link to your registered email.</p>
        {sent ? (
          <p className="mt-6 rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
            If an account exists for {email}, a reset link is on its way.
          </p>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); if (email.includes("@")) setSent(true); }}>
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@college.edu" />
            <button className="w-full rounded-xl btn-gradient px-4 py-3 font-semibold">Send reset link</button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/login" className="text-primary-glow">Back to login</Link>
        </p>
      </Glass>
    </div>
  );
}
