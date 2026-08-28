import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Menu,
  X,
  Phone,
  MessageCircle,
  MapPin,
  Mail,
  Instagram,
  ArrowRight,
} from "lucide-react";

import heroBallroom from "@/assets/hero-ballroom.jpg";
import packagesArt from "@/assets/peggies-packages.jpg.asset.json";
import { GalleryLightbox } from "@/components/GalleryLightbox";
import { GALLERY_ITEMS, galleryAlt, getFeaturedItems } from "@/lib/gallery";

const PHONE_DISPLAY = "0913 415 3272";
const PHONE_TEL = "+2349134153272";
const WHATSAPP_MESSAGE = `Hello Peggies Events,
I’m interested in your event planning and decoration services.
Please send me your packages, pricing, and consultation details.
Thank you.`;
const WHATSAPP = `https://wa.me/2349134153272?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

const NAV = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Celebrations", href: "#celebrations" },
  { label: "Packages", href: "#packages" },
  { label: "Founder", href: "#founder" },
  { label: "Contact", href: "#contact" },
];

const SERVICES = [
  {
    title: "Event Planning & Coordination",
    copy: "End-to-end planning, vendor curation and day-of coordination handled with quiet precision.",
  },
  {
    title: "Event Decoration",
    copy: "Draping, florals, staging and lighting composed into one considered visual language.",
  },
  {
    title: "Weddings",
    copy: "Traditional and white weddings produced from first concept sketch to final send-off.",
  },
  {
    title: "Engagements & Proposals",
    copy: "Intimate, cinematic settings designed for the moment before the celebration.",
  },
  {
    title: "Bridal & Baby Showers",
    copy: "Softly styled gatherings with bespoke installations, dessert tables and keepsakes.",
  },
  {
    title: "Birthdays",
    copy: "Milestone birthdays with a distinct theme, refined palette and full production.",
  },
  {
    title: "Social Events",
    copy: "Anniversaries, homecomings and private soirées staged with understated luxury.",
  },
  {
    title: "Corporate Events",
    copy: "Launches, conferences and award nights aligned to your brand and its standards.",
  },
  {
    title: "Dinners & Festivals",
    copy: "Gala dinners and large-format festivals managed with logistics-first discipline.",
  },
];

const PACKAGES = [
  {
    name: "Economical",
    copy: "A minimalist wedding stage with standing flowers, simple curtains and a carpeted path.",
  },
  {
    name: "Elegant",
    copy: "Full set wedding decoration with backdrop, photo booth, carpet and luxurious lighting.",
  },
  {
    name: "Premium",
    copy: "Complete decoration from ceremony to reception with fresh flowers and artistic lighting.",
  },
  {
    name: "Intimate Wedding",
    copy: "Elevated design for a small family wedding: stage, backdrop, entrance and photo booth.",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Peggies Events | Luxury Event Planning & Decor in Abuja" },
      {
        name: "description",
        content:
          "Peggies Exclusive Events crafts quintessential, magical moments — full-service planning, production and high-end decoration for weddings, galas and corporate events in Abuja.",
      },
      { property: "og:title", content: "Peggies Events | Luxury Event Planning & Decor in Abuja" },
      {
        property: "og:description",
        content:
          "Crafting Quintessential, Magical Moments. Comprehensive planning, production and luxury decoration for weddings, corporate functions and gala dinners in Abuja.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <Hero />
        <IntroProof />
        <Services />
        <Celebrations />
        <Packages />
        <Founder />
        <Contact />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 lg:px-8">
        <a href="#top" className="min-w-0">
          <span className="block font-display text-2xl leading-none tracking-wide text-primary">
            Peggies Events
          </span>
          <span className="eyebrow mt-1 block truncate text-muted-foreground">
            Exclusive Events &middot; Abuja
          </span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm tracking-wide text-muted-foreground transition-colors hover:text-accent-foreground"
            >
              {item.label}
            </a>
          ))}
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 border border-accent bg-accent px-5 py-2.5 text-xs tracking-[0.2em] uppercase text-accent-foreground transition-colors hover:bg-transparent hover:text-primary"
          >
            Book a date
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="shrink-0 border border-border p-2 text-primary lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-5 pb-6 pt-2 lg:hidden">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block border-b border-border/60 py-3 text-sm tracking-wide text-muted-foreground"
            >
              {item.label}
            </a>
          ))}
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noreferrer"
            className="mt-5 block bg-accent px-5 py-3 text-center text-xs tracking-[0.2em] uppercase text-accent-foreground"
          >
            Book a date
          </a>
        </nav>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative isolate">
      <img
        src={heroBallroom}
        alt="Cream and gold draped ballroom with chandeliers and floral centrepieces styled by Peggies Events"
        width={1920}
        height={1280}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-espresso/70" />
      <div className="relative mx-auto flex min-h-[88vh] max-w-4xl flex-col items-center justify-center px-5 py-24 text-center">
        <p className="eyebrow text-champagne">Peggies Exclusive Events &middot; Abuja, Nigeria</p>
        <div className="rule-gold mt-6 h-px w-24" />
        <h1 className="mt-8 font-display text-4xl leading-[1.08] text-cream sm:text-6xl lg:text-7xl">
          Crafting Quintessential,
          <span className="block italic text-champagne">Magical Moments.</span>
        </h1>
        <p className="mt-8 max-w-2xl text-base leading-relaxed text-cream/85 sm:text-lg">
          Peggies Events transforms milestone occasions into unforgettable, meticulously curated
          experiences — comprehensive planning, production and high-end decoration for weddings,
          corporate functions, gala dinners and luxury social celebrations.
        </p>
        <div className="mt-11 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 bg-accent px-8 py-4 text-xs tracking-[0.22em] uppercase text-accent-foreground transition-opacity hover:opacity-90 sm:w-auto"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            WhatsApp us
          </a>
          <a
            href={`tel:${PHONE_TEL}`}
            className="inline-flex w-full items-center justify-center gap-2 border border-champagne/60 px-8 py-4 text-xs tracking-[0.22em] uppercase text-cream transition-colors hover:bg-cream/10 sm:w-auto"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {PHONE_DISPLAY}
          </a>
        </div>
      </div>
    </section>
  );
}

function IntroProof() {
  const stats = [
    { value: "Since 2016", label: "Designing celebrations" },
    { value: "300+", label: "Events produced" },
    { value: "Certified", label: "Event professional" },
    { value: "Abuja", label: "& destination-ready" },
  ];

  return (
    <section id="about" className="scroll-mt-24 border-b border-border bg-secondary/60">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div>
            <p className="eyebrow text-muted-foreground">The House of Peggies</p>
            <h2 className="mt-6 font-display text-3xl leading-tight sm:text-4xl lg:text-5xl">
              Luxurious decor, thoughtfully composed — and honestly priced.
            </h2>
          </div>
          <div className="space-y-6 text-base leading-relaxed text-muted-foreground">
            <p>
              We are a full-service planning and design firm for clients who care about restraint as
              much as grandeur. Every commission begins with your story, then moves through concept,
              styling, production schedules, vendor management and flawless on-site execution.
            </p>
            <p>
              From an intimate proposal to a thousand-guest gala, the standard never changes: a
              considered palette, immaculate finishing and a team that stays until the last light is
              switched off.
            </p>
          </div>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-y-10 border-t border-border pt-12 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="px-1">
              <dt className="font-display text-3xl text-primary lg:text-4xl">{s.value}</dt>
              <dd className="eyebrow mt-3 text-muted-foreground">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="scroll-mt-24 border-b border-border">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <p className="eyebrow text-accent">Service Offering</p>
          <h2 className="mt-6 font-display text-3xl leading-tight sm:text-4xl lg:text-5xl">
            Everything the occasion asks for.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            Engage us for the full production or for a single, beautifully executed element.
          </p>
        </div>

        <ul className="mt-14 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => (
            <li key={service.title} className="bg-card p-8 transition-colors hover:bg-secondary/70">
              <span className="font-display text-sm text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-2xl leading-snug text-primary">
                {service.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{service.copy}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Celebrations() {
  const featured = getFeaturedItems(7);
  const [active, setActive] = useState<number | null>(null);
  const totalCount = GALLERY_ITEMS.length;

  return (
    <section
      id="celebrations"
      className="scroll-mt-24 border-b border-border bg-espresso text-cream"
    >
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow text-champagne">Featured Celebrations</p>
            <h2 className="mt-6 font-display text-3xl leading-tight text-cream sm:text-4xl lg:text-5xl">
              A portfolio in cream, gold and candlelight.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-cream/70">
            A curated preview of recent commissions — the full collection of {totalCount}{" "}
            celebrations lives in the gallery.
          </p>
        </div>

        {/* Compact masonry preview: only featured items render here. */}
        <div className="mt-14 columns-2 gap-3 sm:gap-4 lg:columns-3 [&>*]:mb-3 sm:[&>*]:mb-4">
          {featured.map((item, i) => (
            <figure key={item.id} className="break-inside-avoid">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View ${item.title}`}
                className="group block w-full overflow-hidden border border-champagne/25 bg-cream/5 text-left"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={galleryAlt(item)}
                    width={1024}
                    height={1280}
                    loading="lazy"
                    className={`w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] ${
                      i % 3 === 0 ? "aspect-[4/5]" : "aspect-square"
                    }`}
                  />
                ) : (
                  <span className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 px-6 text-center">
                    <span className="font-display text-4xl text-champagne/50">P</span>
                    <span className="eyebrow text-champagne/70">Coming soon</span>
                  </span>
                )}
                <span className="block px-3 py-3">
                  <span className="block truncate font-display text-lg text-cream sm:text-xl">
                    {item.title}
                  </span>
                  <span className="eyebrow mt-1 block truncate text-champagne/70">
                    {item.category}
                  </span>
                </span>
              </button>
            </figure>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Link
            to="/gallery"
            className="inline-flex w-full items-center justify-center gap-2 bg-accent px-8 py-4 text-xs tracking-[0.22em] uppercase text-accent-foreground transition-opacity hover:opacity-90 sm:w-auto"
          >
            View full gallery
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="text-xs tracking-[0.14em] uppercase text-cream/50">
            {totalCount} celebrations &amp; growing
          </p>
        </div>
      </div>

      <GalleryLightbox
        items={featured}
        index={active}
        onClose={() => setActive(null)}
        onChange={setActive}
      />
    </section>
  );
}

