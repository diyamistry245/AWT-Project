import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, Bar, Glass } from "@/components/cp/ui";
import { useProfile } from "@/lib/use-profile";
import { ALL_SKILLS, CAREERS, skillGap } from "@/lib/careerpilot";

const title = "Skill Gap Analyzer — CareerPilot AI";
const description =
  "Manage your skills, compare them with your target career, and identify what to learn next.";

const API_URL = "http://localhost:3001";

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
type SkillLevel = (typeof LEVELS)[number];

type StudentSkill = {
  name: string;
  level: SkillLevel;
};

type StoredUser = {
  id?: string | number;
  role?: string;
};

type ApiSkill = {
  name?: string;
  level?: string;
  proficiency?: string;
};

export const Route = createFileRoute("/app/skills")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: SkillsPage,
});

function normalizeLevel(value?: string): SkillLevel {
  const normalized = value?.toLowerCase();

  if (normalized === "advanced") return "Advanced";
  if (normalized === "intermediate") return "Intermediate";

  return "Beginner";
}

function SkillsPage() {
  const { profile, save, ready } = useProfile();

  const [userId, setUserId] = useState<string | null>(null);
  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [customLevel, setCustomLevel] = useState<SkillLevel>("Beginner");
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [savingSkills, setSavingSkills] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("loggedInUser");

      if (!storedUser) {
        setUserId(null);
        setLoadingSkills(false);
        return;
      }

      const user: StoredUser = JSON.parse(storedUser);

      if (user.id !== undefined && user.id !== null && user.role?.toLowerCase() !== "admin") {
        setUserId(String(user.id));
      } else {
        setUserId(null);
        setLoadingSkills(false);
      }
    } catch {
      setErrorMessage("Unable to read your login information. Please log in again.");
      setLoadingSkills(false);
    }
  }, []);

  const loadSkills = useCallback(async () => {
    if (!userId) {
      setLoadingSkills(false);
      return;
    }

    setLoadingSkills(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_URL}/student/${encodeURIComponent(userId)}/skills`);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load your saved skills.");
      }

      const loadedSkills: StudentSkill[] = Array.isArray(data.skills)
        ? data.skills
            .filter(
              (item: ApiSkill) => typeof item.name === "string" && item.name.trim().length > 0,
            )
            .map((item: ApiSkill) => ({
              name: item.name!.trim(),
              level: normalizeLevel(item.level ?? item.proficiency),
            }))
        : [];

      setStudentSkills(
        Array.from(
          new Map(loadedSkills.map((skill) => [skill.name.toLowerCase(), skill])).values(),
        ),
      );

      // Keep the shared profile synchronized with the student's actual skills.
      save({
        skills: loadedSkills.map((skill) => skill.name),
      });
    } catch (error) {
      console.error("Error loading student skills:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load skills from the database.",
      );
    } finally {
      setLoadingSkills(false);
    }
  }, [userId, save]);

  useEffect(() => {
    if (ready && userId) {
      void loadSkills();
    } else if (ready && !userId) {
      setLoadingSkills(false);
    }
  }, [ready, userId, loadSkills]);

  const saveSkills = useCallback(
    async (updatedSkills: StudentSkill[]) => {
      if (!userId) {
        setErrorMessage("Please log in with your student account first.");
        return;
      }

      if (savingSkills) return;

      setSavingSkills(true);
      setMessage("");
      setErrorMessage("");

      try {
        const response = await fetch(`${API_URL}/student/${encodeURIComponent(userId)}/skills`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            skills: updatedSkills.map((skill) => ({
              name: skill.name,
              level: skill.level,
            })),
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to save your skills.");
        }

        setStudentSkills(updatedSkills);
        save({
          skills: updatedSkills.map((skill) => skill.name),
        });
        setMessage("Your skills have been saved successfully.");
      } catch (error) {
        console.error("Error saving student skills:", error);
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to save your skills. Please try again.",
        );
      } finally {
        setSavingSkills(false);
      }
    },
    [userId, savingSkills, save],
  );

  const selectedSkillNames = useMemo(
    () => new Set(studentSkills.map((skill) => skill.name.toLowerCase())),
    [studentSkills],
  );

  const selectedLevel = (name: string): SkillLevel =>
    studentSkills.find((skill) => skill.name.toLowerCase() === name.toLowerCase())?.level ??
    "Beginner";

  async function toggleSkill(name: string) {
    const existing = studentSkills.find((skill) => skill.name.toLowerCase() === name.toLowerCase());

    const updatedSkills = existing
      ? studentSkills.filter((skill) => skill.name.toLowerCase() !== name.toLowerCase())
      : [...studentSkills, { name, level: "Beginner" as SkillLevel }];

    await saveSkills(updatedSkills);
  }

  async function updateSkillLevel(name: string, level: SkillLevel) {
    const updatedSkills = studentSkills.map((skill) =>
      skill.name.toLowerCase() === name.toLowerCase() ? { ...skill, level } : skill,
    );

    await saveSkills(updatedSkills);
  }

  async function addCustomSkill() {
    const name = customSkill.trim();

    if (!name) {
      setErrorMessage("Please enter a skill name.");
      return;
    }

    if (name.length > 60) {
      setErrorMessage("Skill names must be 60 characters or fewer.");
      return;
    }

    if (selectedSkillNames.has(name.toLowerCase())) {
      setErrorMessage("You have already added this skill.");
      return;
    }

    await saveSkills([...studentSkills, { name, level: customLevel }]);

    setCustomSkill("");
    setCustomLevel("Beginner");
  }

  async function changeCareer(careerId: string) {
    if (!userId) {
      setErrorMessage("Please log in with your student account first.");
      return;
    }

    setMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(`${API_URL}/student/${encodeURIComponent(userId)}/career`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ careerId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update your target career.");
      }

      save({ careerId });
      setMessage("Your target career has been saved.");
    } catch (error) {
      console.error("Error updating target career:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save your target career.",
      );
    }
  }

  const gap = useMemo(() => {
    return skillGap({
      ...profile,
      skills: studentSkills.map((skill) => skill.name),
    });
  }, [profile, studentSkills]);

  const customSkills = studentSkills.filter((skill) => !ALL_SKILLS.includes(skill.name));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Skill Gap Analysis</h1>
        <p className="mt-2 text-muted-foreground">
          Add your existing skills and compare them with your chosen career.
        </p>
      </div>

      <Glass hover={false}>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="target-career" className="text-sm text-muted-foreground">
            Target career
          </label>

          <select
            id="target-career"
            value={profile.careerId}
            onChange={(event) => void changeCareer(event.target.value)}
            disabled={!userId || savingSkills}
            className="rounded-xl border border-input bg-secondary px-3 py-2 text-sm"
          >
            {CAREERS.map((career) => (
              <option key={career.id} value={career.id}>
                {career.title}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Bar label="Skill coverage" value={gap.coverage} />
          <Bar label="Remaining skill gap" value={gap.gap} />
        </div>
      </Glass>

      {message && (
        <p aria-live="polite" className="text-sm text-success">
          {message}
        </p>
      )}

      {errorMessage && (
        <p aria-live="assertive" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Glass>
          <h2 className="text-lg font-semibold text-success">Skills you already have</h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {gap.have.length ? (
              gap.have.map((skill) => (
                <Badge key={skill} tone="success">
                  ✓ {skill}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Add your skills below to see how they match your career.
              </p>
            )}
          </div>
        </Glass>

        <Glass>
          <h2 className="text-lg font-semibold text-warning">Skills to improve</h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {gap.missing.length ? (
              gap.missing.map((skill) => (
                <Badge key={skill} tone="warn">
                  ○ {skill}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Your current skills cover the required skills in this analysis.
              </p>
            )}
          </div>
        </Glass>
      </div>

      <Glass hover={false}>
        <h2 className="text-lg font-semibold">Add your own skills</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Add any skill you know, even if it is not in our predefined list.
        </p>

        <form
          className="mt-4 flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            void addCustomSkill();
          }}
        >
          <input
            value={customSkill}
            onChange={(event) => setCustomSkill(event.target.value)}
            placeholder="e.g. Figma, MongoDB, UI Design"
            maxLength={60}
            className="min-w-0 flex-1 rounded-xl border border-input bg-secondary px-3 py-2 text-sm"
          />

          <select
            value={customLevel}
            onChange={(event) => setCustomLevel(event.target.value as SkillLevel)}
            aria-label="Your proficiency level"
            className="rounded-xl border border-input bg-secondary px-3 py-2 text-sm"
          >
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={!userId || savingSkills || !customSkill.trim()}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add skill
          </button>
        </form>
      </Glass>

      <Glass hover={false}>
        <h2 className="text-lg font-semibold">Your skills</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Select the skills you know, then set your proficiency level. Your saved skills belong to
          your student account.
        </p>

        {loadingSkills ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading your saved skills...</p>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {ALL_SKILLS.map((skill) => {
                const selected = selectedSkillNames.has(skill.toLowerCase());

                return (
                  <button
                    key={skill}
                    type="button"
                    disabled={!userId || savingSkills}
                    onClick={() => void toggleSkill(skill)}
                    aria-pressed={selected}
                    className={`rounded-xl border px-3.5 py-2 text-sm transition ${
                      selected
                        ? "border-primary/60 bg-primary/20"
                        : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {selected ? "✓ " : "+ "}
                    {skill}
                  </button>
                );
              })}
            </div>

            {customSkills.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="font-medium">Your custom skills</h3>

                {customSkills.map((skill) => (
                  <div
                    key={skill.name.toLowerCase()}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3"
                  >
                    <span className="font-medium">{skill.name}</span>

                    <div className="flex items-center gap-2">
                      <select
                        value={skill.level}
                        disabled={savingSkills}
                        onChange={(event) =>
                          void updateSkillLevel(skill.name, event.target.value as SkillLevel)
                        }
                        aria-label={`Proficiency level for ${skill.name}`}
                        className="rounded-lg border border-input bg-secondary px-2 py-1.5 text-sm"
                      >
                        {LEVELS.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        disabled={savingSkills}
                        onClick={() =>
                          void saveSkills(
                            studentSkills.filter(
                              (item) => item.name.toLowerCase() !== skill.name.toLowerCase(),
                            ),
                          )
                        }
                        className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-secondary disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {savingSkills && (
          <p className="mt-3 text-sm text-muted-foreground">Saving your changes...</p>
        )}

        {!userId && !loadingSkills && (
          <p className="mt-3 text-sm text-warning">
            Log in with a student account to manage and save your skills.
          </p>
        )}
      </Glass>
    </div>
  );
}
