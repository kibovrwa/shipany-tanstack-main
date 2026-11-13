import { useEffect, useState, type ReactNode } from 'react';
import {
  Check,
  ChevronDown,
  Gift,
  Menu,
  Share2,
  Upload,
  WandSparkles,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { useSession } from '@/core/auth/client';
import { Link, usePathname, useRouter } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { localeNames } from '@/config/locale';
import { cn } from '@/lib/utils';
import { getLocale, locales, setLocale } from '@/paraglide/runtime.js';
import { SiteUserMenu } from '@/components/site-user-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface WrapNavLink {
  href: string;
  label: string;
}

export interface WrapHeaderLabels {
  selectVehicle: string;
  aiDesign: string;
  aiTooltip: string;
  shareGallery: string;
  sharePage: string;
  linkCopied: string;
  changeLanguage: string;
  signIn: string;
  toggleMenu: string;
  dismiss: string;
}

export interface WrapHeaderProps {
  navLinks: WrapNavLink[];
  /** Extra links that only appear in the mobile menu. */
  mobileLinks?: WrapNavLink[];
  vehicles: { href: string; label: string }[];
  aiHref: string;
  shareHref: string;
  banner?: { text: string; href: string } | null;
  labels: WrapHeaderLabels;
  /** Replaces the marketing nav (the editor passes its own controls). */
  children?: ReactNode;
}

const FLAGS: Record<string, string> = { en: '🇺🇸', zh: '🇨🇳' };
const BANNER_KEY = 'wrap-banner-dismissed';

const navLinkClass =
  'text-sm font-medium whitespace-nowrap transition-colors text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100';

export function WrapLocaleSelect({ label }: { label: string }) {
  const locale = getLocale();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={label}
        className="flex w-fit items-center justify-between gap-1.5 rounded-lg py-2 pr-1.5 pl-2 text-sm whitespace-nowrap text-neutral-900 transition-colors outline-none select-none hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800"
      >
        <span className="flex flex-1 items-center gap-1.5 text-left text-xs font-medium uppercase">
          <span className="text-base leading-none">{FLAGS[locale] ?? '🌐'}</span>
          <span className="max-md:hidden">{locale}</span>
        </span>
        <ChevronDown className="text-muted-foreground pointer-events-none size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-36">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => setLocale(loc)}
            className="flex items-center justify-between gap-3"
          >
            <span className="flex items-center gap-2">
              <span className="text-base leading-none">{FLAGS[loc]}</span>
              {localeNames[loc] || loc}
            </span>
            {loc === locale && <Check className="size-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function WrapBrandLink({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={envConfigs.app_name}
      title={envConfigs.app_name}
      className={cn(
        'flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-md transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-neutral-950',
        className
      )}
    >
      <img
        src={envConfigs.app_logo}
        alt={envConfigs.app_name}
        width={32}
        height={32}
        className="h-7 w-7 rounded-md sm:h-8 sm:w-8"
      />
    </Link>
  );
}

export function WrapSignIn({ label }: { label: string }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user;
  if (user) {
    return (
      <SiteUserMenu
        name={user.name || 'User'}
        email={user.email}
        image={user.image}
      />
    );
  }
  return (
    <Link
      href={`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`}
      className="cursor-pointer rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
    >
      {label}
    </Link>
  );
}

export function WrapSharePageButton({
  label,
  copied,
  className,
}: {
  label: string;
  copied: string;
  className?: string;
}) {
  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success(copied);
    } catch {
      // The share sheet was dismissed.
    }
  }
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={share}
      className={cn(
        'h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-neutral-600 transition-colors duration-200 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white dark:focus-visible:ring-white',
        className
      )}
    >
      <Share2 className="h-4 w-4" />
    </button>
  );
}

