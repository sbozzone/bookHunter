'use server';

import { suggestSimilarBooks } from '@/ai/flows/suggest-similar-books';
import { searchBooks } from '@/ai/flows/search-books';
import { z } from 'zod';
import type { BookFormat, SourceName } from '@/lib/types';

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

const SearchSchema = z.object({
  query: z.string(),
  genres: z.array(z.string()).optional(),
  formats: z.array(z.enum(['Audiobook', 'eBook', 'Print'])).optional(),
  sources: z.array(z.string()).optional(),
});

export async function getBooks(query: string, genres?: string[], formats?: BookFormat[], sources?: SourceName[]) {
    const validatedFields = SearchSchema.safeParse({ 
        query, 
        genres: genres && genres.length > 0 ? genres : undefined, 
        formats: formats && formats.length > 0 ? formats : undefined, 
        sources: sources && sources.length > 0 ? sources : undefined 
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
