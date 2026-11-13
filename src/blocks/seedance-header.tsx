import { useState } from 'react';
import { Menu, X } from 'lucide-react';

import { useSession } from '@/core/auth/client';
import { Link, usePathname } from '@/core/i18n/navigation';
import { brand } from '@/config/brand';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { LocaleSelector } from '@/components/locale-selector';
import { SiteUserMenu } from '@/components/site-user-menu';

const nav = [
  { href: '/', labelKey: 'landing.nav.home' as const },
  { href: '/video', labelKey: 'landing.nav.ai_video' as const },
  { href: '/ai-image-generator', labelKey: 'landing.nav.ai_image' as const },
  { href: '/discover', labelKey: 'landing.nav.prompts' as const },
  {
    href: '/pricing',
    labelKey: 'landing.nav.pricing' as const,
    badge: '50% OFF',
  },
];

export function SeedanceHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [promoOpen, setPromoOpen] = useState(true);
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-50">
      {promoOpen && (
        <div className="flex items-center justify-center gap-3 bg-[#0a0a0c] px-4 py-2 text-center text-xs text-white sm:text-sm">
          <span>
            🚀 {m['landing.promo.banner']()}{' '}
            <span className="font-extrabold text-[#E65100] [text-shadow:_0_1px_2px_rgba(0,0,0,0.45)]">
              {m['landing.promo.off']()}
            </span>{' '}
            {m['landing.promo.rest']()}
          </span>
          <Link
            href="/pricing"
            className="rounded-full border border-white/40 px-3 py-0.5 text-xs whitespace-nowrap hover:bg-white/10"
          >
            {m['landing.promo.cta']()}
          </Link>
          <button
            type="button"
            aria-label="Dismiss"
            className="ml-1 opacity-70 hover:opacity-100"
            onClick={() => setPromoOpen(false)}
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <header className="border-b border-white/5 bg-[#121317]/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <img
              src={brand.logo}
              alt={brand.name}
              className="h-7 w-auto"
              height={28}
            />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => {
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative rounded-md px-3 py-2 text-sm transition-colors',
                    active ? 'text-[#F2CE5A]' : 'text-white/75 hover:text-white'
                  )}
                >
                  {m[item.labelKey]()}
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-1 rounded-full bg-[#F23596] px-1.5 py-px text-[9px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-[#F2CE5A]" />
                  )}
                </Link>
              );
            })}
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
                className="rounded-full border border-white/40 px-4 py-1.5 text-sm text-white/90 transition hover:bg-white/10"
              >
                {m['landing.nav.login']()}
              </Link>
            )}
          </div>

          <button
            className="p-2 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/10 px-4 py-3 lg:hidden">
            <nav className="flex flex-col gap-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm hover:bg-white/5"
                  onClick={() => setMobileOpen(false)}
                >
                  {m[item.labelKey]()}
                  {item.badge ? ` · ${item.badge}` : ''}
                </Link>
              ))}
              <Link
                href="/sign-in"
                className="rounded-lg px-3 py-2 text-sm hover:bg-white/5"
                onClick={() => setMobileOpen(false)}
              >
                {m['landing.nav.login']()}
              </Link>
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}
