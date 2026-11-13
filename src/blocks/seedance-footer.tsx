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
            <img src={brand.logo} alt={brand.name} className="h-7 w-auto" />
          </Link>
          <p className="mt-3 text-xs text-white/55">
            Create professional videos and images with {brand.domainLabel}
            &apos;s unified AI platform.
          </p>
          <p className="mt-3 text-xs text-white/45">
            Copyright {brand.copyrightYear} © {brand.domainLabel}.{' '}
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
              <Link href="/video" className="hover:text-[#F2CE5A]">
                {m['landing.nav.ai_video']()}
              </Link>
            </li>
            <li>
              <Link href="/ai-image-generator" className="hover:text-[#F2CE5A]">
                {m['landing.nav.ai_image']()}
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-[#F2CE5A]">
                {m['landing.nav.pricing']()}
              </Link>
            </li>
            <li>
              <a
                href={`mailto:${brand.contactEmail}`}
                className="hover:text-[#F2CE5A]"
              >
                {m['landing.footer.contact']()}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold tracking-wider text-white/70 uppercase">
            {m['landing.footer.legal']()}
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>
              <Link href="/terms-of-service" className="hover:text-[#F2CE5A]">
                {m['landing.footer.terms']()}
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-[#F2CE5A]">
                {m['landing.footer.privacy']()}
              </Link>
            </li>
            <li>
              <Link href="/content-policy" className="hover:text-[#F2CE5A]">
                {m['landing.footer.content_policy']()}
              </Link>
            </li>
            <li>
              <Link href="/refund-policy" className="hover:text-[#F2CE5A]">
                {m['landing.footer.refund']()}
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