function Packages() {
  return (
    <section id="packages" className="scroll-mt-24 border-b border-border">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-20">
          <figure>
            <img
              src={packagesArt.url}
              alt="Peggies Events package card listing the Economical, Elegant, Premium and Intimate Wedding decoration packages"
              loading="lazy"
              className="w-full border border-border shadow-[0_24px_60px_-30px_oklch(0.29_0.045_45/0.5)]"
            />
            <figcaption className="eyebrow mt-4 text-muted-foreground">
              Current decoration packages
            </figcaption>
          </figure>

          <div>
            <p className="eyebrow text-accent">Packages</p>
            <h2 className="mt-6 font-display text-3xl leading-tight sm:text-4xl lg:text-5xl">
              Four ways to begin.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Each package is a starting point — every detail is tailored to your venue, guest count
              and palette. Bespoke proposals are prepared on request.
            </p>

            <ul className="mt-10 divide-y divide-border border-y border-border">
              {PACKAGES.map((p) => (
                <li
                  key={p.name}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-6 py-6"
                >
                  <div className="min-w-0">
                    <h3 className="font-display text-2xl text-primary">{p.name} Package</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.copy}</p>
                  </div>
                  <span className="shrink-0 font-display text-2xl text-accent">{p.price}</span>
                </li>
              ))}
            </ul>

            <a
              href={WHATSAPP}
              target="_blank"
              rel="noreferrer"
              className="mt-10 inline-flex items-center gap-2 bg-primary px-8 py-4 text-xs tracking-[0.22em] uppercase text-primary-foreground transition-opacity hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Request a quote
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Founder() {
  return (
    <section id="founder" className="scroll-mt-24 border-b border-border bg-secondary/60">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            {/* Headshot placeholder — swap this block for an <img> of Peggy Adugba. */}
            <div className="arch relative mx-auto flex aspect-[4/5] w-full max-w-sm flex-col items-center justify-center gap-4 border border-accent/40 bg-cream px-8 text-center">
              <span className="font-display text-6xl text-accent/60">PA</span>
              <span className="eyebrow text-muted-foreground">Portrait coming soon</span>
              <span className="text-xs leading-relaxed text-muted-foreground/80">
                Reserved for Peggy Adugba&rsquo;s headshot
              </span>
              <span className="rule-gold absolute bottom-8 left-1/2 h-px w-16 -translate-x-1/2" />
            </div>
          </div>

          <div>
            <p className="eyebrow text-accent">Founder&rsquo;s Story</p>
            <h2 className="mt-6 font-display text-3xl leading-tight sm:text-4xl lg:text-5xl">
              Peggy Adugba
              <span className="mt-2 block font-sans text-xs tracking-[0.28em] uppercase text-muted-foreground">
                Founder &amp; Lead Designer
              </span>
            </h2>
            <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground">
              <p>
                Peggy is a certified event professional based in Abuja, driven by one pursuit: to
                translate a client&rsquo;s vision into what she calls{" "}
                <em className="font-display text-lg text-primary not-italic">
                  &ldquo;The Quintessential Magical Experience.&rdquo;
                </em>
              </p>
              <p>
                She leads every event personally — from the first concept conversation through
                sourcing, setup and execution — so nothing is left to interpretation. Her clients
                describe the result as calm on the day and unforgettable afterwards.
              </p>
              <p>
                Her longer-term vision is to establish Peggies Events centres globally, bringing the
                same standard of design and hospitality to celebrations far beyond Abuja.
              </p>
            </div>
            <p className="mt-10 font-display text-2xl italic leading-snug text-primary">
              &ldquo;Luxurious decor, affordable prices — and a memory you keep for life.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="scroll-mt-24 border-b border-border">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="eyebrow text-accent">Bookings</p>
            <h2 className="mt-6 font-display text-3xl leading-tight sm:text-4xl lg:text-5xl">
              Let&rsquo;s begin with your date.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Share your occasion, date and venue and we will respond with availability and a
              tailored proposal. Consultations are available in Abuja or by video call.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-accent px-8 py-4 text-xs tracking-[0.22em] uppercase text-accent-foreground transition-opacity hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Chat on WhatsApp
              </a>
              <a
                href={`tel:${PHONE_TEL}`}
                className="inline-flex items-center justify-center gap-2 border border-primary px-8 py-4 text-xs tracking-[0.22em] uppercase text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call {PHONE_DISPLAY}
              </a>
            </div>
          </div>

          <dl className="divide-y divide-border border-y border-border">
            <div className="flex gap-5 py-6">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
              <div className="min-w-0">
                <dt className="eyebrow text-muted-foreground">Studio</dt>
                <dd className="mt-2 text-base text-primary">
                  F01 Charlottes Adesiyan Street, Abuja, Nigeria
                </dd>
              </div>
            </div>
            <div className="flex gap-5 py-6">
              <Phone className="mt-1 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
              <div className="min-w-0">
                <dt className="eyebrow text-muted-foreground">Phone &amp; WhatsApp</dt>
                <dd className="mt-2 text-base text-primary">
                  <a href={`tel:${PHONE_TEL}`} className="hover:text-accent">
                    {PHONE_DISPLAY}
                  </a>
                </dd>
              </div>
            </div>
            <div className="flex gap-5 py-6">
              <Mail className="mt-1 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
              <div className="min-w-0">
                <dt className="eyebrow text-muted-foreground">Consultations</dt>
                <dd className="mt-2 text-base text-primary">
                  Monday &ndash; Saturday, 9am &ndash; 6pm (WAT)
                </dd>
              </div>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-espresso text-cream">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-3xl tracking-wide text-cream">Peggies Events</p>
            <p className="eyebrow mt-3 text-champagne/80">Creating Pleasant Memories</p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-cream/70">
              Peggies Exclusive Events — full-service planning, production and luxury decoration for
              weddings, corporate functions, gala dinners and social celebrations across Abuja and
              beyond.
            </p>
            <div className="rule-gold mt-8 h-px w-24" />
          </div>

          <nav aria-label="Footer">
            <p className="eyebrow text-champagne/80">Explore</p>
            <ul className="mt-5 space-y-3 text-sm text-cream/70">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="transition-colors hover:text-champagne">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="eyebrow text-champagne/80">Bookings</p>
            <ul className="mt-5 space-y-3 text-sm text-cream/70">
              <li>
                <a href={`tel:${PHONE_TEL}`} className="transition-colors hover:text-champagne">
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-champagne"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="h-4 w-4" aria-hidden="true" />
                @peggies_events
              </li>
              <li className="pt-2 leading-relaxed">
                F01 Charlottes Adesiyan Street,
                <br />
                Abuja, Nigeria
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-cream/15 pt-8 text-xs text-cream/50 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Peggies Exclusive Events. All rights reserved.</p>
          <p className="italic">Crafting Quintessential, Magical Moments.</p>
        </div>
      </div>
    </footer>
  );
}
