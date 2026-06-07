
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
};

type GetBooksResult = {
  books: Book[];
  error: string | null;
};

export async function getBooks({
  query,
  preferredGenres,
  preferredFormats,
  preferredSources,
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
        const genres = data.genres ?? [];
        const featuredQuery = genres.length
          ? `${genres.slice(0, 3).join(' ')} best books`
          : 'classic literature bestsellers';
        const featured = await searchBooks(featuredQuery, {
          formats: data.formats as BookFormat[] | undefined,
          sources: data.sources as SourceName[] | undefined,
          maxResults: 6,
        });
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
