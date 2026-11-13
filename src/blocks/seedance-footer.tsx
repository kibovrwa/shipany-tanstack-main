import { Link } from '@/core/i18n/navigation';
import { brand } from '@/config/brand';
import { m } from '@/paraglide/messages.js';
import { BuiltWithShipAny } from '@/components/built-with-shipany';
import { LocaleSelector } from '@/components/locale-selector';

export function SeedanceFooter() {
  return (
    <footer className="border-t border-white/10 px-4 py-12">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <img
              src={brand.logo}
              alt={brand.name}
              className="size-7 rounded-md"
            />
            <span className="font-semibold text-white">
              {brand.domainLabel}
            </span>
          </Link>
          <p className="text-muted-foreground mt-3 text-xs">
            Copyright {brand.domainLabel} © {brand.copyrightYear} —{' '}
            {m['landing.footer.rights']()}
          </p>
          <div className="mt-4">
            <BuiltWithShipAny />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold tracking-wider text-white/70 uppercase">
            {m['landing.footer.links']()}
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>
              <a
                href={`mailto:${brand.contactEmail}`}
                className="hover:text-white"
              >
                {m['landing.footer.contact']()}
                <br />
                <span className="text-xs">{brand.contactEmail}</span>
              </a>
            </li>
            <li>
              <Link href="/refund-policy" className="hover:text-white">
                {m['landing.footer.refund']()}
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white">
                {m['landing.footer.about']()}
              </Link>
            </li>
            <li>
              <Link href="/version-hub" className="hover:text-white">
                {m['landing.footer.community_hub']()}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold tracking-wider text-white/70 uppercase">
            {m['landing.footer.legal']()}
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>
              <Link href="/terms-of-service" className="hover:text-white">
                {m['landing.footer.terms']()}
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-white">
                {m['landing.footer.privacy']()}
              </Link>
            </li>
            <li>
              <Link href="/content-policy" className="hover:text-white">
                {m['landing.footer.content_policy']()}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold tracking-wider text-white/70 uppercase">
            {m['landing.footer.language']()}
          </h3>
          <div className="mt-3">
            <LocaleSelector />
          </div>
        </div>
      </div>
    </footer>
  );
}
