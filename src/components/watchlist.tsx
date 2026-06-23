'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import type { Book } from '@/lib/types';
import { SidebarGroup, SidebarGroupLabel, SidebarGroupAction } from './ui/sidebar';
import { Bookmark, ExternalLink, X } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface WatchlistProps {
  watchlist: Book[];
  removeFromWatchlist: (book: Book) => void;
}

export default function Watchlist({ watchlist, removeFromWatchlist }: WatchlistProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center gap-2">
        <Bookmark className="size-4" />
        My Watchlist
      </SidebarGroupLabel>
      <SidebarGroupAction asChild>
        <Link href="/watchlist">
          <ExternalLink />
          <span className="sr-only">Manage Watchlist</span>
        </Link>
      </SidebarGroupAction>
      <ScrollArea className="h-64">
        <div className="space-y-2 pr-4">
        {watchlist.length === 0 ? (
          <p className="text-sm text-muted-foreground p-2">Your watchlist is empty.</p>
        ) : (
          watchlist.map((book) => (
            <div key={book.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
              <Image
                src={book.coverUrl}
                alt={book.title}
                width={40}
                height={60}
                className="rounded-sm object-cover"
                data-ai-hint={`${book.title.split(' ')[0]} ${book.author.split(' ').pop()}`.toLowerCase()}
              />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate">{book.title}</p>
                <p className="text-xs text-muted-foreground truncate">{book.author}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => removeFromWatchlist(book)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove from watchlist</span>
              </Button>
            </div>
          ))
        )}
        </div>
      </ScrollArea>
    </SidebarGroup>
  );
}
