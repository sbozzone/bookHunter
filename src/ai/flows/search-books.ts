'use server';

/**
 * @fileOverview A flow for searching books on the internet.
 *
 * - searchBooks - A function that takes a query and returns a list of books.
 * - SearchBooksInput - The input type for the searchBooks function.
 * - SearchBooksOutput - The return type for the searchBooks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { v4 as uuidv4 } from 'uuid';

const SearchBooksInputSchema = z.object({
  query: z.string().describe('The book title or author to search for.'),
});
export type SearchBooksInput = z.infer<typeof SearchBooksInputSchema>;

const BookSchema = z.object({
  title: z.string().describe('The title of the book.'),
  author: z.string().describe('The author of the book.'),
  description: z.string().describe('A short description of the book.'),
  formats: z.array(z.enum(['Audiobook', 'eBook', 'Print'])).describe('The available formats for the book.'),
});

const SearchBooksOutputSchema = z.object({
  books: z.array(BookSchema),
});
export type SearchBooksOutput = z.infer<typeof SearchBooksOutputSchema>;

export async function searchBooks(
  input: SearchBooksInput
): Promise<SearchBooksOutput> {
  const booksFromFlow = await searchBooksFlow(input);
  const booksWithFullData = booksFromFlow.books.map(book => {
    const titleQuery = encodeURIComponent(book.title);
    return {
      ...book,
      id: uuidv4(),
      coverUrl: 'https://placehold.co/300x450.png',
      sources: [
        { name: 'Libby', availability: 'Check', url: `https://www.google.com/search?q=site%3Alibbyapp.com+${titleQuery}` },
        { name: 'Hoopla', availability: 'Check', url: `https://www.hoopladigital.com/search?q=${titleQuery}` },
        { name: 'PDF', availability: 'Check', url: `https://www.google.com/search?q=${titleQuery}+filetype%3Apdf` },
        { name: 'Amazon Used', price: 'Check', availability: 'Available', url: `https://www.amazon.com/s?k=${titleQuery}` },
        { name: 'Amazon New', price: 'Check', availability: 'Available', url: `https://www.amazon.com/s?k=${titleQuery}` },
      ],
    }
  });
  return { books: booksWithFullData };
}

const prompt = ai.definePrompt({
  name: 'searchBooksPrompt',
  input: {schema: SearchBooksInputSchema},
  output: {schema: SearchBooksOutputSchema},
  prompt: `You are a book search engine. Find up to 6 books matching the query "{{query}}". For each book, provide the title, author, a brief description, and the available formats (Audiobook, eBook, Print).`,
});

const searchBooksFlow = ai.defineFlow(
  {
    name: 'searchBooksFlow',
    inputSchema: SearchBooksInputSchema,
    outputSchema: SearchBooksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
