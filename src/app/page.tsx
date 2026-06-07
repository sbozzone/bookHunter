
'use client';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import Header from '@/components/layout/header';
import BookResults from '@/components/book-results';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { Book } from '@/lib/types';
import { getBooks } from '@/app/actions';
import { BookMarked, Check } from 'lucide-react';
import { availableGenres, availableFormats, sourceData } from '@/lib/data';
import { useSettings } from '@/components/settings-provider';
import { useToast } from '@/hooks/use-toast';

const SPLASH_HIDE_KEY = 'budget-book-hunter-hide-splash';
const ONBOARDED_KEY = 'budget-book-hunter-onboarded';

function SplashScreen({
  onDismiss,
  onDontShowAgain,
}: {
  onDismiss: () => void;
  onDontShowAgain: () => void;
}) {
  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center bg-white dark:bg-slate-900 fixed inset-0 z-50 cursor-pointer overflow-hidden"
      onClick={onDismiss}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onDismiss();
        }
      }}
    >
      <img
        src="/splash.png"
        alt="BudgetBookHunter"
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-3">
        <p className="text-gray-600 dark:text-gray-400 text-sm bg-white dark:bg-slate-900 px-4 py-2 rounded-full">
          Tap anywhere to continue
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDontShowAgain();
          }}
          className="text-xs text-gray-500 dark:text-gray-400 underline underline-offset-2 hover:text-gray-700 dark:hover:text-gray-200"
        >
          Don&apos;t show this again
        </button>
      </div>
    </div>
  );
}

function ChipToggle({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant={selected ? 'default' : 'outline'}
      size="sm"
      className="gap-1.5"
      onClick={onClick}
    >
      {selected && <Check className="h-3.5 w-3.5" />}
      {label}
    </Button>
  );
}

// One-time onboarding: let the user pick preferences before entering the app.
// Selections persist immediately via the settings provider, so the home page's
// featured titles reflect them as soon as onboarding completes.
function Onboarding({ onComplete }: { onComplete: () => void }) {
  const {
    preferredGenres,
    toggleGenre,
    preferredFormats,
    toggleFormat,
    preferredSources,
    toggleSource,
  } = useSettings();

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-background flex items-start justify-center p-4">
      <div className="w-full max-w-2xl py-10">
        <div className="text-center mb-8">
          <BookMarked className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-3 text-3xl font-bold tracking-tight font-headline">
            Welcome to The Budget Book Hunter
          </h1>
          <p className="mt-2 text-muted-foreground">
            Pick a few favorites and we&apos;ll tailor your home page. You can change these
            anytime in Settings.
          </p>
        </div>

        <section className="mb-6">
          <h2 className="text-sm font-semibold mb-3">Favorite genres</h2>
          <div className="flex flex-wrap gap-2">
            {availableGenres.map((g) => (
              <ChipToggle
                key={g}
                label={g}
                selected={preferredGenres.includes(g)}
                onClick={() => toggleGenre(g)}
              />
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-sm font-semibold mb-3">Preferred formats</h2>
          <div className="flex flex-wrap gap-2">
            {availableFormats.map((f) => (
              <ChipToggle
                key={f}
                label={f}
                selected={preferredFormats.includes(f)}
                onClick={() => toggleFormat(f)}
              />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-sm font-semibold mb-3">Where you borrow or buy</h2>
          <div className="flex flex-wrap gap-2">
            {sourceData.map((s) => (
              <ChipToggle
                key={s.name}
                label={s.name}
                selected={preferredSources.includes(s.name)}
                onClick={() => toggleSource(s.name)}
              />
            ))}
          </div>
        </section>

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onComplete}
            className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Skip for now
          </button>
          <Button size="lg" onClick={onComplete}>
            Get started
          </Button>
        </div>
      </div>
    </div>
  );
}

function BookSearchSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex flex-col space-y-3 rounded-lg border p-4">
          <div className="flex flex-row items-start gap-4">
             <Skeleton className="h-[135px] w-[90px] rounded-md" />
             <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-1.5 pt-1">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-3 w-full mt-2" />
                <Skeleton className="h-3 w-5/6" />
             </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[...Array(4)].map((_, j) => (
                <Skeleton key={j} className="h-7 w-20" />
            ))}
          </div>
          <Skeleton className="h-10 w-full mt-auto" />
        </div>
      ))}
    </div>
  );
}


