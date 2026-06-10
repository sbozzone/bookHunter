'use client';

import { useWatchlist } from './watchlist-provider';
import { Button } from './ui/button';
import { BookmarkPlus, BookmarkCheck } from 'lucide-react';
import type { Book } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function AddToWatchlistButton({ book, compact = false }: { book: Book; compact?: boolean }) {
  const { addToWatchlist, removeFromWatchlist, isBookInWatchlist } = useWatchlist();
  const { toast } = useToast();
  const inWatchlist = isBookInWatchlist(book.id);

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (inWatchlist) {
      removeFromWatchlist(book.id);
      toast({
        title: 'Removed from Watchlist',
        description: `"${book.title}" was removed from your watchlist.`,
      });
    } else {
      addToWatchlist(book);
      toast({
        title: 'Added to Watchlist',
        description: `"${book.title}" was added to your watchlist.`,
      });
    }
  };

  if (compact) {
    return (
      <Button
        variant="secondary"
        size="icon"
        onClick={handleToggle}
        aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
        title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
        className="h-8 w-8 rounded-full bg-background/80 shadow-md backdrop-blur hover:bg-background"
      >
        {inWatchlist ? (
          <BookmarkCheck className="h-4 w-4 text-primary" />
        ) : (
          <BookmarkPlus className="h-4 w-4" />
        )}
      </Button>
    );
  }

  return (
    <Button variant={inWatchlist ? 'secondary' : 'default'} onClick={handleToggle} className="w-full">
      {inWatchlist ? (
        <>
          <BookmarkCheck className="mr-2 h-4 w-4" />
          In Watchlist
        </>
      ) : (
        <>
          <BookmarkPlus className="mr-2 h-4 w-4" />
          Add to Watchlist
        </>
      )}
    </Button>
  );
}
