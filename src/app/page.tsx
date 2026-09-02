"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { FAQS, PLANS } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ThemeToggle, Wordmark } from "@/components/brand";
import { HeroCarousel } from "@/components/marketing/hero-carousel";
import {
  EditorShot,
  ExportShot,
  GenerateShot,
} from "@/components/marketing/feature-shots";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <Hero />
      <Features />
      <Pricing />
      <Faq />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface">
      <div className="mx-auto flex h-15 max-w-280 items-center justify-between gap-4 px-6">
        <Wordmark />
        <nav className="hidden gap-6 text-sm text-t2 md:flex">
          <a href="#features" className="text-t2">
            Features
          </a>
          <a href="#pricing" className="text-t2">
            Pricing
          </a>
          <a href="#faq" className="text-t2">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="secondary" asChild>
            <Link href="/signin">Sign in</Link>
          </Button>
          <Button variant="primary" asChild>
            <Link href="/signup">Start free</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-280 items-center gap-12 px-6 py-12 lg:grid-cols-[1.1fr_1fr] lg:pb-20 lg:pt-24">
      <div className="flex flex-col gap-5">
        <span className="flex w-fit items-center gap-2 rounded-full border border-line px-3 py-[5px] text-[13px] text-t2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Now exporting PDF carousels for LinkedIn
        </span>
        <h1 className="m-0 text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] lg:text-[60px]">
          Turn one idea into an 8&#8209;slide carousel in 40 seconds.
        </h1>
        <p className="m-0 max-w-120 text-[17px] leading-[1.55] text-t2 [text-wrap:pretty]">
          Paste a tweet, a note, or 2,000 words. Slidecast writes the slides,
          applies your brand kit, and exports 1080×1350 PNGs ready for
          Instagram — no canvas wrangling.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="primary" size="lg" asChild>
            <Link href="/signup">Create your first carousel</Link>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/editor">Open the editor</Link>
          </Button>
        </div>
        <p className="m-0 text-[13px] text-t3">
          Free plan: 5 carousels a month. No card required.
        </p>
      </div>
      <HeroCarousel />
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="border-t border-line bg-shell">
      <div className="mx-auto flex max-w-280 flex-col gap-20 px-6 py-14 lg:py-24">
        <FeatureRow
          eyebrow="Generate"
          title="From a 280‑character tweet to 8 slides, drafted while you watch."
          body="Pick a tone, set a slide count between 5 and 10, and hit Generate. Slides stream in one at a time — hook, three to seven points, and a CTA slide with your handle."
          shot={<GenerateShot />}
        />
        <FeatureRow
          eyebrow="Edit"
          title="An editor with three tabs, not three hundred menus."
          body="Double‑click any text on the canvas to rewrite it. Drag slides to reorder. Switch between 20 templates without losing a word. Arrow keys move between slides; ⌘S saves — though it already did."
          shot={<EditorShot />}
          reversed
        />
        <FeatureRow
          eyebrow="Export"
          title="PNG at 1080×1350, PDF for LinkedIn, or straight to Buffer."
          body="One click downloads a .zip with every slide numbered. Story size (1080×1920) reflows text automatically. Agencies schedule to client accounts without leaving the editor."
          shot={<ExportShot />}
        />
      </div>
    </section>
  );
}

function FeatureRow({
  eyebrow,
  title,
  body,
  shot,
  reversed,
}: {
  eyebrow: string;
  title: string;
  body: string;
  shot: React.ReactNode;
  reversed?: boolean;
}) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <div
        className={cn(
          "flex min-w-0 flex-col gap-3",
          reversed && "lg:order-2",
        )}
      >
        <span className="text-[13px] font-medium text-accent">{eyebrow}</span>
        <h2 className="m-0 text-[32px] font-semibold leading-tight">{title}</h2>
        <p className="m-0 leading-[1.55] text-t2 [text-wrap:pretty]">{body}</p>
      </div>
      <div className={cn("min-w-0", reversed && "lg:order-1")}>{shot}</div>
    </div>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="border-t border-line">
      <div className="mx-auto flex max-w-280 flex-col gap-10 px-6 py-14 lg:py-24">
        <div className="flex max-w-130 flex-col gap-2">
          <h2 className="m-0 text-[32px] font-semibold leading-tight">
            Pricing
          </h2>
          <p className="m-0 leading-[1.55] text-t2">
            Billed monthly. Cancel any time. Prices in EUR, VAT added at
            checkout.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col gap-5 rounded-card border bg-surface p-6",
                plan.popular ? "border-accent" : "border-line",
              )}
            >
              {plan.popular ? (
                <span className="absolute -top-[11px] left-6 rounded-full bg-accent px-2.5 py-[3px] text-xs font-medium text-accent-fg">
                  Most popular
                </span>
              ) : null}
              <div className="flex flex-col gap-1.5">
                <span className="font-medium">{plan.name}</span>
                <span className="flex items-baseline gap-1">
                  <span className="text-[32px] font-semibold tracking-[-0.02em]">
                    {plan.price}
                  </span>
                  <span className="text-[13px] text-t3">{plan.per}</span>
                </span>
                <span className="text-[13px] text-t2">{plan.desc}</span>
              </div>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check
                      size={16}
                      strokeWidth={2}
                      className="mt-0.5 flex-none text-t2"
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.popular ? "primary" : "secondary"}
                className="mt-auto h-10 w-full"
                asChild
              >
                <Link href="/signup">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="border-t border-line bg-shell">
      <div className="mx-auto grid max-w-280 gap-12 px-6 py-14 lg:grid-cols-[1fr_2fr] lg:py-24">
        <h2 className="m-0 text-[32px] font-semibold leading-tight">
          Questions
        </h2>
        <div className="flex flex-col">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="border-b border-line">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 border-0 bg-transparent py-[18px] text-left text-[15px] font-medium text-t1 transition-colors duration-150 ease-out hover:text-accent"
                >
                  <span>{f.q}</span>
                  <ChevronDown
                    size={16}
                    strokeWidth={1.5}
                    className="flex-none text-t3 transition-transform duration-200 ease-out"
                    style={{ transform: `rotate(${isOpen ? 180 : 0}deg)` }}
                  />
                </button>
                {isOpen ? (
                  <p className="anim-fade m-0 max-w-140 pb-[18px] leading-[1.55] text-t2">
                    {f.a}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-280 flex-wrap items-center justify-between gap-6 px-6 py-10 text-[13px] text-t3">
        <div className="flex items-center gap-2.5 font-semibold text-t1">
          <span className="h-[18px] w-[18px] rounded-[5px] bg-accent" />
          Slidecast
          <span className="ml-2 font-normal text-t3">
            © 2026 Slidecast GmbH, Berlin
          </span>
        </div>
        <div className="flex flex-wrap gap-5">
          <a href="#features" className="text-t3">
            Features
          </a>
          <a href="#pricing" className="text-t3">
            Pricing
          </a>
          <a href="#faq" className="text-t3">
            FAQ
          </a>
          <Link href="/settings" className="text-t3">
            Privacy
          </Link>
          <Link href="/settings" className="text-t3">
            Imprint
          </Link>
        </div>
      </div>
    </footer>
  );
}
