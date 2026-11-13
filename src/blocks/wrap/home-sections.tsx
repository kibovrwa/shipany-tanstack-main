import type { CSSProperties } from 'react';
import { ChevronRight, MessageCircle, WandSparkles } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import {
  getWrapVehicle,
  WRAP_DEFAULT_VEHICLE,
  WRAP_VEHICLES,
  wrapVehicleLabel,
} from '@/config/wrap';
import { WRAP_DESIGNS, type WrapDesign } from '@/config/wrap-gallery';
import { m } from '@/paraglide/messages.js';
import { CopyRise } from '@/components/wrap/copy-rise';
import {
  DesignCard,
  type DesignCardData,
} from '@/components/wrap/design-card';
import { VehicleCard } from '@/components/wrap/vehicle-card';

export function designCardData(design: WrapDesign): DesignCardData {
  const vehicle = getWrapVehicle(design.vehicle);
  return {
    id: design.id,
    title: design.title,
    vehicleLabel: vehicle ? wrapVehicleLabel(vehicle) : design.vehicle,
    author: design.author,
    cover: `/wrap/gallery/${design.id}.webp`,
  };
}

function TickerRow({
  designs,
  direction,
}: {
  designs: WrapDesign[];
  direction: 'left' | 'right';
}) {
  return (
    <div className="mb-4 overflow-hidden">
      <div
        className={`ticker-track-${direction}`}
        style={{ '--ticker-copies': 2 } as CSSProperties}
      >
        {[0, 1].map((copy) =>
          designs.map((design) => (
            <DesignCard
              key={`${copy}-${design.id}`}
              design={designCardData(design)}
              className="mr-4 w-44 flex-shrink-0 sm:w-56 md:w-64"
            />
          ))
        )}
      </div>
    </div>
  );
}

