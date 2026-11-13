import type { ReactNode } from 'react';

import { Link } from '@/core/i18n/navigation';
import { BuiltWithShipAny } from '@/components/built-with-shipany';

export interface WrapFooterLink {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface WrapFooterProps {
  editor: { title: string; links: WrapFooterLink[] };
  gallery: { title: string; links: WrapFooterLink[] };
  resources: {
    title: string;
    groups: { title: string; links: WrapFooterLink[] }[];
  };
  note: string;
  bottomLinks: WrapFooterLink[];
  badges?: ReactNode;
}

const linkClass =
  'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors';

function FooterLink({ link }: { link: WrapFooterLink }) {
  if (link.onClick || !link.href) {
    return (
      <button type="button" onClick={link.onClick} className={linkClass}>
        {link.label}
      </button>
    );
  }
  return (
    <Link href={link.href} className={linkClass}>
      {link.label}
    </Link>
  );
}

function LinkList({
  links,
  className,
}: {
  links: WrapFooterLink[];
  className?: string;
}) {
  return (
    <ul className={className ?? 'space-y-2'}>
      {links.map((link) => (
        <li key={link.label} className="min-h-10 sm:min-h-0">
          <FooterLink link={link} />
        </li>
      ))}
    </ul>
  );
}

export function WrapFooter({
  editor,
  gallery,
  resources,
  note,
  bottomLinks,
  badges,
}: WrapFooterProps) {
  return (
    <footer className="border-t border-neutral-200/50 bg-white/80 backdrop-blur-sm dark:border-neutral-800/50 dark:bg-neutral-950/80">
      <div className="mx-auto max-w-7xl px-6 pt-10 pb-6">
        <div className="grid grid-cols-2 gap-8 text-sm lg:grid-cols-4">
          {[editor, gallery].map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 font-semibold text-neutral-900 dark:text-white">
                {col.title}
              </h3>
              <LinkList links={col.links} />
            </div>
          ))}
          <div className="col-span-2 lg:flex lg:flex-col">
            <h3 className="mb-3 font-semibold text-neutral-900 dark:text-white">
              {resources.title}
            </h3>
            <div className="grid grid-cols-2 gap-8 lg:flex-1">
              {resources.groups.map((group) => (
                <div key={group.title}>
                  <h4 className="mb-3 min-h-8 text-xs font-medium text-neutral-600 sm:min-h-0 dark:text-neutral-300">
                    {group.title}
                  </h4>
                  <LinkList links={group.links} />
                </div>
              ))}
            </div>
          </div>
        </div>
        {badges}
      </div>
      <div className="border-t border-neutral-200/50 dark:border-neutral-800/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-4 sm:flex-row">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {note}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:justify-start">
            {bottomLinks.map((link) => (
              <FooterLink key={link.label} link={link} />
            ))}
            <BuiltWithShipAny
              variant="text"
              className="text-xs text-neutral-500 dark:text-neutral-400"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}