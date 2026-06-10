
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
import { BookMarked, Check, RefreshCw, Library, Headphones, Store, Search } from 'lucide-react';
import { availableGenres, availableFormats, sourceData } from '@/lib/data';
import { useSettings } from '@/components/settings-provider';
import { useBookFeedback } from '@/components/book-feedback-provider';
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

  const sections = [
    {
      icon: <Library className="h-4 w-4 text-primary" />,
      title: 'Favorite genres',
      subtitle: 'We blend picks from every genre you choose.',
      content: (
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
      ),
    },
    {
      icon: <Headphones className="h-4 w-4 text-primary" />,
      title: 'Preferred formats',
      subtitle: 'Audiobooks, eBooks, print — pick any.',
      content: (
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
      ),
    },
    {
      icon: <Store className="h-4 w-4 text-primary" />,
      title: 'Where you borrow or buy',
      subtitle: 'Only these sources will show on each book.',
      content: (
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
      ),
    },
  ];

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-background flex items-start justify-center p-4">
      <div className="w-full max-w-2xl py-10">
        <div className="text-center mb-8 animate-fade-up">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
            <BookMarked className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight font-headline">
            Welcome to <span className="text-gradient">The Budget Book Hunter</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Pick a few favorites and we&apos;ll tailor your home page. You can change these
            anytime in Settings.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {sections.map((section, i) => (
            <section
              key={section.title}
              className="animate-fade-up rounded-xl border border-border/60 bg-card p-5 shadow-sm"
              style={{ animationDelay: `${(i + 1) * 90}ms` }}
            >
              <div className="mb-3 flex items-center gap-2">
                {section.icon}
                <h2 className="text-sm font-semibold">{section.title}</h2>
              </div>
              <p className="mb-3 -mt-2 text-xs text-muted-foreground">{section.subtitle}</p>
              {section.content}
            </section>
          ))}
        </div>

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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="animate-fade-up flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex h-44 items-center justify-center bg-muted/60">
            <Skeleton className="h-36 w-24 rounded-md" />
          </div>
          <div className="flex flex-col gap-3 p-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-6 w-16 rounded-full" />
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-6 w-16 rounded-full" />
              ))}
            </div>
            <Skeleton className="mt-1 h-8 w-full" />
          </div>
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
  const { isHidden } = useBookFeedback();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [displayedBooks, setDisplayedBooks] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const hasPerformedInitialSearch = useRef(false);
  const refreshSeedRef = useRef(0);

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

  const performSearch = useCallback(async (query: string | null, force = false) => {
    if (query === null && hasPerformedInitialSearch.current && !force) {
        return;
    }

    setIsSearching(true);

    const searchQuery = query === null ? 'Featured Books' : query;

    try {
      const result = await getBooks({
        query: searchQuery,
        preferredGenres,
        preferredFormats,
        preferredSources,
        refresh: query === null ? refreshSeedRef.current : 0,
      });

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

  // Fetch a fresh set of recommendations (pages further into the results).
  const handleRefresh = useCallback(() => {
    refreshSeedRef.current += 1;
    performSearch(null, true);
  }, [performSearch]);

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

  const isFeatured = !submittedQuery;
  const featuredHeading = preferredGenres.length > 0 ? 'Recommended for you' : 'Featured Books';
  // On the recommendations view, hide books the user thumbed down or marked read.
  const visibleBooks = isFeatured ? displayedBooks.filter((b) => !isHidden(b)) : displayedBooks;

  return (
    <AppLayout>
      <Header onSearch={handleSearch} initialQuery={submittedQuery} isSearching={isSearching} />
      <main className="p-4 md:p-8">
        {isFeatured && (
          <section className="animate-fade-up mb-8">
            <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
              Your next great read, <span className="text-gradient">for less.</span>
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Search any title or author and instantly see where to borrow it free — Libby,
              Hoopla, PDF — or buy it cheap.
            </p>
          </section>
        )}
        <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2
            className={
              isFeatured
                ? 'text-xl font-semibold tracking-tight font-headline'
                : 'text-3xl font-bold tracking-tight font-headline'
            }
          >
            {submittedQuery ? `Results for "${submittedQuery}"` : featuredHeading}
          </h2>
          {!isSearching && visibleBooks.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {visibleBooks.length} {visibleBooks.length === 1 ? 'book' : 'books'}
            </span>
          )}
          {isFeatured && (
            <Button
              variant="outline"
              size="sm"
              className="ml-auto gap-1.5 rounded-full"
              onClick={handleRefresh}
              disabled={isSearching}
            >
              <RefreshCw className={isSearching ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
              Refresh
            </Button>
          )}
        </div>
        {isSearching ? (
          <BookSearchSkeleton />
        ) : visibleBooks.length > 0 ? (
          <BookResults books={visibleBooks} />
        ) : isFeatured ? (
          <RecommendationsEmptyState onRefresh={handleRefresh} />
        ) : (
          <EmptyState query={submittedQuery} onSearch={handleSearch} />
        )}
      </main>
    </AppLayout>
  );
}

function EmptyStateIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
      {children}
    </div>
  );
}

function RecommendationsEmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="animate-fade-up mx-auto max-w-md py-16 text-center">
      <EmptyStateIcon>
        <BookMarked className="h-8 w-8" />
      </EmptyStateIcon>
      <h3 className="mt-4 text-lg font-semibold">No recommendations to show</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        You&apos;ve rated everything here. Get a fresh set, or adjust your genres in Settings.
      </p>
      <Button variant="outline" size="sm" className="mt-4 gap-1.5 rounded-full" onClick={onRefresh}>
        <RefreshCw className="h-4 w-4" />
        Show me others
      </Button>
    </div>
  );
}

const EXAMPLE_SEARCHES = ['Dune', 'Project Hail Mary', 'Pride and Prejudice', 'Stephen King', 'The Hobbit'];

function EmptyState({ query, onSearch }: { query: string; onSearch: (q: string) => void }) {
  return (
    <div className="animate-fade-up mx-auto max-w-md py-16 text-center">
      <EmptyStateIcon>
        <Search className="h-8 w-8" />
      </EmptyStateIcon>
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
          <Button
            key={example}
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => onSearch(example)}
          >
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
