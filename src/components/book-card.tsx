'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Book, BookFormat, Source } from '@/lib/types';
import { BookOpen, Book as BookIcon, ExternalLink, Plus, Minus } from 'lucide-react';
import { AddToWatchlistButton } from './add-to-watchlist-button';
import { Button } from './ui/button';

// Only formats we can actually verify from the metadata API get a badge.
// Audiobook availability is not verifiable, so it is surfaced through the
// source links (Audible / YouTube) rather than an unreliable badge.
const verifiableFormatIcons: Partial<Record<BookFormat, React.ReactNode>> = {
  eBook: <BookOpen className="w-3.5 h-3.5" />,
  Print: <BookIcon className="w-3.5 h-3.5" />,
};

const SourceChip = ({ source }: { source: Source }) => (
  <Button asChild variant="outline" size="sm" className="h-7 gap-1.5 px-2.5 text-xs">
    <a href={source.url} target="_blank" rel="noopener noreferrer">
      {source.name}
      <ExternalLink className="h-3 w-3 opacity-60" />
    </a>
  </Button>
);

// Google Books descriptions may contain light HTML; render them as clean text.
function toPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export default function BookCard({ book, priority = false }: { book: Book; priority?: boolean }) {
  // Description is shown by default; users can collapse it with the toggle.
  const [showDetails, setShowDetails] = useState(true);
  const badges = book.formats.filter((f): f is 'eBook' | 'Print' => f in verifiableFormatIcons);
  const hasDescription = Boolean(book.description) && book.description !== 'No description available.';

  return (
    <Card className="flex flex-col overflow-hidden h-full transition-shadow duration-300 hover:shadow-xl">
      <CardHeader className="flex flex-row items-start gap-4 p-4">
        <div className="w-[90px] h-[135px] flex-shrink-0 relative rounded-md overflow-hidden bg-muted">
          <Image
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            fill
            sizes="90px"
            className="object-contain"
            priority={priority}
          />
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg font-headline leading-snug">{book.title}</CardTitle>
          <CardDescription className="mt-0.5">by {book.author}</CardDescription>
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
          {hasDescription && (
            <button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              aria-expanded={showDetails}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              {showDetails ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              {showDetails ? 'Hide details' : 'Details'}
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        {hasDescription && showDetails && (
          <p className="mb-3 text-sm text-muted-foreground whitespace-pre-line">{toPlainText(book.description)}</p>
        )}
        <p className="text-xs font-medium text-muted-foreground mb-2">Where to find it</p>
        <div className="flex flex-wrap gap-2">
          {book.sources.map((source) => (
            <SourceChip key={source.name} source={source} />
          ))}
        </div>
        {book.isbn && (
          <p className="mt-3 text-xs text-muted-foreground/70">ISBN: {book.isbn}</p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <AddToWatchlistButton book={book} />
      </CardFooter>
    </Card>
  );
}