function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { preferredGenres, preferredFormats, preferredSources, isInitialized: settingsAreInitialized } = useSettings();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [displayedBooks, setDisplayedBooks] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const hasPerformedInitialSearch = useRef(false);

  // Flow: splash first (every visit unless opted out) → tap → onboarding (first
  // visit only) → main. Arriving via a search skips both.
  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSubmittedQuery(query);
    let onboarded = false;
    let hideSplash = false;
    try {
      onboarded = window.localStorage.getItem(ONBOARDED_KEY) === 'true';
      hideSplash = window.localStorage.getItem(SPLASH_HIDE_KEY) === 'true';
    } catch {
      /* ignore storage errors */
    }
    if (query) {
      setIsLoading(false);
      return;
    }
    if (hideSplash) {
      // Splash suppressed; go straight to onboarding (first visit) or the app.
      setIsLoading(false);
      if (!onboarded) {
        setShowOnboarding(true);
      }
    }
    // Otherwise leave the splash showing (isLoading stays true).
  }, [searchParams]);

  const isOnboarded = () => {
    try {
      return window.localStorage.getItem(ONBOARDED_KEY) === 'true';
    } catch {
      return false;
    }
  };

  // Finish onboarding (preferences were already saved as the user toggled them).
  const completeOnboarding = useCallback(() => {
    try {
      window.localStorage.setItem(ONBOARDED_KEY, 'true');
    } catch {
      /* ignore storage errors */
    }
    setShowOnboarding(false);
  }, []);

  // Tap to dismiss the splash for this visit; then onboard (first visit) or open.
  const dismissSplash = useCallback(() => {
    setIsLoading(false);
    if (!isOnboarded()) {
      setShowOnboarding(true);
    }
  }, []);

  // Permanently suppress the splash on future visits, then continue the flow.
  const hideSplashForever = useCallback(() => {
    try {
      window.localStorage.setItem(SPLASH_HIDE_KEY, 'true');
    } catch {
      /* ignore storage errors */
    }
    setIsLoading(false);
    if (!isOnboarded()) {
      setShowOnboarding(true);
    }
  }, []);

  const performSearch = useCallback(async (query: string | null) => {
    if (query === null && hasPerformedInitialSearch.current) {
        return;
    }

    setIsSearching(true);

    const searchQuery = query === null ? 'Featured Books' : query;

    try {
      const result = await getBooks({ query: searchQuery, preferredGenres, preferredFormats, preferredSources });

      if (result.error) {
        toast({ variant: 'destructive', title: 'Search Failed', description: result.error });
      }
      setDisplayedBooks(result.books || []);
    } finally {
      setIsSearching(false);
    }

    if (query === null) {
      hasPerformedInitialSearch.current = true;
    }
  }, [preferredGenres, preferredFormats, preferredSources, toast]);

  useEffect(() => {
    // Hold off until onboarding is done so the first featured search reflects
    // the preferences the user just picked.
    if (!settingsAreInitialized || isLoading || showOnboarding) {
      return;
    }

    const query = searchParams.get('q');
    performSearch(query);

  }, [searchParams, settingsAreInitialized, isLoading, showOnboarding, performSearch]);

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  if (isLoading) {
    return <SplashScreen onDismiss={dismissSplash} onDontShowAgain={hideSplashForever} />;
  }

  if (showOnboarding) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  const featuredHeading = preferredGenres.length > 0 ? 'Recommended for you' : 'Featured Books';

  return (
    <AppLayout>
      <Header onSearch={handleSearch} initialQuery={submittedQuery} isSearching={isSearching} />
      <main className="p-4 md:p-8">
        <div className="mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-3xl font-bold tracking-tight font-headline">
            {submittedQuery ? `Results for "${submittedQuery}"` : featuredHeading}
          </h2>
          {!isSearching && displayedBooks.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {displayedBooks.length} {displayedBooks.length === 1 ? 'book' : 'books'}
            </span>
          )}
        </div>
        {isSearching ? (
          <BookSearchSkeleton />
        ) : displayedBooks.length > 0 ? (
          <BookResults books={displayedBooks} />
        ) : (
          <EmptyState query={submittedQuery} onSearch={handleSearch} />
        )}
      </main>
    </AppLayout>
  );
}

const EXAMPLE_SEARCHES = ['Dune', 'Project Hail Mary', 'Pride and Prejudice', 'Stephen King', 'The Hobbit'];

function EmptyState({ query, onSearch }: { query: string; onSearch: (q: string) => void }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <BookMarked className="mx-auto h-12 w-12 text-muted-foreground/40" />
      <h3 className="mt-4 text-lg font-semibold">
        {query ? `No books found for "${query}"` : 'Start your search'}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {query
          ? 'Try a different title or author — or one of these:'
          : 'Search by title or author. Try one of these to get started:'}
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {EXAMPLE_SEARCHES.map((example) => (
          <Button key={example} variant="outline" size="sm" onClick={() => onSearch(example)}>
            {example}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <SearchPage />
    </Suspense>
  );
}
