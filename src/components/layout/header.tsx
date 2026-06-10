'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, X } from 'lucide-react';
import { SidebarTrigger } from '../ui/sidebar';

interface HeaderProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  isSearching?: boolean;
}

export default function Header({ onSearch, initialQuery = '', isSearching = false }: HeaderProps) {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 md:px-8">
        <SidebarTrigger className="md:hidden" />
        <form className="flex flex-1 items-center gap-3" onSubmit={handleSubmit}>
          <div className="relative max-w-2xl flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              placeholder="Search any book or author…"
              className="h-10 rounded-full border-transparent bg-muted/60 pl-10 pr-9 transition-colors focus-visible:bg-background"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="rounded-full px-5"
          >
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching…
              </>
            ) : (
              'Search'
            )}
          </Button>
        </form>
      </div>
    </header>
  );
}
