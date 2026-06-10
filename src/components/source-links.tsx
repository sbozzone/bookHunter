import type { Source, SourceName } from '@/lib/types';
import { ExternalLink, BadgeDollarSign, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// Sources where the book can be borrowed or found at no cost. These are the
// app's reason to exist, so they get top billing and a distinct group label.
const FREE_SOURCES: SourceName[] = ['Libby', 'Hoopla', 'PDF', 'YouTube'];

// Brand-flavored chip colors so users can spot their favorite source at a glance.
const sourceStyles: Record<SourceName, string> = {
  Libby: 'bg-violet-100 text-violet-900 hover:bg-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:hover:bg-violet-500/25',
  Hoopla: 'bg-sky-100 text-sky-900 hover:bg-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:hover:bg-sky-500/25',
  PDF: 'bg-slate-200/70 text-slate-800 hover:bg-slate-300/70 dark:bg-slate-500/15 dark:text-slate-300 dark:hover:bg-slate-500/25',
  YouTube: 'bg-red-100 text-red-900 hover:bg-red-200 dark:bg-red-500/15 dark:text-red-300 dark:hover:bg-red-500/25',
  Amazon: 'bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/25',
  Audible: 'bg-orange-100 text-orange-900 hover:bg-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:hover:bg-orange-500/25',
  'Google Play': 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25',
};

export function isFreeSource(name: SourceName): boolean {
  return FREE_SOURCES.includes(name);
}

export function SourcePill({ source }: { source: Source }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
        sourceStyles[source.name] ?? 'bg-muted text-muted-foreground hover:bg-muted/80'
      )}
    >
      {source.name}
      <ExternalLink className="h-3 w-3 opacity-50" />
    </a>
  );
}

function GroupLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {icon}
      {children}
    </span>
  );
}

export function SourceLinks({ sources, className }: { sources: Source[]; className?: string }) {
  const free = sources.filter((s) => isFreeSource(s.name));
  const paid = sources.filter((s) => !isFreeSource(s.name));

  if (sources.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {free.length > 0 && (
        <div className="space-y-1.5">
          <GroupLabel icon={<Sparkles className="h-3 w-3 text-primary" />}>Borrow free</GroupLabel>
          <div className="flex flex-wrap gap-1.5">
            {free.map((source) => (
              <SourcePill key={source.name} source={source} />
            ))}
          </div>
        </div>
      )}
      {paid.length > 0 && (
        <div className="space-y-1.5">
          <GroupLabel icon={<BadgeDollarSign className="h-3 w-3" />}>Buy</GroupLabel>
          <div className="flex flex-wrap gap-1.5">
            {paid.map((source) => (
              <SourcePill key={source.name} source={source} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
