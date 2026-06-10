'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Book, BookFormat } from '@/lib/types';
import { BookOpen, Book as BookIcon, ThumbsUp, ThumbsDown, BookCheck, ArrowUpRight } from 'lucide-react';
import { AddToWatchlistButton } from './add-to-watchlist-button';
import { Button } from './ui/button';
import { useBookFeedback, type Rating } from './book-feedback-provider';
import BookDetailDialog from './book-detail-dialog';
import { SourceLinks } from './source-links';
import { cn } from '@/lib/utils';

// Only formats we can actually verify from the metadata API get a badge.
// Audiobook availability is not verifiable, so it is surfaced through the
// source links (Audible / YouTube) rather than an unreliable badge.
const verifiableFormatIcons: Partial<Record<BookFormat, React.ReactNode>> = {
  eBook: <BookOpen className="w-3.5 h-3.5" />,
  Print: <BookIcon className="w-3.5 h-3.5" />,
};

function RateButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        'h-8 gap-1 px-2 text-xs text-muted-foreground',
        active && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
      )}
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}

export default function BookCard({ book, priority = false }: { book: Book; priority?: boolean }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { getRating, setRating } = useBookFeedback();
  const rating: Rating | undefined = getRating(book);
  const badges = book.formats.filter((f): f is 'eBook' | 'Print' => f in verifiableFormatIcons);

  return (
    <>
      <Card className="group flex h-full flex-col overflow-hidden border-border/60 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
        <div className="relative">
          {/* Cover hero: the book's own cover, blurred, doubles as an ambient backdrop */}
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            aria-label={`View details for ${book.title}`}
            className="relative block h-44 w-full overflow-hidden bg-muted"
          >
            <Image
              src={book.coverUrl}
              alt=""
              aria-hidden
              fill
              sizes="400px"
              className="scale-110 object-cover opacity-30 blur-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-36 w-24 overflow-hidden rounded-md shadow-lg ring-1 ring-black/10 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src={book.coverUrl}
                  alt={`Cover of ${book.title}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                  priority={priority}
                />
              </div>
            </div>
          </button>
          <div className="absolute right-2.5 top-2.5">
            <AddToWatchlistButton book={book} compact />
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col gap-3 p-4">
          <div className="min-w-0">
            <button type="button" onClick={() => setDetailsOpen(true)} className="block w-full text-left">
              <h3 className="line-clamp-2 font-headline text-lg font-bold leading-snug transition-colors hover:text-primary">
                {book.title}
              </h3>
            </button>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">by {book.author}</p>
            {badges.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {badges.map((format) => (
                  <Badge key={format} variant="secondary" className="flex items-center gap-1 font-normal">
                    {verifiableFormatIcons[format]}
                    {format}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <SourceLinks sources={book.sources} />

          <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3">
            <div className="flex items-center gap-0.5">
              <RateButton active={rating === 'up'} label="Good recommendation" onClick={() => setRating(book, 'up')}>
                <ThumbsUp className={cn('h-3.5 w-3.5', rating === 'up' && 'fill-current')} />
              </RateButton>
              <RateButton
                active={rating === 'down'}
                label="Not for me — show fewer like this"
                onClick={() => setRating(book, 'down')}
              >
                <ThumbsDown className={cn('h-3.5 w-3.5', rating === 'down' && 'fill-current')} />
              </RateButton>
              <RateButton
                active={rating === 'read'}
                label="Read it already — don't recommend again"
                onClick={() => setRating(book, 'read')}
              >
                <BookCheck className="h-3.5 w-3.5" />
                Read it
              </RateButton>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setDetailsOpen(true)}
            >
              Details
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <BookDetailDialog book={book} open={detailsOpen} onOpenChange={setDetailsOpen} />
    </>
  );
}
