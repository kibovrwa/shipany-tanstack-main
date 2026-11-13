import { getRouteApi } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { WRAP_EDITABLE_VEHICLES, wrapVehicleLabel } from '@/config/wrap';
import { openCookieSettings } from '@/lib/cookie-consent';
import { m } from '@/paraglide/messages.js';
import { FooterBadgeList } from '@/components/footer-badge-list';
import { WrapFooter } from '@/components/wrap/site-footer';

const rootRoute = getRouteApi('__root__');

const FOOTER_VEHICLES = [
  'modely-2025-premium',
  'model3-2024-base',
  'cybertruck',
  'modely-2025-performance',
  'model3-2024-performance',
  'modely-2025-base',
  'models-2021',
  'models-2025-plaid',
  'modelx-2021',
];

export function Footer() {
  const cookieConsentEnabled =
    !!rootRoute.useLoaderData()?.cookieConsentEnabled;
  const vehicles = FOOTER_VEHICLES.map(
    (slug) => WRAP_EDITABLE_VEHICLES.find((v) => v.slug === slug)!
  );

  return (
    <WrapFooter
      editor={{
        title: m['wrap.footer.editor'](),
        links: vehicles.map((v) => ({
          label: wrapVehicleLabel(v),
          href: `/editor/${v.slug}`,
        })),
      }}
      gallery={{
        title: m['wrap.footer.gallery'](),
        links: vehicles.map((v) => ({
          label: m['wrap.footer.gallery_for']({ vehicle: wrapVehicleLabel(v) }),
          href: `/gallery?vehicle=${v.slug}`,
        })),
      }}
      resources={{
        title: m['wrap.footer.resources'](),
        groups: [
          {
            title: m['wrap.footer.tools_downloads'](),
            links: [
              { label: m['wrap.footer.all_designs'](), href: '/gallery' },
              { label: m['wrap.footer.plate_gallery'](), href: '/plate' },
              {
                label: m['wrap.footer.plate_generator'](),
                href: '/plate/generate',
              },
              { label: m['wrap.footer.select_vehicle'](), href: '/editor' },
              { label: m['wrap.footer.pricing'](), href: '/pricing' },
              {
                label: m['wrap.footer.ai_generator'](),
                href: '/ai-tesla-wrap-generator',
              },
              {
                label: m['wrap.footer.png_checker'](),
                href: '/tesla-wrap-png-checker',
              },
              {
                label: m['wrap.footer.templates'](),
                href: '/tesla-wrap-templates',
              },
              { label: m['wrap.footer.colors'](), href: '/tesla-wrap-colors' },
              {
                label: m['wrap.footer.gradients'](),
                href: '/tesla-gradient-wrap',
              },
              { label: m['wrap.footer.all_tools'](), href: '/tools' },
            ],
          },
          {
            title: m['wrap.footer.guides'](),
            links: [
              { label: m['wrap.footer.blog'](), href: '/blog' },
              {
                label: m['wrap.footer.photo'](),
                href: '/photo-to-tesla-wrap',
              },
              { label: m['wrap.footer.faq'](), href: '/faq' },
              { label: m['wrap.footer.about'](), href: '/about' },
              {
                label: m['wrap.footer.feedback'](),
                href: '/contact',
              },
            ],
          },
        ],
      }}
      note={m['wrap.footer.made_for']()}
      bottomLinks={[
        { label: m['wrap.footer.about'](), href: '/about' },
        { label: m['wrap.footer.contact'](), href: '/contact' },
        { label: m['wrap.footer.terms'](), href: '/terms' },
        { label: m['wrap.footer.privacy'](), href: '/privacy' },
        { label: m['wrap.footer.refund'](), href: '/refund' },
        ...(cookieConsentEnabled
          ? [
              {
                label: m['wrap.footer.cookie_settings'](),
                onClick: openCookieSettings,
              },
            ]
          : []),
      ]}
      badges={<FooterBadgeList className="mt-10" />}
    />
  );
}

export const footerBrandName = () => envConfigs.app_name;