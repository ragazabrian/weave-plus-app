import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/lib/session";
import { FilledButton } from "@/components/kit";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in | weave+" },
      {
        name: "description",
        content: "Sign in to your weave+ workspace to reach your notes, courses and agent.",
      },
      { property: "og:title", content: "Sign in | weave+" },
      {
        property: "og:description",
        content: "Access your linked notes vault, courses and workspace agent.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { next?: string } => {
    const next = search["next"];
    return typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
      ? { next }
      : {};
  },
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup" | "sso">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const { session } = useSession();
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const returnTo = `${typeof window === "undefined" ? "" : window.location.origin}/auth${
    next ? `?next=${encodeURIComponent(next)}` : ""
  }`;

  useEffect(() => {
    if (!session) return;
    if (next) {
      window.location.replace(next);
      return;
    }
    navigate({ to: "/dashboard", replace: true });
  }, [session, navigate, next]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: returnTo,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: returnTo,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed. Try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  }

  async function handleSso(event: React.FormEvent) {
    event.preventDefault();
    const domain = email.split("@")[1]?.trim().toLowerCase();
    if (!domain) {
      toast.error("Enter your work email so we can find your provider.");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithSSO({
        domain,
        options: { redirectTo: returnTo },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      toast.error("No single sign-on provider is set up for that domain yet.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Single sign-on is not available for that domain.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sky-tint px-6 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="font-display text-subheading font-medium text-ink">
          weave+
        </Link>

        <div className="mt-8 rounded-card bg-bone-white p-7">
          {checkEmail ? (
            <div>
              <h1 className="font-display text-heading-sm font-medium text-ink">
                Check your email
              </h1>
              <p className="mt-3 text-body text-graphite">
                We sent a confirmation link to {email}. Open it to finish creating your account,
                then come back and sign in.
              </p>
              <button
                onClick={() => {
                  setCheckEmail(false);
                  setMode("signin");
                }}
                className="mt-6 text-body font-medium text-iris-blue"
              >
                Back to sign in
              </button>
            </div>
          ) : mode === "sso" ? (
            <div>
              <h1 className="font-display text-heading-sm font-medium text-ink">Single sign-on</h1>
              <p className="mt-2 text-body text-graphite">
                Enter your work email and we will send you to your organisation identity provider.
              </p>
              <form onSubmit={handleSso} className="mt-6 flex flex-col gap-4">
                <label className="text-body-sm text-graphite">
                  Work email
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@company.com"
                    className="mt-1.5 w-full rounded-card-sm bg-mist-gray px-4 py-3 text-body text-ink outline-none focus:ring-2 focus:ring-sky-blue/40"
                  />
                </label>
                <FilledButton type="submit" disabled={busy} className="mt-2 w-full">
                  Continue with SSO
                </FilledButton>
              </form>
              <button
                onClick={() => setMode("signin")}
                className="mt-6 text-body-sm text-graphite transition-colors hover:text-ink"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-heading-sm font-medium text-ink">
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="mt-2 text-body text-graphite">
                {mode === "signin"
                  ? "Sign in to reach your notes, courses and agent."
                  : "The first account in a workspace becomes its admin."}
              </p>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={busy}
                className="mt-7 flex min-h-12 w-full items-center justify-center gap-3 rounded-button bg-snow px-6 py-3 text-body font-medium text-void transition-colors hover:bg-off-white disabled:cursor-not-allowed disabled:bg-slate disabled:text-void-canvas"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.27-4.74 3.27-8.09Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="my-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-body-sm text-fog">or</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {mode === "signup" ? (
                  <label className="text-body-sm text-graphite">
                    Full name
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="mt-1.5 w-full rounded-card-sm bg-mist-gray px-4 py-3 text-body text-ink outline-none focus:ring-2 focus:ring-sky-blue/40"
                    />
                  </label>
                ) : null}
                <label className="text-body-sm text-graphite">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1.5 w-full rounded-card-sm bg-mist-gray px-4 py-3 text-body text-ink outline-none focus:ring-2 focus:ring-sky-blue/40"
                  />
                </label>
                <label className="text-body-sm text-graphite">
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="mt-1.5 w-full rounded-card-sm bg-mist-gray px-4 py-3 text-body text-ink outline-none focus:ring-2 focus:ring-sky-blue/40"
                  />
                </label>
                <FilledButton type="submit" disabled={busy} className="mt-2 w-full">
                  {mode === "signin" ? "Sign in" : "Create account"}
                </FilledButton>
              </form>

              <button
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="mt-6 text-body-sm text-graphite transition-colors hover:text-ink"
              >
                {mode === "signin"
                  ? "No account yet? Create one"
                  : "Already have an account? Sign in"}
              </button>

              <div className="mt-4">
                <button
                  onClick={() => setMode("sso")}
                  className="text-body-sm font-medium text-iris-blue transition-opacity hover:opacity-80"
                >
                  Sign in with your organisation (SSO)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
