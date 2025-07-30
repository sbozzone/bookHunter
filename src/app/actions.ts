
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
    return { suggestions: result.suggestions, message: null };
  } catch (error) {
    console.error(error);
    return {
      message: 'Failed to get suggestions. Please try again.',
      suggestions: [],
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

function getSettingsFromCookies() {
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
    const { preferredGenres, preferredFormats, preferredSources } = getSettingsFromCookies();

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

    try {
        const result = await searchBooks(validatedFields.data);
        return { books: result.books };
    } catch (error) {
        console.error(error);
        return {
            error: 'Failed to get books. Please try again.',
            books: [],
        };
    }
}
