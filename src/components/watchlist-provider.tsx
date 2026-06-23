'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Book } from '@/lib/types';

interface WatchlistContextType {
  watchlist: Book[];
  addToWatchlist: (book: Book) => void;
  removeFromWatchlist: (book: Book) => void;
  isBookInWatchlist: (book: Book) => boolean;
  isInitialized: boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

// Google and Open Library do not share identifiers. Their stable IDs are the
// primary identity, while title + author keeps watchlists created by older
// versions (which used random UUIDs) usable after this upgrade.
function fallbackIdentity(book: Book): string {
  return `${book.title}|${book.author}`.toLocaleLowerCase().trim();
}

function isSameBook(first: Book, second: Book): boolean {
  return first.id === second.id || fallbackIdentity(first) === fallbackIdentity(second);
}

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<Book[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem('budget-book-hunter-watchlist');
      if (item) {
        setWatchlist(JSON.parse(item));
      }
    } catch (error) {
      console.warn('Error reading localStorage.', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        window.localStorage.setItem('budget-book-hunter-watchlist', JSON.stringify(watchlist));
      } catch (error) {
         console.warn('Error setting localStorage.', error);
      }
    }
  }, [watchlist, isInitialized]);


  const addToWatchlist = (book: Book) => {
    setWatchlist((prev) => {
      if (prev.some((item) => isSameBook(item, book))) {
        return prev;
      }
      return [...prev, book];
    });
  };

  const removeFromWatchlist = (book: Book) => {
    setWatchlist((prev) => prev.filter((item) => !isSameBook(item, book)));
  };

  const isBookInWatchlist = (book: Book) => {
    return watchlist.some((item) => isSameBook(item, book));
  };

  return (
    <WatchlistContext.Provider
      value={{ watchlist, addToWatchlist, removeFromWatchlist, isBookInWatchlist, isInitialized }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
