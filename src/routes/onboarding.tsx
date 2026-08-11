import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";

import { saveOnboarding } from "@/lib/onboarding.functions";
import { useDemoProfile, homeForRole, type DemoProfile } from "@/lib/demo-profile";
import type { AppRole } from "@/lib/session";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your workspace | weave+" },
      {
        name: "description",
        content:
          "Tell weave+ whether you teach, study or run the school so the demo workspace matches your role.",
      },
      { property: "og:title", content: "Set up your workspace | weave+" },
      {
        property: "og:description",
        content: "Pick a role, add a few details and step into the weave+ demo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Onboarding,
});

const ROLE_CARDS: { role: AppRole; label: string; body: string }[] = [
  {
    role: "student",
    label: "Student",
    body: "Courses, notes and deadlines. Some workspace tools stay locked.",
  },
  {
    role: "lecturer",
    label: "Lecturer",
    body: "Full workspace: course building, grading, announcements and the agent.",
  },
  {
    role: "admin",
    label: "Admin",
    body: "Everything a lecturer sees, plus members and workspace settings.",
  },
];

const EDU = /\.edu(\.[a-z]{2,})?$/i;

function isEduEmail(email: string) {
  const domain = email.split("@")[1]?.trim().toLowerCase();
  return Boolean(domain && EDU.test(domain));
}

const fieldClass =
  "mt-1.5 min-h-11 w-full rounded-ui bg-muted px-3.5 py-2.5 text-body text-snow-white outline-none transition-colors hairline placeholder:text-slate focus:ring-2 focus:ring-blurple/50";

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  hint,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string | undefined;
  error?: string | undefined;
}) {
  return (
    <label className="block text-body-sm text-ash">
      <span>
        {label}
        {required ? null : <span className="text-slate"> (optional)</span>}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className={fieldClass}
      />
      {error ? (
        <span className="mt-1.5 block text-caption text-red-400">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-caption text-slate">{hint}</span>
      ) : null}
    </label>
  );
}

/** Shrinks the uploaded photo so it fits comfortably in local storage. */
async function toAvatar(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file"));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("Could not read that image"));
    element.src = dataUrl;
  });
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return dataUrl;
  const edge = Math.min(image.width, image.height);
  context.drawImage(
    image,
    (image.width - edge) / 2,
    (image.height - edge) / 2,
    edge,
    edge,
    0,
    0,
    size,
    size,
  );
  return canvas.toDataURL("image/jpeg", 0.82);
}

