
'use server';
/**
 * @fileOverview An AI flow for formatting raw text into a styled HTML document.
 *
 * - formatDocument - A function that takes a raw text string and returns a title and formatted HTML.
 * - FormatDocumentInput - The input type for the formatDocument function.
 * - FormatDocumentOutput - The return type for the formatDocument function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FormatDocumentInputSchema = z.object({
  text: z.string().describe('The raw text content of a document.'),
});
export type FormatDocumentInput = z.infer<typeof FormatDocumentInputSchema>;

const FormatDocumentOutputSchema = z.object({
  title: z
    .string()
    .describe('A concise title for the document, based on its content.'),
  html: z
    .string()
    .describe(
      'The document content formatted as a single block of clean, semantic HTML without any CSS classes or inline styles.'
    ),
});
export type FormatDocumentOutput = z.infer<typeof FormatDocumentOutputSchema>;

export async function formatDocument(
  text: string
): Promise<FormatDocumentOutput> {
  return formatDocumentFlow({ text });
}

const prompt = ai.definePrompt({
  name: 'formatDocumentPrompt',
  input: { schema: FormatDocumentInputSchema },
  output: { schema: FormatDocumentOutputSchema },
  prompt: `You are an expert at formatting raw text into clean HTML. Take the following text and convert it into a well-structured HTML block. Use standard semantic HTML tags like <h2>, <ul>, <li>, <strong>, and <a>.

**CRITICAL INSTRUCTION:** Do NOT add ANY CSS classes or inline styles to the HTML. The styling will be handled separately. Only produce the raw HTML structure.

For example, a heading should be '<h2>My Heading</h2>', NOT '<h2 class="text-2xl font-bold">My Heading</h2>'.

Generate a concise title for the document based on its content.

Return a JSON object with two keys: 'title' and 'html'. The 'html' key should contain the formatted HTML string. Do not include <html> or <body> tags.

Raw text:
{{{text}}}`,
});

const formatDocumentFlow = ai.defineFlow(
  {
    name: 'formatDocumentFlow',
    inputSchema: FormatDocumentInputSchema,
    outputSchema: FormatDocumentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
