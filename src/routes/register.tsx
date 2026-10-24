import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Rocket } from "lucide-react";
import { Glass } from "@/components/cp/ui";
import { Field } from "./login";
import { useProfile } from "@/lib/use-profile";

const title = "Create Account — CareerPilot AI";
const description = "Register on CareerPilot AI and build your personalised skills roadmap in minutes.";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { save } = useProfile();
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "", college: "", semester: "5", branch: "" });
  const [error, setError] = useState("");
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (f.name.trim().length < 3) return setError("Please enter your full name.");
    if (!f.email.includes("@")) return setError("Enter a valid email address.");
    if (f.password.length < 8 || !/[A-Z]/.test(f.password) || !/[0-9]/.test(f.password))
      return setError("Password needs 8+ characters, one uppercase letter and one number.");
    if (f.password !== f.confirm) return setError("Passwords do not match.");
    setError("");
    save({ name: f.name, college: f.college, branch: f.branch, semester: Number(f.semester) });
    navigate({ to: "/onboarding" });
  };

  return (
    <div className="relative grid min-h-screen place-items-center px-5 py-14">
      <div className="pointer-events-none absolute inset-0 aurora opacity-70" />
      <div className="pointer-events-none absolute inset-0 grid-bg" />
      <Glass hover={false} className="relative w-full max-w-xl rounded-3xl p-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl btn-gradient"><Rocket className="h-4 w-4" /></span>
          <span className="font-display font-bold">CareerPilot AI</span>
        </Link>
        <h1 className="mt-7 text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Then we will build your career profile step by step.</p>

        <form className="mt-7 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
          <div className="sm:col-span-2"><Field label="Full Name" value={f.name} onChange={set("name")} placeholder="Riddhi Patel" /></div>
          <div className="sm:col-span-2"><Field label="Email" type="email" value={f.email} onChange={set("email")} placeholder="you@college.edu" /></div>
          <Field label="Password" type="password" value={f.password} onChange={set("password")} placeholder="••••••••" />
          <Field label="Confirm Password" type="password" value={f.confirm} onChange={set("confirm")} placeholder="••••••••" />
          <div className="sm:col-span-2"><Field label="College" value={f.college} onChange={set("college")} placeholder="Your college name" /></div>
          <Field label="Semester" value={f.semester} onChange={set("semester")} placeholder="5" />
          <Field label="Branch" value={f.branch} onChange={set("branch")} placeholder="Computer Engineering" />
          {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
          <button className="rounded-xl btn-gradient px-4 py-3 font-semibold sm:col-span-2">Create account</button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already registered? <Link to="/login" className="text-primary-glow">Login</Link>
        </p>
      </Glass>
    </div>
  );
}