function Onboarding() {
  const navigate = useNavigate();
  const { setProfile } = useDemoProfile();
  const save = useServerFn(saveOnboarding);

  const [role, setRole] = useState<AppRole | null>(null);
  const [busy, setBusy] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profession: "",
    subject: "",
    department: "",
    school: "",
    contact: "",
    program: "",
    yearLevel: "",
  });
  const [avatar, setAvatar] = useState<string | undefined>();

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function handleAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setAvatar(await toAvatar(file));
    } catch {
      toast.error("That image could not be read. Try another one.");
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!role) return;

    if (role !== "student" && !isEduEmail(form.email)) {
      setEmailError("Use your school email address, it has to end in .edu");
      return;
    }
    setEmailError(undefined);
    setBusy(true);

    const profile: DemoProfile = {
      role,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      ...(form.profession ? { profession: form.profession.trim() } : {}),
      ...(form.subject ? { subject: form.subject.trim() } : {}),
      ...(form.department ? { department: form.department.trim() } : {}),
      ...(form.school ? { school: form.school.trim() } : {}),
      ...(form.contact ? { contact: form.contact.trim() } : {}),
      ...(form.program ? { program: form.program.trim() } : {}),
      ...(form.yearLevel ? { yearLevel: form.yearLevel.trim() } : {}),
      ...(avatar ? { avatar } : {}),
    };

    try {
      const { avatar: _avatar, ...record } = profile;
      const result = await save({ data: record });
      if (result.saved) {
        toast.success("Logged to Google Sheets", {
          description: `Added a row to "${result.tab}".`,
        });
      } else {
        toast.error("Not logged to Google Sheets", {
          description: `${result.reason} Link a Google Sheets connection in Connectors, then try again. Your details stay in this browser for the demo.`,
        });
      }
    } catch {
      toast.error("Not logged to Google Sheets", {
        description:
          "The intake sheet could not be reached. Link a Google Sheets connection in Connectors to log onboarding answers.",
      });
    }

    setProfile(profile);
    setBusy(false);
    toast.success(`Welcome to weave+, ${profile.firstName}`);
    navigate({ to: homeForRole(role), replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-void-canvas px-5 py-10 sm:py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
        <Link to="/" className="font-display text-subheading font-medium text-snow-white">
          weave+
        </Link>

        {role === null ? (
          <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
            <h1 className="max-w-4xl text-balance font-display text-display-sm font-medium tracking-tight text-snow-white sm:text-display">
              Who is stepping in?
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-center text-body-lg text-ash">
              This is a demo workspace, so there is nothing to sign in to. Pick the role you want to
              explore.
            </p>

            <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
              {ROLE_CARDS.map((card) => (
                <button
                  key={card.role}
                  onClick={() => setRole(card.role)}
                  className="group flex min-h-[240px] flex-col justify-between rounded-card p-8 text-left frost transition-colors hover:bg-muted"
                >
                  <span className="block text-subheading font-semibold text-snow-white">
                    {card.label}
                  </span>
                  <span className="mt-2 block text-body text-slate leading-relaxed">
                    {card.body}
                  </span>
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={18}
                    strokeWidth={1.8}
                    className="mt-6 self-end text-slate transition-colors group-hover:text-snow-white"
                  />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <button
              onClick={() => setRole(null)}
              className="inline-flex min-h-9 items-center gap-2 rounded-pill bg-muted px-3.5 text-caption font-medium text-bone transition-colors hairline hover:bg-accent hover:text-snow-white"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={1.8} />
              Change role
            </button>

            <h1 className="mt-5 font-display text-heading-sm font-medium text-snow-white">
              {role === "student" ? "Tell us about you" : `A few ${role} details`}
            </h1>
            <p className="mt-2 text-body text-ash">
              {role === "student"
                ? "Your details shape the demo, including the face you see in the sidebar."
                : "Admins and lecturers get the full workspace. A school email is required."}
            </p>

            <form onSubmit={handleSubmit} className="mt-7 rounded-card p-6 frost sm:p-7">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="First name"
                  required
                  value={form.firstName}
                  onChange={set("firstName")}
                />
                <Field
                  label="Last name"
                  required
                  value={form.lastName}
                  onChange={set("lastName")}
                />

                {role !== "student" ? (
                  <Field
                    label="Profession"
                    required
                    value={form.profession}
                    onChange={set("profession")}
                    placeholder="Associate Professor"
                  />
                ) : null}

                {role === "lecturer" ? (
                  <Field
                    label="Subject teaching"
                    required
                    value={form.subject}
                    onChange={set("subject")}
                    placeholder="Data Structures"
                  />
                ) : null}

                {role !== "student" ? (
                  <Field
                    label="Department"
                    required
                    value={form.department}
                    onChange={set("department")}
                    placeholder="College of Computer Studies"
                  />
                ) : null}

                <Field label="School" required value={form.school} onChange={set("school")} />

                {role === "student" ? (
                  <>
                    <Field
                      label="Program or course"
                      required
                      value={form.program}
                      onChange={set("program")}
                      placeholder="BS Computer Science"
                    />
                    <Field
                      label="Year level"
                      required
                      value={form.yearLevel}
                      onChange={set("yearLevel")}
                      placeholder="3rd year"
                    />
                  </>
                ) : (
                  <Field
                    label="Contact number"
                    required={role === "admin"}
                    value={form.contact}
                    onChange={set("contact")}
                    placeholder="+63 900 000 0000"
                  />
                )}

                <div className="sm:col-span-2">
                  <Field
                    label={role === "student" ? "Email address" : "School email address"}
                    required
                    type="email"
                    value={form.email}
                    onChange={(value) => {
                      setEmailError(undefined);
                      set("email")(value);
                    }}
                    placeholder={role === "student" ? "you@school.edu" : "you@university.edu"}
                    hint={
                      role === "student"
                        ? undefined
                        : "Has to be a .edu address, for example name@university.edu"
                    }
                    error={emailError}
                  />
                </div>

                <div className="sm:col-span-2">
                  <span className="text-body-sm text-ash">
                    Profile photo <span className="text-slate">(optional)</span>
                  </span>
                  <div className="mt-2 flex items-center gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-pill bg-blurple text-body font-medium text-on-violet">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt="Your profile photo"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        (form.firstName.slice(0, 1) || "W").toUpperCase()
                      )}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatar}
                      aria-label="Upload a profile photo"
                      className="min-h-11 rounded-ui bg-muted px-3 py-2.5 text-body-sm text-bone hairline file:mr-3 file:rounded-pill file:border-0 file:bg-snow-white file:px-3 file:py-1.5 file:text-caption file:font-medium file:text-graphite-surface"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="mt-7 flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-snow-white px-6 text-body font-medium text-graphite-surface transition-colors hover:bg-bone disabled:cursor-not-allowed disabled:bg-slate disabled:text-void-canvas"
              >
                {busy ? "Setting things up…" : "Enter the demo"}
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.8} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
