import { PackageOpen } from 'lucide-react';

export function EmptyState({ title = 'Nothing here yet', message, action, icon: Icon = PackageOpen }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink/15 bg-white/50 px-6 py-16 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cream-dark text-burgundy">
        <Icon size={26} />
      </span>
      <h3 className="font-serif text-2xl font-semibold">{title}</h3>
      {message && <p className="mt-2 max-w-sm text-sm text-ink-soft">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-soft">
      <div className="aspect-[4/5] animate-pulse bg-cream-dark" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-1/3 animate-pulse rounded bg-cream-dark" />
        <div className="h-5 w-2/3 animate-pulse rounded bg-cream-dark" />
        <div className="h-4 w-1/4 animate-pulse rounded bg-cream-dark" />
        <div className="h-9 w-full animate-pulse rounded-full bg-cream-dark" />
      </div>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, subtitle, align = 'center', action }) {
  return (
    <div className={`mb-10 flex flex-col gap-3 ${align === 'center' ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between'}`}>
      <div className={align === 'center' ? 'max-w-2xl' : ''}>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="text-4xl font-semibold leading-tight sm:text-5xl">{title}</h2>
        {subtitle && <p className="mt-3 text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
