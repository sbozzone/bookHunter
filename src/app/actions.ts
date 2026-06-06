
'use server';

import { suggestSimilarBooks } from '@/ai/flows/suggest-similar-books';
import { searchBooks } from '@/ai/flows/search-books';
import { z } from 'zod';
import type { BookFormat, SourceName } from '@/lib/types';
import { cookies } from 'next/headers';
import { availableSources, mockBooks } from '@/lib/data';

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

    const result = await suggestSimilarBooks({ query: validatedFields.data.query });
    return { suggestions: result.suggestions, message: null, error: null };
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

const SETTINGS_STORAGE_KEY = 'budget-book-hunter-settings';

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
}

export async function getBooks({ query, preferredGenres, preferredFormats, preferredSources }: SearchInputs) {
    try {
      const validatedFields = SearchSchema.safeParse({
          query,
          genres: preferredGenres && preferredGenres.length > 0 ? preferredGenres : undefined,
          formats: preferredFormats && preferredFormats.length > 0 ? preferredFormats : undefined,
          sources: preferredSources && preferredSources.length > 0 ? preferredSources : undefined
      });

      if (!validatedFields.success) {
          console.error('Validation Errors:', validatedFields.error.flatten().fieldErrors);
          return {
              error: 'Invalid search parameters.',
              books: [],
          };
      }

      if (validatedFields.data.query.trim() === '') {
        return { books: [] };
      }

      if (validatedFields.data.query === 'Featured Books') {
        return { books: mockBooks, error: null };
      }

      const result = await searchBooks(validatedFields.data);
      return { books: result.books, error: null };
    } catch (error) {
        console.error('CRITICAL ERROR in getBooks:', error);
        const errorMessage = error instanceof Error && error.message ? error.message : 'An unexpected error occurred.';
        return {
            error: `Failed to fetch books: ${errorMessage}`,
            books: [],
        };
    }
}
