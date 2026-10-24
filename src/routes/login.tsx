import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Rocket } from "lucide-react";
import { Glass } from "@/components/cp/ui";

const title = "Login — CareerPilot AI";
const description = "Sign in to your CareerPilot AI dashboard to continue your personalised career roadmap.";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="relative grid min-h-screen place-items-center px-5 py-14">
      <div className="pointer-events-none absolute inset-0 aurora opacity-70" />
      <div className="pointer-events-none absolute inset-0 grid-bg" />
      <Glass hover={false} className="relative w-full max-w-md rounded-3xl p-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl btn-gradient"><Rocket className="h-4 w-4" /></span>
          <span className="font-display font-bold">CareerPilot AI</span>
        </Link>
        <h1 className="mt-7 text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to continue your roadmap.</p>

        <form
          className="mt-7 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.includes("@")) return setError("Enter a valid email address.");
            if (password.length < 8) return setError("Password must be at least 8 characters.");
            setError("");
            navigate({ to: "/app" });
          }}
        >
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@college.edu" />
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input type="checkbox" className="h-4 w-4 rounded border-border bg-secondary" /> Remember me
            </label>
            <Link to="/forgot-password" className="text-primary-glow">Forgot password?</Link>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button type="submit" className="w-full rounded-xl btn-gradient px-4 py-3 font-semibold">Login</button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here? <Link to="/register" className="text-primary-glow">Create an account</Link>
        </p>
      </Glass>
    </div>
  );
}

export function Field({ label, type = "text", value, onChange, placeholder }: { label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/40"
      />
    </label>
  );
}
