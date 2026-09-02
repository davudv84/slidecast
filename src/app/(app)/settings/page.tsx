"use client";

import { useEffect, useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { ACCENT_OPTIONS, DEFAULT_BRAND, INVOICES, PLAN_USAGE } from "@/lib/data";
import { normalizeHex } from "@/lib/color";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Badge, Meter, Switch } from "@/components/ui/misc";
import { LogoUploader } from "@/components/logo-uploader";
import { BrandColors } from "@/components/brand-colors";
import { initials } from "@/lib/initials";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "brand", label: "Brand kit" },
  { id: "billing", label: "Billing" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div className="anim-fade">
      <div className="sticky top-0 z-5 flex items-center gap-3 border-b border-line bg-surface px-4 py-3 sm:px-6">
        <h1 className="m-0 text-xl font-semibold">Settings</h1>
      </div>

      <div className="grid max-w-260 gap-6 p-4 sm:p-6 lg:grid-cols-[180px_1fr] lg:gap-8">
        <div className="flex flex-row gap-0.5 self-start lg:flex-col">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? "true" : undefined}
              className={cn(
                "h-[34px] cursor-pointer rounded-control border-0 px-2.5 text-left text-sm font-medium transition-colors duration-150 ease-out hover:bg-hover",
                tab === t.id ? "bg-hover text-t1" : "bg-transparent text-t2",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          {tab === "profile" ? <ProfileCards /> : null}
          {tab === "brand" ? <BrandCard /> : null}
          {tab === "billing" ? <BillingCards /> : null}
        </div>
      </div>
    </div>
  );
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-card border border-line bg-surface p-4 sm:p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="m-0 text-base font-semibold tracking-[-0.01em]">{children}</h2>;
}

/* ---------------------------------------------------------------- profile */

function ProfileCards() {
  const app = useApp();
  const [name, setName] = useState(app.profile.name);
  const [email, setEmail] = useState(app.profile.email);
  const [customAccent, setCustomAccent] = useState(app.accent);

  useEffect(() => {
    setName(app.profile.name);
    setEmail(app.profile.email);
  }, [app.profile.name, app.profile.email]);

  useEffect(() => setCustomAccent(app.accent), [app.accent]);

  const dirty = name !== app.profile.name || email !== app.profile.email;

  const save = () => {
    if (!name.trim()) {
      app.toast("Add a name so your slides can sign off.");
      return;
    }
    app.updateProfile({ name: name.trim(), email: email.trim() });
    app.toast("Profile saved");
  };

  return (
    <>
      <Card className="anim-fade">
        <SectionTitle>Profile</SectionTitle>
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-inv text-lg font-semibold text-inv-t">
            {initials(name)}
          </span>
          <span className="text-[13px] text-t2">
            Initials come from your name — no photo needed.
          </span>
        </div>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Full name">
            <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </Field>
          <Field label="Email">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
            />
          </Field>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-sm">
            <Switch
              checked={app.theme === "dark"}
              onCheckedChange={app.toggleTheme}
              ariaLabel="Dark mode"
            />
            Dark mode
          </div>
          <Button variant="primary" onClick={save} disabled={!dirty}>
            Save changes
          </Button>
        </div>
      </Card>

      <Card className="anim-fade">
        <SectionTitle>Accent colour</SectionTitle>
        <p className="m-0 text-[13px] text-t2">
          Used for primary buttons, active states and the selected slide. Nothing else is coloured.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {ACCENT_OPTIONS.map((hex) => {
            const on = app.accent.toUpperCase() === hex.toUpperCase();
            return (
              <button
                key={hex}
                type="button"
                aria-label={`Accent ${hex}`}
                aria-pressed={on}
                onClick={() => app.setAccent(hex)}
                className={cn(
                  "grid h-9 w-9 cursor-pointer place-items-center rounded-control border-2 transition-colors duration-150 ease-out",
                  on ? "border-t1" : "border-line hover:border-t3",
                )}
                style={{ background: hex }}
              >
                {on ? <Check size={16} strokeWidth={2.5} style={{ color: "var(--accent-fg)" }} /> : null}
              </button>
            );
          })}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const hex = normalizeHex(customAccent);
              if (!hex) {
                app.toast("Enter a hex colour like #0F766E.");
                return;
              }
              app.setAccent(hex);
              app.toast("Accent updated");
            }}
            className="flex items-center gap-1 rounded-control border border-line pl-1.5 pr-1 transition-colors duration-150 ease-out focus-within:border-accent"
          >
            <input
              type="color"
              value={normalizeHex(customAccent) ?? app.accent}
              onChange={(e) => setCustomAccent(e.target.value.toUpperCase())}
              aria-label="Custom accent"
              className="h-6 w-6 cursor-pointer appearance-none rounded-[4px] border-0 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-[4px] [&::-webkit-color-swatch]:border-0"
            />
            <input
              value={customAccent}
              onChange={(e) => setCustomAccent(e.target.value)}
              aria-label="Custom accent hex"
              spellCheck={false}
              className="h-8 w-[84px] border-0 bg-transparent font-mono text-[12px] text-t1 outline-none"
            />
            <Button type="submit" variant="ghost" size="sm" className="h-7 px-2">
              Apply
            </Button>
          </form>
        </div>
      </Card>

      <Card className="anim-fade">
        <SectionTitle>Workspace</SectionTitle>
        <p className="m-0 text-[13px] text-t2">
          Everything here is stored in this browser. Reset to start over with the sample carousels.
        </p>
        <div>
          <Button
            variant="danger"
            size="sm"
            onClick={() =>
              app.requestConfirm({
                title: "Reset workspace?",
                body: `All ${app.docs.length} carousels, your brand kit and presets will be replaced with the sample data.`,
                cta: "Reset workspace",
                run: app.resetWorkspace,
              })
            }
          >
            Reset to sample data
          </Button>
        </div>
      </Card>
    </>
  );
}

