'use server';

/**
 * @fileOverview A flow for suggesting similar books based on a given title or author.
 *
 * - suggestSimilarBooks - A function that takes a book title or author and returns a list of suggested books.
 * - SuggestSimilarBooksInput - The input type for the suggestSimilarBooks function.
 * - SuggestSimilarBooksOutput - The return type for the suggestSimilarBooks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSimilarBooksInputSchema = z.object({
  query: z.string().describe('The title or author to find similar books for.'),
});
export type SuggestSimilarBooksInput = z.infer<typeof SuggestSimilarBooksInputSchema>;

const SuggestSimilarBooksOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of suggested book titles or authors.'),
});
export type SuggestSimilarBooksOutput = z.infer<typeof SuggestSimilarBooksOutputSchema>;

export async function suggestSimilarBooks(
  input: SuggestSimilarBooksInput
): Promise<SuggestSimilarBooksOutput> {
  return suggestSimilarBooksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSimilarBooksPrompt',
  input: {schema: SuggestSimilarBooksInputSchema},
  output: {schema: SuggestSimilarBooksOutputSchema},
  prompt: `You are a helpful book recommendation assistant. A user is looking for books similar to "{{query}}". Suggest some titles or authors that they might enjoy. Return a list of titles or authors.  Here are some suggestions:

  {{#each suggestions}}
  - {{this}}
  {{/each}}`,
});

const suggestSimilarBooksFlow = ai.defineFlow(
  {
    name: 'suggestSimilarBooksFlow',
    inputSchema: SuggestSimilarBooksInputSchema,
    outputSchema: SuggestSimilarBooksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
