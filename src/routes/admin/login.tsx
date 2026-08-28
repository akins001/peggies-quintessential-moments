import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Lock, MailCheck } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Sign In | Peggies Events" },
      {
        name: "description",
        content:
          "Secure sign-in for the Peggies Events studio team to manage the portfolio gallery and founder portrait.",
      },
      { property: "og:title", content: "Admin Sign In | Peggies Events" },
      {
        property: "og:description",
        content: "Private studio access for the Peggies Events team.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError("We could not sign you in. Check the email and password and try again.");
      setBusy(false);
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user?.id ?? "",
      _role: "admin",
    });
    if (!isAdmin) {
      await supabase.auth.signOut();
      setError("This account is not approved for studio access.");
      setBusy(false);
      return;
    }
    navigate({ to: "/admin", replace: true });
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (resetError) {
      setError("We could not send the reset link. Please try again shortly.");
      return;
    }
    setNotice("If that email has studio access, a password reset link is on its way.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-espresso px-5 py-16 text-cream">
      <div className="w-full max-w-md">
        <div className="text-center">
          <p className="eyebrow text-champagne">Peggies Exclusive Events</p>
          <h1 className="mt-5 font-display text-4xl leading-tight text-cream">Studio Access</h1>
          <div className="rule-gold mx-auto mt-6 h-px w-20" />
          <p className="mt-6 text-sm leading-relaxed text-cream/70">
            {mode === "signin"
              ? "Sign in to manage the portfolio gallery and founder portrait."
              : "Enter your studio email and we will send a password reset link."}
          </p>
        </div>

        <form
          onSubmit={mode === "signin" ? handleSignIn : handleReset}
          className="mt-10 space-y-5 border border-champagne/25 bg-cream/5 p-7"
        >
          <div>
            <label
              htmlFor="email"
              className="eyebrow block text-champagne/80"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-3 w-full border border-champagne/30 bg-espresso/60 px-4 py-3 text-sm text-cream outline-none placeholder:text-cream/40 focus:border-champagne"
              placeholder="you@peggiesevents.com"
            />
          </div>

          {mode === "signin" && (
            <div>
              <label htmlFor="password" className="eyebrow block text-champagne/80">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-3 w-full border border-champagne/30 bg-espresso/60 px-4 py-3 text-sm text-cream outline-none placeholder:text-cream/40 focus:border-champagne"
                placeholder="••••••••"
              />
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm leading-relaxed text-red-300">
              {error}
            </p>
          )}
          {notice && (
            <p className="flex items-start gap-2 text-sm leading-relaxed text-champagne">
              <MailCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 bg-accent px-8 py-4 text-xs tracking-[0.22em] uppercase text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Lock className="h-4 w-4" aria-hidden="true" />
            )}
            {mode === "signin" ? "Sign in" : "Send reset link"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "reset" : "signin");
              setError(null);
              setNotice(null);
            }}
            className="w-full text-xs tracking-[0.16em] uppercase text-champagne/70 underline-offset-4 transition-colors hover:text-champagne hover:underline"
          >
            {mode === "signin" ? "Forgot your password?" : "Back to sign in"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs leading-relaxed text-cream/50">
          Studio accounts are created by invitation only.{" "}
          <Link to="/" className="underline-offset-4 hover:underline">
            Return to the website
          </Link>
        </p>
      </div>
    </div>
  );
}
