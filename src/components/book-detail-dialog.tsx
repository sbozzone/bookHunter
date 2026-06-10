'use client';

import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Book, BookFormat } from '@/lib/types';
import { BookOpen, Book as BookIcon } from 'lucide-react';
import { AddToWatchlistButton } from './add-to-watchlist-button';
import { SourceLinks } from './source-links';
import { toPlainText } from '@/lib/text';

const formatIcons: Partial<Record<BookFormat, React.ReactNode>> = {
  eBook: <BookOpen className="w-3.5 h-3.5" />,
  Print: <BookIcon className="w-3.5 h-3.5" />,
};

export default function BookDetailDialog({
  book,
  open,
  onOpenChange,
}: {
  book: Book;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const badges = book.formats.filter((f): f is 'eBook' | 'Print' => f in formatIcons);
  const hasDescription = Boolean(book.description) && book.description !== 'No description available.';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
        {/* Hero band: blurred cover as ambient backdrop behind the sharp cover */}
        <div className="relative overflow-hidden bg-muted">
          <Image
            src={book.coverUrl}
            alt=""
            aria-hidden
            fill
            sizes="672px"
            className="scale-110 object-cover opacity-30 blur-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
          <div className="relative flex gap-5 p-6">
            <div className="relative h-44 w-[7.5rem] flex-shrink-0 overflow-hidden rounded-md shadow-xl ring-1 ring-black/10">
              <Image
                src={book.coverUrl}
                alt={`Cover of ${book.title}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </div>
            <DialogHeader className="min-w-0 justify-center space-y-2 text-left">
              <DialogTitle className="font-headline text-2xl leading-snug">{book.title}</DialogTitle>
              <DialogDescription className="text-base">by {book.author}</DialogDescription>
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {badges.map((format) => (
                    <Badge key={format} variant="secondary" className="flex items-center gap-1 font-normal">
                      {formatIcons[format]}
                      {format}
                    </Badge>
                  ))}
                </div>
              )}
            </DialogHeader>
          </div>
        </div>

        <div className="max-h-[45vh] space-y-5 overflow-y-auto p-6">
          <SourceLinks sources={book.sources} />
          {hasDescription && (
            <div>
              <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                About this book
              </h4>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {toPlainText(book.description)}
              </p>
            </div>
          )}
          {book.isbn && <p className="text-xs text-muted-foreground/70">ISBN: {book.isbn}</p>}
        </div>

        <div className="border-t bg-muted/30 p-4">
          <AddToWatchlistButton book={book} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