export function WrapHeader({
  navLinks,
  mobileLinks,
  vehicles,
  aiHref,
  shareHref,
  banner,
  labels,
  children,
}: WrapHeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(!!banner);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(BANNER_KEY)) setBannerOpen(false);
    } catch {
      // Storage unavailable: keep the banner.
    }
  }, []);

  function dismissBanner() {
    setBannerOpen(false);
    try {
      sessionStorage.setItem(BANNER_KEY, '1');
    } catch {
      // Ignore.
    }
  }

  return (
    <header className="sticky top-0 z-50 shrink-0">
      {banner ? (
        <div
          className={cn(
            'banner-collapse',
            bannerOpen && 'banner-collapse-open'
          )}
        >
          <div className="banner-collapse-inner">
            <div className="relative bg-gradient-to-r from-purple-500/90 to-blue-500/90 text-center text-xs font-medium text-white sm:text-sm">
              <Link
                href={banner.href}
                className="flex items-center justify-center gap-1.5 px-8 py-1 leading-tight transition-opacity hover:opacity-90 sm:py-1.5"
              >
                <Gift className="h-3.5 w-3.5 shrink-0" />
                <span>{banner.text}</span>
                <span className="ml-1 opacity-75">→</span>
              </Link>
              <button
                type="button"
                onClick={dismissBanner}
                aria-label={labels.dismiss}
                className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded p-1 transition-colors hover:bg-white/20"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3 md:gap-6">
            <WrapBrandLink />
            {children ?? (
              <>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label={labels.toggleMenu}
                  aria-expanded={menuOpen}
                  className="flex cursor-pointer items-center justify-center p-1 text-neutral-600 transition-colors hover:text-neutral-900 xl:hidden dark:text-neutral-400 dark:hover:text-white"
                >
                  {menuOpen ? <X /> : <Menu />}
                </button>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn('hidden xl:block', navLinkClass)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="hidden min-w-0 items-center xl:flex">
                  <span className="mr-2 shrink-0 text-neutral-300 dark:text-neutral-600">
                    ·
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex h-8 w-fit items-center justify-between gap-1.5 rounded-lg py-2 pr-2 pl-2.5 text-sm font-medium whitespace-nowrap text-neutral-900 transition-colors outline-none select-none hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800">
                      <span className="flex flex-1 text-left">
                        {labels.selectVehicle}
                      </span>
                      <ChevronDown className="text-muted-foreground pointer-events-none size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-auto min-w-64"
                    >
                      {vehicles.map((v) => (
                        <DropdownMenuItem
                          key={v.href}
                          onClick={() => router.push(v.href)}
                        >
                          {v.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Link
                  href={aiHref}
                  className="group relative hidden cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md transition-[background,box-shadow] hover:from-purple-600 hover:to-blue-600 hover:shadow-lg xl:flex"
                >
                  <WandSparkles className="h-3.5 w-3.5" />
                  <span>{labels.aiDesign}</span>
                  <div className="invisible absolute top-full left-1/2 z-50 mt-2 -translate-x-1/2 rounded-lg bg-neutral-900 px-3 py-2 text-xs whitespace-nowrap text-white opacity-0 transition-[opacity,visibility] group-hover:visible group-hover:opacity-100 dark:bg-neutral-700">
                    {labels.aiTooltip}
                    <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-neutral-900 dark:bg-neutral-700" />
                  </div>
                </Link>
              </>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            {children ? null : (
              <>
                <Link
                  href={shareHref}
                  className="group relative flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                >
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {labels.shareGallery}
                  </span>
                </Link>
                <WrapSharePageButton
                  label={labels.sharePage}
                  copied={labels.linkCopied}
                  className="hidden sm:flex"
                />
              </>
            )}
            <WrapLocaleSelect label={labels.changeLanguage} />
            <WrapSignIn label={labels.signIn} />
          </div>
        </div>

        {menuOpen && !children ? (
          <nav className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-neutral-200 px-4 py-3 xl:hidden dark:border-neutral-800">
            <div className="flex flex-col">
              {[...navLinks, ...(mobileLinks ?? [])].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={aiHref}
                onClick={() => setMenuOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-2.5 text-sm font-semibold text-white"
              >
                <WandSparkles className="h-4 w-4" />
                {labels.aiDesign}
              </Link>
            </div>
            <p className="mt-4 mb-1 px-3 text-xs font-medium text-neutral-500 uppercase dark:text-neutral-500">
              {labels.selectVehicle}
            </p>
            <div className="grid grid-cols-2 gap-x-2">
              {vehicles.map((v) => (
                <Link
                  key={v.href}
                  href={v.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                  {v.label}
                </Link>
              ))}
            </div>
          </nav>
        ) : null}
      </div>
    </header>
  );
}