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
  coverUrl: z.string().url().describe('The URL of the book cover image.'),
  formats: z.array(z.enum(['Audiobook', 'eBook', 'Print'])).describe('The available formats for the book.'),
  usedPrice: z.string().optional().describe('The estimated price for a used copy of the book.'),
  newPrice: z.string().optional().describe('The estimated price for a new copy of the book.'),
});

const SearchBooksOutputSchema = z.object({
  books: z.array(BookSchema).describe('A list of books found. Can be an empty list.'),
});
export type SearchBooksOutput = z.infer<typeof SearchBooksOutputSchema>;

export async function searchBooks(
  input: SearchBooksInput
): Promise<SearchBooksOutput> {
  const booksFromFlow = await searchBooksFlow(input);

  if (!booksFromFlow || !booksFromFlow.books) {
    return { books: [] };
  }

  const booksWithFullData = booksFromFlow.books.map(book => {
    const titleQuery = encodeURIComponent(book.title);
    return {
      ...book,
      id: uuidv4(),
      sources: [
        { name: 'Libby', availability: 'Check', url: `https://www.google.com/search?q=site%3Alibbyapp.com+${titleQuery}` },
        { name: 'Hoopla', availability: 'Check', url: `https://www.hoopladigital.com/search?q=${titleQuery}` },
        { name: 'PDF', availability: 'Check', url: `https://www.google.com/search?q=${titleQuery}+filetype%3Apdf` },
        { name: 'Amazon Used', price: book.usedPrice || 'Check', availability: 'Available', url: `https://www.amazon.com/s?k=${titleQuery}&condition=used` },
        { name: 'Amazon New', price: book.newPrice || 'Check', availability: 'Available', url: `https://www.amazon.com/s?k=${titleQuery}` },
      ],
    }
  });
  return { books: booksWithFullData };
}

const getPriceTool = ai.defineTool(
    {
        name: 'getBookPrice',
        description: 'Get the estimated price of a book from a retailer.',
        inputSchema: z.object({
            title: z.string().describe('The title of the book.'),
            condition: z.enum(['new', 'used']).describe('The condition of the book.'),
        }),
        outputSchema: z.string(),
    },
    async (input) => {
        // This is a mock price. In a real app, you'd call an API.
        const randomPrice = (Math.random() * 20 + 5).toFixed(2);
        return `$${randomPrice}`;
    }
);


const prompt = ai.definePrompt({
  name: 'searchBooksPrompt',
  input: {schema: SearchBooksInputSchema},
  output: {schema: SearchBooksOutputSchema},
  tools: [getPriceTool],
  prompt: `You are a book search engine. Find up to 6 books matching the query "{{query}}". 
For each book, provide the title, author, a brief description, a URL for the book cover image, and the available formats (Audiobook, eBook, Print).
Use a search engine to find a suitable public image URL for each book cover. The image URL must be a direct link to an image file (e.g., .png, .jpg). Do not use placeholder images.
Also, use the getBookPrice tool to find the estimated price for both a 'new' and a 'used' copy of each book.
If no books are found, return an empty list.`,
});

const searchBooksFlow = ai.defineFlow(
  {
    name: 'searchBooksFlow',
    inputSchema: SearchBooksInputSchema,
    outputSchema: SearchBooksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output || { books: [] };
  }
);