/* ------------------------------------------------------------------ brand */

function BrandCard() {
  const app = useApp();

  const removeBrandKit = () =>
    app.requestConfirm({
      title: "Remove brand kit?",
      body: `The “${app.brand.name || "Untitled"}” brand kit — logo, ${app.brand.handle}, and ${app.brand.colors.length} colours — will be removed from all carousels.`,
      cta: "Remove brand kit",
      run: () => {
        app.updateBrand({ name: "", handle: "@yourhandle", colors: [], logo: null, logoName: null });
        app.cancelConfirm();
        app.toast("Brand kit removed", () => app.updateBrand(DEFAULT_BRAND));
      },
    });

  return (
    <Card className="anim-fade">
      <div className="flex items-center justify-between gap-3">
        <SectionTitle>Brand kit</SectionTitle>
        <Button variant="danger" size="sm" onClick={removeBrandKit}>
          Remove brand kit
        </Button>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Brand or studio name">
          <Input
            value={app.brand.name}
            onChange={(e) => app.updateBrand({ name: e.target.value })}
            placeholder="Reyes Studio"
          />
        </Field>
        <Field label="Instagram handle" hint="Printed in the footer of every slide.">
          <Input
            value={app.brand.handle}
            onChange={(e) => app.updateBrand({ handle: e.target.value })}
            placeholder="@yourhandle"
            spellCheck={false}
          />
        </Field>
      </div>

      <LogoUploader />

      <div className="flex flex-col gap-2 text-[13px] text-t2">
        Brand colours
        <BrandColors />
      </div>

      <div className="flex flex-col gap-2 text-[13px] text-t2">
        Saved presets
        {app.presets.length === 0 ? (
          <span className="text-t3">
            Save a look from the editor’s Brand tab and it appears here.
          </span>
        ) : (
          <div className="grid gap-2 sm:grid-cols-3">
            {app.presets.map((p) => (
              <div
                key={p.id}
                className="group relative flex flex-col gap-1.5 rounded-control border border-line p-2.5 text-t1"
              >
                <div className="flex gap-1">
                  <span className="h-3.5 w-3.5 rounded-[3px] border border-line" style={{ background: p.a }} />
                  <span className="h-3.5 w-3.5 rounded-[3px] border border-line" style={{ background: p.b }} />
                </div>
                <span className="truncate font-medium">{p.name}</span>
                <span className="text-xs text-t3">{p.fontLabel}</span>
                <button
                  type="button"
                  aria-label={`Delete preset ${p.name}`}
                  onClick={() => app.deletePreset(p.id)}
                  className="absolute right-1.5 top-1.5 grid h-6 w-6 cursor-pointer place-items-center rounded-[4px] text-t3 opacity-0 transition-opacity duration-150 ease-out hover:bg-hover hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <Trash2 size={13} strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------------- billing */

function BillingCards() {
  const app = useApp();
  return (
    <div className="anim-fade flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="gap-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold tracking-[-0.01em]">{PLAN_USAGE.plan}</span>
            <Badge>Active</Badge>
          </div>
          <span className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold tracking-[-0.02em]">€29</span>
            <span className="text-[13px] text-t3">/ month · renews {PLAN_USAGE.renews}</span>
          </span>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" size="sm" onClick={() => app.toast("Agency plan: we’ll email you a quote")}>
              Upgrade to Agency
            </Button>
            <Button variant="secondary" size="sm" onClick={() => app.toast("Billing portal opens in a new tab")}>
              Manage
            </Button>
          </div>
        </Card>

        <Card className="gap-3">
          <span className="text-base font-semibold tracking-[-0.01em]">Usage</span>
          <div className="flex justify-between text-sm">
            <span className="text-t2">Carousels this month</span>
            <span className="font-medium">
              {PLAN_USAGE.used} / {PLAN_USAGE.quota}
            </span>
          </div>
          <Meter percent={(PLAN_USAGE.used / PLAN_USAGE.quota) * 100} className="h-1.5" />
          <span className="text-[13px] text-t3">
            Resets in 30 days. Exports and AI generations are unlimited on Pro.
          </span>
        </Card>
      </div>

      <div className="overflow-hidden rounded-card border border-line bg-surface">
        <div className="border-b border-line px-4 py-4 text-base font-semibold tracking-[-0.01em] sm:px-5">
          Invoices
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-130 border-collapse text-sm">
            <thead>
              <tr className="text-left text-[13px] text-t3">
                {["Invoice", "Date", "Amount", "Status", ""].map((h, i) => (
                  <th key={i} className="border-b border-line px-5 py-2.5 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv) => (
                <tr key={inv.id} className="transition-colors duration-150 ease-out hover:bg-hover">
                  <td className="border-b border-line px-5 py-3 font-medium">{inv.id}</td>
                  <td className="border-b border-line px-5 py-3 text-t2">{inv.date}</td>
                  <td className="border-b border-line px-5 py-3">{inv.amount}</td>
                  <td className="border-b border-line px-5 py-3">
                    <Badge>{inv.status}</Badge>
                  </td>
                  <td className="border-b border-line px-5 py-3 text-right">
                    <Button
                      variant="secondary"
                      size="iconSm"
                      className="w-auto px-2.5"
                      onClick={() => app.toast(`Downloading ${inv.id}.pdf`)}
                    >
                      PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
