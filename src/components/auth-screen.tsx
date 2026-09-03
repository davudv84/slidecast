"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DEFAULT_PROFILE, FONTS, SEED_SLIDES, TEMPLATES } from "@/lib/data";
import { stripRich } from "@/lib/rich-text";
import { Button } from "./ui/button";
import { Field, Input } from "./ui/input";
import { Wordmark } from "./brand";

const VISUAL_SLIDES = [1, 5, 10].map((templateId, i) => ({
  template: TEMPLATES[templateId],
  headline: stripRich(SEED_SLIDES[[0, 6, 7][i]][1]),
  offset: i === 1 ? -40 : 0,
}));

export function AuthScreen({ mode }: { mode: "signin" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isSignIn = mode === "signin";

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (busy) return;
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (!isSignIn && password.length < 8) {
      setError("Passwords need at least 8 characters.");
      return;
    }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      router.push("/dashboard");
    }, 900);
  };

  const google = () => {
    if (busy) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      router.push("/dashboard");
    }, 900);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex min-h-screen flex-col p-6 sm:p-8">
        <Wordmark />
        <div className="anim-fade m-auto flex w-full max-w-90 flex-col gap-6 py-10">
          <div className="flex flex-col gap-1.5">
            <h1 className="m-0 text-2xl font-semibold">
              {isSignIn ? "Welcome back" : "Create your account"}
            </h1>
            <p className="m-0 text-t2">
              {isSignIn
                ? "Sign in to your Slidecast workspace."
                : "Free plan, no card. Upgrade when you outgrow it."}
            </p>
          </div>

          <Button variant="secondary" className="h-10" onClick={google} disabled={busy}>
            <GoogleMark />
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 text-[13px] text-t3">
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>

          <form className="flex flex-col gap-3.5" onSubmit={submit} noValidate>
            <Field label="Email">
              <Input
                type="email"
                autoComplete="email"
                placeholder="you@studio.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                autoComplete={isSignIn ? "current-password" : "new-password"}
                placeholder="8+ characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
              />
            </Field>
            {error ? (
              <p className="anim-fade m-0 text-[13px] text-danger" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" variant="primary" className="h-10" loading={busy}>
              {busy ? "Signing in…" : isSignIn ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="m-0 text-center text-[13px] text-t2">
            {isSignIn ? "New to Slidecast?" : "Already have an account?"}{" "}
            <Link href={isSignIn ? "/signup" : "/signin"} className="font-medium text-accent">
              {isSignIn ? "Create an account" : "Sign in"}
            </Link>
          </p>
        </div>
        <p className="m-0 text-xs text-t3">
          By continuing you agree to the Terms and Privacy Policy.
        </p>
      </div>

      <div className="relative hidden place-items-center overflow-hidden bg-inv p-12 lg:grid">
        <div className="flex gap-4" style={{ transform: "rotate(-6deg) scale(1.05)" }}>
          {VISUAL_SLIDES.map(({ template, headline, offset }, i) => (
            <div
              key={i}
              className="flex flex-col justify-end rounded-lg p-[22px] text-xl font-semibold leading-none tracking-[-0.03em] [text-wrap:pretty]"
              style={{
                width: 220,
                aspectRatio: "1080 / 1350",
                background: template.bg,
                color: template.fg,
                fontFamily: FONTS[template.font],
                marginTop: offset,
              }}
            >
              {headline}
            </div>
          ))}
        </div>
        <p className="absolute bottom-8 left-12 right-12 m-0 max-w-105 text-sm leading-normal text-inv-t opacity-70">
          &ldquo;I ghostwrite for six founders. Slidecast cut my Tuesday carousel batch
          from four hours to fifty minutes.&rdquo; — {DEFAULT_PROFILE.name}, Reyes Studio
        </p>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" />
      <path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1A10 10 0 0 0 2 12c0 1.6.4 3.1 1.1 4.6L6.4 14z" />
      <path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.3 3-4 5.6-4z" />
    </svg>
  );
}
