import type { ReactNode } from 'react';

import {
  WRAP_DEFAULT_VEHICLE,
  WRAP_EDITABLE_VEHICLES,
  wrapVehicleLabel,
} from '@/config/wrap';
import { m } from '@/paraglide/messages.js';
import {
  WrapHeader,
  type WrapHeaderLabels,
} from '@/components/wrap/site-header';

export function wrapHeaderLabels(): WrapHeaderLabels {
  return {
    selectVehicle: m['wrap.nav.select_vehicle'](),
    aiDesign: m['wrap.nav.ai_design'](),
    aiTooltip: m['wrap.nav.ai_tooltip'](),
    shareGallery: m['wrap.nav.share_gallery'](),
    sharePage: m['wrap.nav.share_page'](),
    linkCopied: m['wrap.nav.link_copied'](),
    changeLanguage: m['wrap.nav.change_language'](),
    signIn: m['wrap.nav.sign_in'](),
    toggleMenu: m['wrap.nav.toggle_menu'](),
    dismiss: m['wrap.banner.dismiss'](),
  };
}

export function Header({
  banner = true,
  children,
}: {
  banner?: boolean;
  children?: ReactNode;
} = {}) {
  return (
    <WrapHeader
      navLinks={[
        { href: '/gallery', label: m['wrap.nav.gallery']() },
        { href: '/plate', label: m['wrap.nav.plates']() },
        { href: '/photo-to-tesla-wrap', label: m['wrap.nav.photo']() },
        { href: '/pricing', label: m['wrap.nav.pricing']() },
      ]}
      mobileLinks={[
        { href: '/tools', label: m['wrap.nav.tools']() },
        { href: '/faq', label: m['wrap.nav.faq']() },
      ]}
      vehicles={WRAP_EDITABLE_VEHICLES.map((v) => ({
        href: `/editor/${v.slug}`,
        label: wrapVehicleLabel(v),
      }))}
      aiHref={`/editor/${WRAP_DEFAULT_VEHICLE}?panel=ai`}
      shareHref={`/editor/${WRAP_DEFAULT_VEHICLE}?share=1`}
      banner={
        banner ? { text: m['wrap.banner.text'](), href: '/pricing' } : null
      }
      labels={wrapHeaderLabels()}
    >
      {children}
    </WrapHeader>
  );
}