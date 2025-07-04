'use client';

import { useWatchlist } from './watchlist-provider';
import { Button } from './ui/button';
import { BookmarkPlus, BookmarkCheck } from 'lucide-react';
import type { Book } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function AddToWatchlistButton({ book }: { book: Book }) {
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
