
'use server';

import { searchBooks, suggestSimilarBooks } from '@/lib/google-books';
import { z } from 'zod';
import type { Book, BookFormat, SourceName } from '@/lib/types';
import { mockBooks } from '@/lib/data';

const SuggestionSchema = z.object({
  query: z.string().min(2, { message: 'Query must be at least 2 characters.' }),
});

export async function getSuggestions(prevState: any, formData: FormData) {
  try {
    const validatedFields = SuggestionSchema.safeParse({
      query: formData.get('query'),
    });

    if (!validatedFields.success) {
      return {
        message: 'Invalid query.',
        suggestions: [],
        error: null,
      };
    }

    // Keyless recommender: similar books via Google Books / OpenLibrary, so the
    // feature works without an ANTHROPIC_API_KEY (no LLM in this path).
    const suggestions = await suggestSimilarBooks(validatedFields.data.query);
    return { suggestions, message: null, error: null };
  } catch (error) {
    console.error('Error getting suggestions:', error);
    const errorMessage = error instanceof Error && error.message ? error.message : 'An unexpected error occurred.';
    return {
      message: `Failed to get suggestions. Please try again. ${errorMessage}`,
      suggestions: [],
      error: errorMessage,
    };
  }
}

const SearchSchema = z.object({
  query: z.string(),
  genres: z.array(z.string()).optional(),
  formats: z.array(z.enum(['Audiobook', 'eBook', 'Print'])).optional(),
  sources: z.array(z.string()).optional(),
});

type SearchInputs = {
  query: string;
  preferredGenres: string[];
  preferredFormats: BookFormat[];
  preferredSources: SourceName[];
  refresh?: number;
};

type GetBooksResult = {
  books: Book[];
  error: string | null;
};

const FEATURED_COUNT = 8;

/**
 * Build the featured/recommended list. With multiple genres, fetch each genre
 * separately and interleave the results so every chosen genre is represented
 * (a single mashed-together query confuses the API). `refresh` pages further
 * into the results for a fresh set.
 */
async function getFeatured(
  genres: string[],
  formats: BookFormat[] | undefined,
  sources: SourceName[] | undefined,
  refresh: number
): Promise<Book[]> {
  if (genres.length === 0) {
    return searchBooks('classic literature bestsellers', {
      formats,
      sources,
      maxResults: FEATURED_COUNT,
      startIndex: refresh * FEATURED_COUNT,
    });
  }

  if (genres.length === 1) {
    return searchBooks(`${genres[0]} best books`, {
      formats,
      sources,
      maxResults: FEATURED_COUNT,
      startIndex: refresh * FEATURED_COUNT,
    });
  }

  const used = genres.slice(0, 4);
  const perGenreCount = Math.ceil(FEATURED_COUNT / used.length) + 2;
  const lists = await Promise.all(
    used.map((g) =>
      searchBooks(`${g} best books`, {
        formats,
        sources,
        maxResults: perGenreCount,
        startIndex: refresh * perGenreCount,
      })
    )
  );

  // Interleave one book from each genre at a time, de-duplicating by title.
  const seen = new Set<string>();
  const blended: Book[] = [];
  for (let i = 0; blended.length < FEATURED_COUNT; i++) {
    let addedThisRound = false;
    for (const list of lists) {
      const book = list[i];
      if (!book) continue;
      addedThisRound = true;
      const key = `${book.title}|${book.author}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        blended.push(book);
        if (blended.length >= FEATURED_COUNT) break;
      }
    }
    if (!addedThisRound) break;
  }
  return blended;
}

export async function getBooks({
  query,
  preferredGenres,
  preferredFormats,
  preferredSources,
  refresh = 0,
}: SearchInputs): Promise<GetBooksResult> {
  try {
    const validatedFields = SearchSchema.safeParse({
      query,
      genres: preferredGenres?.length ? preferredGenres : undefined,
      formats: preferredFormats?.length ? preferredFormats : undefined,
      sources: preferredSources?.length ? preferredSources : undefined,
    });

    if (!validatedFields.success) {
      console.error('Validation Errors:', validatedFields.error.flatten().fieldErrors);
      return { error: 'Invalid search parameters.', books: [] };
    }

    const data = validatedFields.data;

    if (data.query.trim() === '') {
      return { books: [], error: null };
    }

    // Featured books load: reflect the user's preferred genres when they have
    // any, otherwise fall back to a curated default. Same fast pipeline, with
    // the static list as a last resort if the API is unavailable.
    if (data.query === 'Featured Books') {
      try {
        const featured = await getFeatured(
          data.genres ?? [],
          data.formats as BookFormat[] | undefined,
          data.sources as SourceName[] | undefined,
          Math.max(0, Math.floor(refresh))
        );
        return { books: featured.length ? featured : mockBooks, error: null };
      } catch {
        return { books: mockBooks, error: null };
      }
    }

    const books = await searchBooks(data.query, {
      genres: data.genres,
      formats: data.formats as BookFormat[] | undefined,
      sources: data.sources as SourceName[] | undefined,
    });

    return { books, error: null };
  } catch (error) {
    console.error('CRITICAL ERROR in getBooks:', error);
    const errorMessage =
      error instanceof Error && error.message ? error.message : 'An unexpected error occurred.';
    return { error: `Failed to fetch books: ${errorMessage}`, books: [] };
  }
}
