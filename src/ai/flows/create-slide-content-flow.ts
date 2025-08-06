
'use server';
/**
 * @fileOverview An AI flow for creating the textual content of a presentation for a sales team.
 *
 * - createSlideContent - A function that takes document content and user inputs to generate structured slide content.
 * - CreateSlideContentInput - The input type for the createSlideContent function.
 * - CreateSlideContentOutput - The return type for the createSlideContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CreateSlideContentInputSchema = z.object({
  sourceText: z
    .string()
    .describe('The full text content of the source document.'),
  featuredService: z
    .string()
    .describe('The featured service for the presentation.'),
  announcementTitle: z
    .string()
    .optional()
    .describe('The title for the announcement slide.'),
  announcementContent: z
    .string()
    .optional()
    .describe('The main content/body for the announcement slide.'),
  announcementClosing: z
    .string()
    .optional()
    .describe('The closing message for the announcement slide.'),
});
export type CreateSlideContentInput = z.infer<
  typeof CreateSlideContentInputSchema
>;

const SlideContentSchema = z.object({
  title: z
    .string()
    .describe('The main title for the presentation (max 15 words).'),
  subtitle: z
    .string()
    .describe('The subtitle for the presentation (max 12 words).'),
  presenter: z
    .string()
    .describe("The presenter's name and date (e.g., Professional Development Session • Today)."),
  tipTitle: z.string().describe("The main title for the 'Work-Related Tip' slide."),
  tipIntro: z.string().describe('A short, engaging subtitle for the work tip.'),
  tipPara1: z
    .string()
    .describe('The opening paragraph for the work-related tip.'),
  tipPara2: z
    .string()
    .describe('A detailed explanation paragraph for the work tip.'),
  tipActionItems: z
    .array(z.string())
    .length(4)
    .describe('A list of exactly 4 actionable bullet points for the work tip.'),
  tipTakeaway: z.string().describe('The key takeaway message for the work tip.'),
  tipContinuationTitle: z
    .string()
    .describe("The title for the 'Work-Related Tip (Continuation)' slide."),
  tipContinuationPara1: z
    .string()
    .describe('First paragraph for the advanced implementation details.'),
  tipContinuationPara2: z
    .string()
    .describe('Second paragraph for the advanced implementation details.'),
  tipContinuationPara3: z
    .string()
    .describe('Third paragraph for the advanced implementation details.'),
  tipImplementationSteps: z
    .array(z.string())
    .length(5)
    .describe('A list of exactly 5 implementation steps.'),
  tipNextAction: z
    .string()
    .describe('A final, single action step for the audience.'),
  objection: z.string().describe('A common, relevant sales objection.'),
  rebuttal: z.string().describe("An effective rebuttal to the sales objection."),
  rebuttalWhy1: z.string().describe('First reason why the rebuttal works.'),
  rebuttalWhy2: z.string().describe('Second reason why the rebuttal works.'),
  rebuttalWhy3: z.string().describe('Third reason why the rebuttal works.'),
  rebuttalWhy4: z.string().describe('Fourth reason why the rebuttal works.'),
  featuredServiceTitle: z
    .string()
    .describe("The title for the 'Featured Service' slide."),
  featuredServiceName: z
    .string()
    .describe('The name of the featured service, taken from user input.'),
  faqQuestion: z
    .string()
    .describe('A common FAQ related to the featured service.'),
  faqAnswer: z
    .string()
    .describe('A concise and helpful answer to the FAQ.'),
  announcementHeader: z
    .string()
    .optional()
    .describe("A simple header for the announcement slide, like 'Announcement' or 'Important Update'."),
  announcementTitle: z
    .string()
    .optional()
    .describe('The main title for the announcement.'),
  announcementContent: z
    .string()
    .optional()
    .describe('The main content/body of the announcement.'),
  announcementClosing: z
    .string()
    .optional()
    .describe('The closing message for the announcement.'),
  quote: z.string().describe('An inspiring or relevant quote.'),
  author: z.string().describe('The author of the quote.'),
});

const CreateSlideContentOutputSchema = SlideContentSchema;

export type CreateSlideContentOutput = z.infer<
  typeof CreateSlideContentOutputSchema
>;

export async function createSlideContent(
  input: CreateSlideContentInput
): Promise<CreateSlideContentOutput> {
  return createSlideContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createSlideContentPrompt',
  input: { schema: CreateSlideContentInputSchema },
  output: { schema: CreateSlideContentOutputSchema },
  config: {
    temperature: 0.7,
  },
  prompt: `You are an expert in sales training and presentation creation. Your task is to analyze a source document and generate the textual content for a 10-slide sales training presentation. You will be provided with the source text, a featured service, and an optional announcement.

**MISSION INSTRUCTIONS:**

1.  **Analyze the Source Document:** Read the provided "Source Document" thoroughly to understand its key themes, tips, and concepts. The entire presentation should be based on this document.
2.  **Adhere to the Structure:** You will generate content for a fixed slide structure. Do NOT create content for the "Session Overview" or "Thank You" slides, as they are static.
3.  **Use User Inputs:**
    *   **Featured Service:** The user will provide a "Featured Service". Your generated content for the 'featuredServiceName' field MUST be exactly: \`{{{featuredService}}}\`. The "Service FAQ" slide must also be directly about this service.
    *   **Announcement:**
        {{#if announcementTitle}}
        *   You have been given specific content for the announcement. You MUST use it exactly as provided for the announcementTitle, announcementContent, and announcementClosing fields. Also create a header for 'announcementHeader'.
        {{else}}
        *   The user has NOT provided an announcement. You MUST leave all announcement-related fields (announcementHeader, announcementTitle, announcementContent, announcementClosing) completely blank. Do NOT invent an announcement.
        {{/if}}
4.  **Generate Content for Each Dynamic Slide:**
    *   **Title Slide:** Create a compelling title (max 15 words) and subtitle (max 12 words) that capture the essence of the source document. Set the presenter to "Professional Development Session • Today".
    *   **Work-Related Tip:** Extract a core professional tip from the document. Create a title, intro, paragraphs, 4 action items, and a takeaway.
    *   **Work-Related Tip (Continuation):** Expand on the previous tip with advanced strategies. Create a title, 3 paragraphs of content, 5 implementation steps, and a final "next action".
    *   **General Selling Tip:** Find a concept that can be framed as handling a sales objection. Create the objection, a powerful rebuttal, and four reasons ("Why it Works").
    *   **Featured Service:** Set the title to "FEATURED SERVICE TONIGHT". Use the user-provided service name for the main content.
    *   **Service FAQ:** Based on the featured service, create a plausible and common client question and provide a clear, helpful answer.
    *   **Announcement:** If the user provided content for an announcement, populate the announcement fields. If they did not, leave all announcement-related fields (announcementHeader, announcementTitle, announcementContent, announcementClosing) completely blank. Do not invent an announcement.
    *   **Motivational Quote:** Find a powerful quote within the source text. If none exists, create one that fits the theme. Provide the quote and its author.
5.  **Format the Output:** Return a single, flat JSON object that matches the \`CreateSlideContentOutputSchema\`.

**Source Document:**
{{{sourceText}}}
`,
});

const createSlideContentFlow = ai.defineFlow(
  {
    name: 'createSlideContentFlow',
    inputSchema: CreateSlideContentInputSchema,
    outputSchema: CreateSlideContentOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) {
        throw new Error('AI failed to generate slide content. The output was empty.');
      }
      return output;
    } catch (error) {
      console.error('Error in createSlideContentFlow:', error);
      // Re-throw a more user-friendly error or handle it as needed
      throw new Error(`Failed to process the document and create slide content. Please try again. Details: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
);
