import { Link } from '@/core/i18n/navigation';
import { cn } from '@/lib/utils';

export interface DesignCardData {
  id: string;
  title: string;
  vehicleLabel: string;
  author: string;
  cover: string;
}

const AVATAR_HUES = [262, 199, 152, 24, 330, 45, 215, 280];

export function AuthorAvatar({
  author,
  className,
}: {
  author: string;
  className?: string;
}) {
  let hash = 0;
  for (const ch of author) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const hue = AVATAR_HUES[hash % AVATAR_HUES.length];
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] leading-none font-semibold text-white uppercase ring-1 ring-black/10 dark:ring-white/20',
        className
      )}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 80% 60%), hsl(${(hue + 50) % 360} 75% 45%))`,
      }}
    >
      {author.charAt(0)}
    </span>
  );
}

export function DesignCard({
  design,
  className,
  eager,
}: {
  design: DesignCardData;
  className?: string;
  eager?: boolean;
}) {
  return (
    <Link
      href={`/gallery/${design.id}`}
      title={design.title}
      className={cn(
        'group cursor-pointer text-left transition-transform duration-200 active:scale-[0.98]',
        className
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-neutral-200 outline outline-2 -outline-offset-2 outline-transparent transition-[outline-color] duration-200 group-hover:outline-blue-500 dark:bg-neutral-800">
        <img
          src={design.cover}
          alt={design.title}
          width={768}
          height={480}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="mt-2.5 flex items-center gap-2 px-0.5">
        <AuthorAvatar author={design.author} />
        <span className="truncate text-sm font-medium text-neutral-900 dark:text-white">
          {design.vehicleLabel}
        </span>
        <span className="truncate text-xs text-neutral-400 dark:text-neutral-500">
          @{design.author}
        </span>
      </div>
    </Link>
  );
}