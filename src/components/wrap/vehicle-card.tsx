import { Link } from '@/core/i18n/navigation';

export interface VehicleCardProps {
  href: string;
  name: string;
  variant?: string;
  image: string;
  alt: string;
  action: string;
}

export function VehicleCard({
  href,
  name,
  variant,
  image,
  alt,
  action,
}: VehicleCardProps) {
  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-[border-color,box-shadow,scale] duration-300 hover:border-neutral-400 hover:shadow-2xl active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-neutral-500 dark:hover:shadow-neutral-900/50"
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-neutral-100 to-neutral-50 dark:from-neutral-700 dark:to-neutral-800">
        <img
          src={image}
          alt={alt}
          width={800}
          height={800}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          {name}
        </h3>
        {variant ? (
          <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
            {variant}
          </p>
        ) : null}
        <div className="mt-4 flex items-center text-sm font-medium text-neutral-600 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-white">
          <span>{action}</span>
          <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1.5">
            -&gt;
          </span>
        </div>
      </div>
    </Link>
  );
}