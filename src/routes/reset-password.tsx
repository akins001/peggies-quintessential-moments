import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a New Password | Peggies Events" },
      {
        name: "description",
        content: "Choose a new password for your Peggies Events studio account.",
      },
      { property: "og:title", content: "Set a New Password | Peggies Events" },
      {
        property: "og:description",
        content: "Choose a new password for your Peggies Events studio account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    void supabase.auth.getSession().then(({ data: session }) => {
      if (session.session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Please choose a password of at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
    setTimeout(() => navigate({ to: "/admin", replace: true }), 1200);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-espresso px-5 py-16 text-cream">
      <div className="w-full max-w-md">
        <div className="text-center">
          <p className="eyebrow text-champagne">Peggies Exclusive Events</p>
          <h1 className="mt-5 font-display text-4xl leading-tight">New Password</h1>
          <div className="rule-gold mx-auto mt-6 h-px w-20" />
        </div>

        {done ? (
          <p className="mt-10 border border-champagne/25 bg-cream/5 p-7 text-center text-sm leading-relaxed text-champagne">
            Your password has been updated. Taking you to the studio&hellip;
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-10 space-y-5 border border-champagne/25 bg-cream/5 p-7"
          >
            {!ready && (
              <p className="text-sm leading-relaxed text-cream/70">
                Open this page from the reset link in your email to continue.
              </p>
            )}
            <div>
              <label htmlFor="password" className="eyebrow block text-champagne/80">
                New password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-3 w-full border border-champagne/30 bg-espresso/60 px-4 py-3 text-sm text-cream outline-none focus:border-champagne"
              />
            </div>
            <div>
              <label htmlFor="confirm" className="eyebrow block text-champagne/80">
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-3 w-full border border-champagne/30 bg-espresso/60 px-4 py-3 text-sm text-cream outline-none focus:border-champagne"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm leading-relaxed text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy || !ready}
              className="inline-flex w-full items-center justify-center gap-2 bg-accent px-8 py-4 text-xs tracking-[0.22em] uppercase text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Update password
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-xs tracking-[0.16em] uppercase text-cream/50">
          <Link to="/admin/login" className="underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
