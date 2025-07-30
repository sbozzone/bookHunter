
'use server';

import { suggestSimilarBooks } from '@/ai/flows/suggest-similar-books';
import { searchBooks } from '@/ai/flows/search-books';
import { z } from 'zod';
import type { BookFormat, SourceName } from '@/lib/types';
import { cookies } from 'next/headers';
import { availableSources } from '@/lib/data';

const SuggestionSchema = z.object({
  query: z.string().min(2, { message: 'Query must be at least 2 characters.' }),
});

export async function getSuggestions(prevState: any, formData: FormData) {
  const validatedFields = SuggestionSchema.safeParse({
    query: formData.get('query'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid query.',
      suggestions: [],
    };
  }

  try {
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

async function getSettingsFromCookies() {
    const settingsCookie = cookies().get(SETTINGS_STORAGE_KEY);
    if (settingsCookie) {
        try {
            const settings = JSON.parse(settingsCookie.value);
            return {
                preferredGenres: settings.preferredGenres || [],
                preferredFormats: settings.preferredFormats || [],
                preferredSources: settings.preferredSources || availableSources,
            }
        } catch (e) {
           // Corrupted cookie
        }
    }
    return {
        preferredGenres: [],
        preferredFormats: [],
        preferredSources: availableSources,
    }
}

export async function getBooks(query: string) {
    try {
      const { preferredGenres, preferredFormats, preferredSources } = await getSettingsFromCookies();

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

      const result = await searchBooks(validatedFields.data);
      return { books: result.books, error: null };
    } catch (error) {
        console.error('Error in getBooks server action:', error);
        const errorMessage = error instanceof Error && error.message ? error.message : 'An unexpected error occurred.';
        return {
            error: `Failed to get books: ${errorMessage}`,
            books: [],
        };
    }
}
