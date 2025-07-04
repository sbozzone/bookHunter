'use server';

import { suggestSimilarBooks } from '@/ai/flows/suggest-similar-books';
import { z } from 'zod';

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