export function GalleryMarquee() {
  const featured = WRAP_DESIGNS.filter((d) => d.featured);
  const half = Math.ceil(featured.length / 2);
  return (
    <section className="bg-neutral-100 py-16 md:py-24 dark:bg-neutral-950">
      <div className="mb-10 px-4 text-center">
        <h2
          data-home-featured-title
          className="text-2xl leading-tight font-bold md:text-4xl"
        >
          <span className="text-neutral-400 dark:text-neutral-500">
            <CopyRise text={m['wrap.home.gallery_title']()} />
          </span>
          <span className="ml-2 inline-block text-neutral-900 dark:text-white">
            {m['wrap.home.gallery_count']({ count: WRAP_DESIGNS.length })}
          </span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-500 md:text-base">
          {m['wrap.home.gallery_sub']()}
        </p>
      </div>
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="ticker-pause relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-neutral-100 via-neutral-100/70 to-transparent md:w-64 dark:from-neutral-950 dark:via-neutral-950/70" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-neutral-100 via-neutral-100/70 to-transparent md:w-64 dark:from-neutral-950 dark:via-neutral-950/70" />
          <TickerRow designs={featured.slice(0, half)} direction="left" />
          <TickerRow designs={featured.slice(half)} direction="right" />
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            {m['wrap.home.view_all']()}
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function WrapIdeas() {
  return (
    <section className="content-visibility-auto bg-neutral-100 px-4 py-16 dark:bg-neutral-900">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-6 text-center text-2xl font-bold text-neutral-900 md:text-3xl dark:text-white">
          {m['wrap.home.ideas_title']()}
        </h2>
        <p className="mx-auto mb-8 max-w-3xl text-center leading-relaxed text-neutral-600 dark:text-neutral-400">
          {m['wrap.home.ideas_desc']()}
        </p>
        <div className="relative mx-auto aspect-[1200/630] overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200 shadow-2xl shadow-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-800 dark:shadow-black/30">
          <img
            src="/wrap/og-cover.webp"
            alt={m['wrap.home.ideas_alt']()}
            width={1200}
            height={630}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="mt-8 flex justify-center">
          <Link
            href={`/editor/${WRAP_DEFAULT_VEHICLE}?panel=ai`}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-[background,box-shadow,scale] hover:from-purple-600 hover:to-blue-600 hover:shadow-lg active:scale-[0.97]"
          >
            <WandSparkles className="size-4" />
            {m['wrap.nav.ai_tooltip']()}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function VehicleGrid({
  id = 'vehicles',
  heading = true,
}: {
  id?: string;
  heading?: boolean;
}) {
  return (
    <section id={id} className="bg-neutral-50 px-4 py-20 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl">
        {heading ? (
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-2xl font-bold text-neutral-900 md:text-3xl dark:text-white">
              {m['wrap.home.vehicles_title']()}
            </h2>
            <p className="mx-auto max-w-2xl text-neutral-600 dark:text-neutral-400">
              {m['wrap.home.vehicles_desc']()}
            </p>
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WRAP_VEHICLES.map((v) => (
            <VehicleCard
              key={v.slug}
              href={v.editable ? `/editor/${v.slug}` : `/${v.slug}`}
              name={v.name}
              variant={v.variant}
              image={`/wrap/vehicles/${v.slug}.webp`}
              alt={m['wrap.vehicle.alt']({ vehicle: wrapVehicleLabel(v) })}
              action={
                v.editable ? m['wrap.vehicle.start']() : m['wrap.vehicle.view']()
              }
            />
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
          {m['wrap.home.vehicles_caption']()}
        </p>
      </div>
    </section>
  );
}

export function HowTo() {
  const steps = [
    [m['wrap.home.step1_title'](), m['wrap.home.step1_desc']()],
    [m['wrap.home.step2_title'](), m['wrap.home.step2_desc']()],
    [m['wrap.home.step3_title'](), m['wrap.home.step3_desc']()],
    [m['wrap.home.step4_title'](), m['wrap.home.step4_desc']()],
  ];
  return (
    <section id="how-to" className="bg-neutral-50 px-4 py-16 dark:bg-neutral-900">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-4 text-center text-2xl font-bold text-neutral-900 md:text-3xl dark:text-white">
          {m['wrap.home.howto_title']()}
        </h2>
        <p className="mb-12 text-center text-neutral-600 dark:text-neutral-400">
          {m['wrap.home.howto_sub']()}
        </p>
        <div className="grid gap-6 md:grid-cols-4">
          {steps.map(([title, desc], i) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-xl font-bold text-white dark:bg-neutral-100 dark:text-neutral-900">
                {i + 1}
              </div>
              <h3 className="mb-2 font-semibold text-neutral-900 dark:text-white">
                {title}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PngRequirements() {
  const rows = [
    [m['wrap.home.req_resolution_label'](), m['wrap.home.req_resolution']()],
    [m['wrap.home.req_format_label'](), m['wrap.home.req_format']()],
    [m['wrap.home.req_size_label'](), m['wrap.home.req_size']()],
    [m['wrap.home.req_usb_label'](), m['wrap.home.req_usb']()],
  ];
  return (
    <section className="bg-neutral-100 px-4 py-16 dark:bg-neutral-900">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-8 text-center text-2xl font-bold text-neutral-900 md:text-3xl dark:text-white">
          {m['wrap.home.req_title']()}
        </h2>
        <div className="rounded-xl border border-neutral-200 bg-white p-6 md:p-8 dark:border-neutral-700 dark:bg-neutral-800">
          <p className="mb-6 text-neutral-600 dark:text-neutral-400">
            {m['wrap.home.req_intro']()}
          </p>
          <div className="grid gap-4 text-sm md:grid-cols-2">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-start gap-3">
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {m['wrap.home.req_ok']()}
                </span>
                <span className="text-neutral-700 dark:text-neutral-300">
                  <strong className="font-semibold text-neutral-900 dark:text-white">
                    {label}
                  </strong>{' '}
                  {value}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-6 border-t border-neutral-200 pt-6 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            {m['wrap.home.req_footer']()}
          </p>
        </div>
      </div>
    </section>
  );
}

export function HomeFaq() {
  const items = [
    [m['wrap.home.faq1_q'](), m['wrap.home.faq1_a']()],
    [m['wrap.home.faq2_q'](), m['wrap.home.faq2_a']()],
    [m['wrap.home.faq3_q'](), m['wrap.home.faq3_a']()],
    [m['wrap.home.faq4_q'](), m['wrap.home.faq4_a']()],
    [m['wrap.home.faq5_q'](), m['wrap.home.faq5_a']()],
  ];
  return (
    <section id="faq" className="bg-white px-4 py-16 dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-10 text-center text-2xl font-bold text-neutral-900 md:text-3xl dark:text-white">
          {m['wrap.home.faq_title']()}
        </h2>
        <div className="space-y-6">
          {items.map(([q, a]) => (
            <div
              key={q}
              className="border-b border-neutral-200 pb-6 dark:border-neutral-800"
            >
              <h3 className="mb-2 font-semibold text-neutral-900 dark:text-white">
                {q}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutBox() {
  const brand = envConfigs.app_name;
  return (
    <section className="bg-white px-4 pb-16 dark:bg-neutral-950">
      <div className="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-white p-6 md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-3 text-xl font-bold text-neutral-900 dark:text-white">
          {m['wrap.home.about_title']({ brand })}
        </h2>
        <p className="mb-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {m['wrap.home.about_desc']({ brand })}
        </p>
        <p className="mb-4 text-sm leading-relaxed text-neutral-500 dark:text-neutral-500">
          {m['wrap.home.about_disclaimer']({ brand })}
        </p>
        <Link
          href="/about"
          className="text-sm font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-600 dark:text-white dark:hover:text-neutral-300"
        >
          {m['wrap.home.about_link']({ brand })}
        </Link>
      </div>
    </section>
  );
}

export function HomeCta() {
  return (
    <section className="bg-neutral-900 px-4 py-20 text-center text-white">
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-4 text-2xl font-bold md:text-3xl">
          {m['wrap.home.cta_title']()}
        </h2>
        <p className="mb-8 text-neutral-400">{m['wrap.home.cta_desc']()}</p>
        <a
          href="/#vehicles"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
        >
          {m['wrap.home.cta_button']()}
        </a>
      </div>
    </section>
  );
}

export function FeedbackButton() {
  return (
    <div className="fixed right-4 bottom-16 z-40">
      <Link
        href="/contact"
        aria-label={m['wrap.home.feedback']()}
        title={m['wrap.home.feedback']()}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition-transform hover:scale-105 sm:h-11 sm:w-11 dark:bg-white dark:text-neutral-900"
      >
        <MessageCircle className="size-5" />
      </Link>
    </div>
  );
}