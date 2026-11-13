import { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';

import { useSession } from '@/core/auth/client';
import { Link } from '@/core/i18n/navigation';
import { brand } from '@/config/brand';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { LocaleSelector } from '@/components/locale-selector';
import { SiteUserMenu } from '@/components/site-user-menu';
import { buttonVariants } from '@/components/ui/button';

const imageLinks = [
  { href: '/ai-image-generator', label: 'AI Image Generator' },
  { href: '/ai-image-editor', label: 'AI Image Editor' },
  { href: '/ai-region-edit', label: 'AI Region Edit' },
  { href: '/ai-paint', label: 'AI Paint' },
];

const videoLinks = [
  { href: '/text-to-video-ai', label: 'Text to Video' },
  { href: '/image-to-video-ai', label: 'Image to Video' },
  { href: '/ai-video-editor', label: 'AI Video Editor' },
  { href: '/effects', label: 'AI Video Effects' },
  { href: '/kling-video-ai', label: 'Kling AI' },
  { href: '/google-veo-ai', label: 'Google Veo AI' },
  { href: '/hailuo-ai-video', label: 'Minimax H3' },
  { href: '/wan-ai', label: 'Wan AI' },
];

const toolLinks = [
  { href: '/ai-tools', label: 'Explore AI Tools' },
  { href: '/home-design', label: 'Home Design' },
  { href: '/ai-pose', label: 'AI Pose Changer' },
  { href: '/ai-hairstyle-changer', label: 'Hairstyle Changer' },
];

function Mega({
  label,
  items,
}: {
  label: string;
  items: { href: string; label: string }[];
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
      >
        {label}
        <ChevronDown className="size-3.5 opacity-70 transition group-hover:rotate-180" />
      </button>
      <div className="invisible absolute top-full left-1/2 z-50 mt-3 w-56 -translate-x-1/2 rounded-xl border border-[oklch(0.22_0.02_280)] bg-[oklch(0.14_0.02_280)] p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-lg px-3 py-2 text-sm text-[oklch(0.96_0.01_280)] hover:bg-white/5"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SeedanceHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="sd-header sticky top-0 z-50 w-full border-b border-white/5 bg-[oklch(0.08_0.01_280_/_0.82)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <img
            src={brand.logo}
            alt={brand.name}
            className="size-7 rounded-md"
            width={28}
            height={28}
          />
          <span className="text-sm font-semibold tracking-tight text-white">
            {brand.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          <Link
            href="/discover"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            {m['landing.nav.inspiration']()}
          </Link>
          <Link
            href="/ai-actor-ip"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            {m['landing.nav.ip_actor']()}
          </Link>
          <Mega label={m['landing.nav.ai_image']()} items={imageLinks} />
          <Mega label={m['landing.nav.ai_video']()} items={videoLinks} />
          <Mega label={m['landing.nav.ai_tools']()} items={toolLinks} />
          <Link
            href="/pricing"
            className="text-sm font-medium text-[oklch(0.78_0.14_85)] transition-colors hover:opacity-90"
          >
            {m['landing.nav.pricing']()}
          </Link>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LocaleSelector />
          {user ? (
            <SiteUserMenu
              name={user.name || 'User'}
              email={user.email}
              image={user.image}
            />
          ) : (
            <Link
              href="/sign-in"
              className={cn(
                buttonVariants({ size: 'sm' }),
                'rounded-lg bg-[#a855f7] text-white hover:bg-[#9333ea]'
              )}
            >
              {m['common.nav.sign_in']()}
            </Link>
          )}
        </div>

        <button
          className="p-2 lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {[
              { href: '/discover', label: m['landing.nav.inspiration']() },
              { href: '/ai-actor-ip', label: m['landing.nav.ip_actor']() },
              {
                href: '/ai-image-generator',
                label: m['landing.nav.ai_image'](),
              },
              { href: '/text-to-video-ai', label: m['landing.nav.ai_video']() },
              { href: '/ai-tools', label: m['landing.nav.ai_tools']() },
              { href: '/pricing', label: m['landing.nav.pricing']() },
              { href: '/sign-in', label: m['common.nav.sign_in']() },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm hover:bg-white/5"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
