
'use server';
/**
 * @fileOverview An AI flow for creating a presentation from a document.
 *
 * - generatePresentation - A function that takes document content and returns presentation HTML.
 * - GeneratePresentationInput - The input type for the generatePresentation function.
 * - GeneratePresentationOutput - The return type for the generatePresentationOutput function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// This is the structured content for all slides, coming from the content creation flow.
const AllSlidesContentSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  presenter: z.string(),
  tipTitle: z.string(),
  tipIntro: z.string(),
  tipPara1: z.string(),
  tipPara2: z.string(),
  tipActionItems: z.array(z.string()),
  tipTakeaway: z.string(),
  tipContinuationTitle: z.string(),
  tipContinuationPara1: z.string(),
  tipContinuationPara2: z.string(),
  tipContinuationPara3: z.string(),
  tipImplementationSteps: z.array(z.string()),
  tipNextAction: z.string(),
  objection: z.string(),
  rebuttal: z.string(),
  rebuttalWhy1: z.string(),
  rebuttalWhy2: z.string(),
  rebuttalWhy3: z.string(),
  rebuttalWhy4: z.string(),
  featuredServiceTitle: z.string(),
  featuredServiceName: z.string(),
  faqQuestion: z.string(),
  faqAnswer: z.string(),
  announcementHeader: z.string().optional(),
  announcementTitle: z.string().optional(),
  announcementContent: z.string().optional(),
  announcementClosing: z.string().optional(),
  quote: z.string(),
  author: z.string(),
});

const GeneratePresentationInputSchema = z.object({
  slideContent: AllSlidesContentSchema,
  visuals: z
    .string()
    .optional()
    .describe(
      "User preferences for visuals (e.g., 'Use charts for data, corporate blue color scheme')."
    ),
});

export type GeneratePresentationInput = z.infer<
  typeof GeneratePresentationInputSchema
>;

const GeneratePresentationOutputSchema = z.object({
  presentation: z
    .string()
    .describe(
      'A string containing 10 <section> tags, each representing a slide with Tailwind CSS classes for styling.'
    ),
});
export type GeneratePresentationOutput = z.infer<
  typeof GeneratePresentationOutputSchema
>;

export async function generatePresentation(
  input: GeneratePresentationInput
): Promise<GeneratePresentationOutput> {
  return generatePresentationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePresentationPrompt',
  input: { schema: GeneratePresentationInputSchema },
  output: { schema: GeneratePresentationOutputSchema },
  config: {
    temperature: 0.1,
  },
  prompt: `You are an expert presentation designer. Your mission is to take a JSON object containing structured text for various slides and map it into a complete 10-slide HTML presentation using the provided templates.

**CRITICAL MISSION INSTRUCTIONS:**

1.  **Use the Provided Content:** You will be given a single JSON object under the key \`slideContent\` containing all the text needed for the presentation.
2.  **Assemble the Full Deck:** Your output MUST be a single string containing the HTML for all available slides. You must not stop early.
3.  **Conditional Announcement:** Examine the \`slideContent\` object. The template uses Handlebars logic. If the \`announcementTitle\` field is empty or does not exist, the template will automatically OMIT the entire HTML section for the 'Announcement' slide and the 'Announcement' list item from the 'Session Overview' slide. Your job is to correctly apply the data to the template.
4.  **Map Content to Templates:** Use the provided HTML templates for each slide. Populate the placeholders (e.g., \`{{{slideContent.title}}}\`) with the corresponding data from the \`slideContent\` JSON object. Every field from the \`slideContent\` object must be used unless it is part of an omitted optional section.
5.  **Static Slides:** The "Session Overview" (Slide 2) and "Thank You" (Final Slide) slides are static and do not have corresponding data in the JSON object. You must include them in their fixed positions.
6.  **Styling:** Do NOT add or change any CSS classes. The templates are pre-styled with Tailwind CSS.
7.  **OUTPUT FORMAT:** Return a single JSON object with one key, "presentation", which contains the full string of all generated HTML \`<section>\` elements.

**Slide Content to Format:**
\`\`\`json
{{{json slideContent}}}
\`\`\`

---

**FULL PRESENTATION TEMPLATE CODE:**
Use this exact code, populating the placeholders and respecting the conditional announcement logic.

\`\`\`html
<!-- 1. Title Slide -->
<section class="w-full h-full bg-white flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 xl:p-12 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg relative overflow-hidden">
  <div class="absolute top-2 right-2 sm:top-4 sm:right-4 md:top-6 md:right-6 lg:top-8 lg:right-8 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-emerald-100 rounded-xl sm:rounded-2xl rotate-12 opacity-60"></div>
  <div class="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6 lg:bottom-8 lg:left-8 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-emerald-200 rounded-full opacity-40"></div>
  <div class="absolute top-1/3 left-4 sm:left-8 md:left-12 lg:left-16 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-emerald-300 rounded-lg rotate-45 opacity-30"></div>
  <div class="text-center z-10 max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto">
    <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 mb-2 sm:mb-3 md:mb-4 lg:mb-5 leading-tight">{{slideContent.title}}</h1>
    <div class="w-8 sm:w-12 md:w-16 lg:w-20 xl:w-24 h-0.5 sm:h-0.5 md:h-1 bg-emerald-500 mx-auto mb-3 sm:mb-4 md:mb-5 lg:mb-6"></div>
    <p class="text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto mb-3 sm:mb-4 md:mb-5">{{slideContent.subtitle}}</p>
    <p class="text-gray-500 text-xs sm:text-xs md:text-sm">{{slideContent.presenter}}</p>
  </div>
</section>

<!-- 2. Session Overview (STATIC) -->
<section class="w-full h-full bg-white flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 xl:p-12 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg relative overflow-hidden">
  <div class="absolute top-2 right-2 sm:top-4 sm:right-4 md:top-6 md:right-6 lg:top-8 lg:right-8 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-emerald-50 rounded-lg sm:rounded-xl md:rounded-2xl rotate-12 opacity-80"></div>
  <div class="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6 lg:bottom-8 lg:left-8 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-emerald-100 rounded-lg sm:rounded-xl rotate-45 opacity-60"></div>
  <div class="absolute top-1/2 left-4 sm:left-8 md:left-12 lg:left-16 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-emerald-200 rounded-full opacity-40 transform -translate-y-1/2"></div>
  <div class="max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl mx-auto z-10 w-full">
    <div class="mb-4 sm:mb-5 md:mb-6 lg:mb-8 text-center">
      <h2 class="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black text-gray-900 mb-2 sm:mb-3 md:mb-4">SESSION OVERVIEW</h2>
      <p class="text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg mb-2 sm:mb-3 md:mb-4">What we'll cover in today's sales mastery workshop</p>
      <div class="w-8 sm:w-12 md:w-16 lg:w-20 h-0.5 bg-emerald-500 mx-auto"></div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
      <div class="space-y-2 sm:space-y-3 md:space-y-4">
        <div class="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 lg:p-5 bg-emerald-50 rounded-lg sm:rounded-xl md:rounded-2xl hover:bg-emerald-100 transition-colors duration-300">
          <div class="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-emerald-500 rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg">01</span></div>
          <div><h3 class="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold text-gray-900">Work-Related Tip</h3><p class="text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg">Professional workplace strategies</p></div>
        </div>
        <div class="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 lg:p-5 bg-emerald-50 rounded-lg sm:rounded-xl md:rounded-2xl hover:bg-emerald-100 transition-colors duration-300">
          <div class="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-emerald-500 rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg">02</span></div>
          <div><h3 class="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold text-gray-900">General Selling Tip</h3><p class="text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg">Proven rebuttals & sales techniques</p></div>
        </div>
        <div class="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 lg:p-5 bg-emerald-50 rounded-lg sm:rounded-xl md:rounded-2xl hover:bg-emerald-100 transition-colors duration-300">
          <div class="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-emerald-500 rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg">03</span></div>
          <div><h3 class="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold text-gray-900">Featured Service of the Night</h3><p class="text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg">Tonight's special offering</p></div>
        </div>
      </div>
      <div class="space-y-2 sm:space-y-3 md:space-y-4">
        <div class="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 lg:p-5 bg-emerald-50 rounded-lg sm:rounded-xl md:rounded-2xl hover:bg-emerald-100 transition-colors duration-300">
          <div class="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-emerald-500 rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg">04</span></div>
          <div><h3 class="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold text-gray-900">Service FAQ</h3><p class="text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg">Common questions & expert answers</p></div>
        </div>
        {{#if slideContent.announcementTitle}}
        <div class="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 lg:p-5 bg-emerald-50 rounded-lg sm:rounded-xl md:rounded-2xl hover:bg-emerald-100 transition-colors duration-300">
          <div class="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-emerald-500 rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg">05</span></div>
          <div><h3 class="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold text-gray-900">Announcement</h3><p class="text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg">Important updates & reminders</p></div>
        </div>
        {{/if}}
        <div class="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 lg:p-5 bg-emerald-50 rounded-lg sm:rounded-xl md:rounded-2xl hover:bg-emerald-100 transition-colors duration-300">
          <div class="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-emerald-500 rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0"><span class="text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg">06</span></div>
          <div><h3 class="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold text-gray-900">Motivational Quote</h3><p class="text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg">Inspiration for success mindset</p></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 3. Work-Related Tip -->
<section class="w-full h-full bg-white flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 xl:p-12 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg relative overflow-hidden">
  <div class="absolute top-2 right-2 sm:top-4 sm:right-4 md:top-6 md:right-6 lg:top-8 lg:right-8 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-emerald-50 rounded-2xl sm:rounded-3xl rotate-12 opacity-50"></div>
  <div class="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6 lg:bottom-8 lg:left-8 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-emerald-100 rounded-xl sm:rounded-2xl rotate-45 opacity-30"></div>
  <div class="absolute top-1/3 right-1/4 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-emerald-200 rounded-full opacity-25"></div>
  <div class="max-w-xs sm:max-w-lg md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto z-10 w-full">
    <div class="mb-2 sm:mb-3 md:mb-4 text-center">
      <h2 class="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black text-gray-900 mb-1 sm:mb-2">{{slideContent.tipTitle}}</h2>
      <h3 class="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-emerald-600 mb-2 sm:mb-3">{{slideContent.tipIntro}}</h3>
      <div class="w-8 sm:w-12 md:w-16 lg:w-20 h-0.5 bg-emerald-500 mx-auto"></div>
    </div>
    <div class="space-y-2 sm:space-y-3 md:space-y-4">
      <div class="text-center"><p class="text-gray-700 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed max-w-4xl mx-auto">{{slideContent.tipPara1}}</p></div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        <div class="space-y-2 sm:space-y-3"><p class="text-gray-700 text-xs sm:text-sm md:text-base leading-relaxed">{{slideContent.tipPara2}}</p></div>
        <div class="space-y-2 sm:space-y-3">
          <h4 class="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-900">Key Action Items:</h4>
          <ul class="space-y-1 sm:space-y-2">
            {{#each slideContent.tipActionItems}}
            <li class="flex items-start gap-2 sm:gap-3">
              <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1.5 sm:mt-2"></div>
              <p class="text-gray-700 text-xs sm:text-sm md:text-base leading-relaxed">{{this}}</p>
            </li>
            {{/each}}
          </ul>
        </div>
      </div>
      <div class="bg-emerald-50 border-l-4 border-emerald-500 p-2 sm:p-3 md:p-4">
        <div class="flex items-start gap-2 sm:gap-3">
          <div class="w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 rounded-full flex-shrink-0 mt-0.5"></div>
          <div>
            <h4 class="text-xs sm:text-sm md:text-base font-bold text-emerald-700 mb-1">Remember:</h4>
            <p class="text-emerald-700 text-xs sm:text-sm md:text-base leading-relaxed opacity-90">{{slideContent.tipTakeaway}}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 4. Work-Related Tip (Continuation) -->
<section class="w-full h-full bg-white flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 xl:p-12 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg relative overflow-hidden">
  <div class="absolute top-2 right-2 sm:top-4 sm:right-4 md:top-6 md:right-6 lg:top-8 lg:right-8 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-emerald-50 rounded-2xl sm:rounded-3xl rotate-12 opacity-50"></div>
  <div class="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6 lg:bottom-8 lg:left-8 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-emerald-100 rounded-xl sm:rounded-2xl rotate-45 opacity-30"></div>
  <div class="absolute top-1/3 right-1/4 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-emerald-200 rounded-full opacity-25"></div>
  <div class="max-w-xs sm:max-w-lg md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto z-10 w-full">
    <div class="mb-3 sm:mb-4 md:mb-5 text-center">
      <h3 class="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-emerald-600 mb-2 sm:mb-3">{{slideContent.tipContinuationTitle}}</h3>
      <div class="w-8 sm:w-12 md:w-16 lg:w-20 h-0.5 bg-emerald-500 mx-auto"></div>
    </div>
    <div class="space-y-2 sm:space-y-3 md:space-y-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        <div class="space-y-2 sm:space-y-3">
          <p class="text-gray-700 text-xs sm:text-sm md:text-base leading-relaxed">{{slideContent.tipContinuationPara1}}</p>
          <p class="text-gray-700 text-xs sm:text-sm md:text-base leading-relaxed">{{slideContent.tipContinuationPara2}}</p>
          <p class="text-gray-700 text-xs sm:text-sm md:text-base leading-relaxed">{{slideContent.tipContinuationPara3}}</p>
        </div>
        <div class="space-y-2 sm:space-y-3">
          <h4 class="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-900">Implementation Steps:</h4>
          <ul class="space-y-1 sm:space-y-2">
            {{#each slideContent.tipImplementationSteps}}
            <li class="flex items-start gap-2 sm:gap-3">
              <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1.5 sm:mt-2"></div>
              <p class="text-gray-700 text-xs sm:text-sm md:text-base leading-relaxed">{{this}}</p>
            </li>
            {{/each}}
          </ul>
        </div>
      </div>
      <div class="bg-emerald-50 border-l-4 border-emerald-500 p-2 sm:p-3 md:p-4">
        <div class="flex items-start gap-2 sm:gap-3">
          <div class="w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 rounded-full flex-shrink-0 mt-0.5"></div>
          <div>
            <h4 class="text-xs sm:text-sm md:text-base font-bold text-emerald-700 mb-1">Your Next Action:</h4>
            <p class="text-emerald-700 text-xs sm:text-sm md:text-base leading-relaxed opacity-90">{{slideContent.tipNextAction}}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 5. General Selling Tip -->
<section class="w-full h-full bg-white flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 xl:p-12 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg relative overflow-hidden">
  <div class="absolute top-1 left-1 sm:top-2 sm:left-2 md:top-4 md:left-4 lg:top-6 lg:left-6 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-emerald-50 rounded-lg sm:rounded-xl md:rounded-2xl rotate-12 opacity-60"></div>
  <div class="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 md:bottom-6 md:right-6 lg:bottom-8 lg:right-8 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-emerald-100 rounded-full opacity-40"></div>
  <div class="max-w-xs sm:max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto">
    <div class="mb-2 sm:mb-3 md:mb-4 lg:mb-6 text-center">
      <h1 class="text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-black text-emerald-500 mb-1 sm:mb-2 md:mb-3 leading-tight">"{{slideContent.objection}}"</h1>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
      <div class="space-y-1 sm:space-y-2 md:space-y-3">
        <div class="mb-1 sm:mb-2"><h2 class="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold text-emerald-600 mb-0.5 sm:mb-1">Agent's Rebuttal:</h2></div>
        <div class="bg-gradient-to-br from-emerald-50 to-emerald-100 p-2 sm:p-3 md:p-4 lg:p-5 rounded-lg sm:rounded-xl md:rounded-2xl relative overflow-hidden">
          <div class="absolute top-2 right-2 sm:top-3 sm:right-3 w-6 h-6 sm:w-8 sm:h-8 bg-emerald-200 rounded-md sm:rounded-lg rotate-12 opacity-50"></div>
          <div class="relative z-10"><p class="text-gray-800 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed font-medium">"{{slideContent.rebuttal}}"</p></div>
        </div>
      </div>
      <div class="space-y-1 sm:space-y-2 md:space-y-3">
        <div class="mb-1 sm:mb-2"><h2 class="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold text-emerald-600 mb-0.5 sm:mb-1">Why This Works:</h2></div>
        <div class="space-y-1 sm:space-y-2 md:space-y-3">
          <div class="flex items-start gap-1 sm:gap-2 md:gap-3">
            <div class="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><div class="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-white rounded-full"></div></div>
            <div><p class="text-gray-700 text-xs sm:text-xs md:text-sm leading-relaxed">{{slideContent.rebuttalWhy1}}</p></div>
          </div>
          <div class="flex items-start gap-1 sm:gap-2 md:gap-3">
            <div class="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><div class="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-white rounded-full"></div></div>
            <div><p class="text-gray-700 text-xs sm:text-xs md:text-sm leading-relaxed">{{slideContent.rebuttalWhy2}}</p></div>
          </div>
          <div class="flex items-start gap-1 sm:gap-2 md:gap-3">
            <div class="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><div class="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-white rounded-full"></div></div>
            <div><p class="text-gray-700 text-xs sm:text-xs md:text-sm leading-relaxed">{{slideContent.rebuttalWhy3}}</p></div>
          </div>
          <div class="flex items-start gap-1 sm:gap-2 md:gap-3">
            <div class="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><div class="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-white rounded-full"></div></div>
            <div><p class="text-gray-700 text-xs sm:text-xs md:text-sm leading-relaxed">{{slideContent.rebuttalWhy4}}</p></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 6. Featured Service of the Night -->
<section class="w-full h-full bg-white flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 xl:p-12 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg relative overflow-hidden">
  <div class="absolute top-2 right-2 sm:top-4 sm:right-4 md:top-6 md:right-6 lg:top-8 lg:right-8 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-emerald-50 rounded-2xl sm:rounded-3xl rotate-12 opacity-60"></div>
  <div class="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6 lg:bottom-8 lg:left-8 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-emerald-100 rounded-xl sm:rounded-2xl rotate-45 opacity-40"></div>
  <div class="absolute top-1/3 left-4 sm:left-8 md:left-12 lg:left-16 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-emerald-200 rounded-full opacity-30"></div>
  <div class="absolute bottom-1/3 right-4 sm:right-8 md:right-12 lg:right-16 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-emerald-300 rounded-lg rotate-12 opacity-25"></div>
  <div class="absolute top-2/3 left-1/4 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-emerald-400 rounded-full opacity-20"></div>
  <div class="mx-auto text-center relative z-10">
    <h2 class="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black text-gray-900 mb-4 sm:mb-6 md:mb-8 lg:mb-10">{{slideContent.featuredServiceTitle}}</h2>
    <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-emerald-600 leading-tight">{{slideContent.featuredServiceName}}</h1>
  </div>
</section>

<!-- 7. Service FAQ -->
<section class="w-full h-full bg-white flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 xl:p-12 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg relative overflow-hidden">
  <div class="absolute top-2 right-2 sm:top-4 sm:right-4 md:top-6 md:right-6 lg:top-8 lg:right-8 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-emerald-50 rounded-2xl sm:rounded-3xl rotate-12 opacity-60"></div>
  <div class="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6 lg:bottom-8 lg:left-8 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-emerald-100 rounded-xl sm:rounded-2xl rotate-45 opacity-40"></div>
  <div class="max-w-xs sm:max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto">
    <div class="mb-4 sm:mb-6 md:mb-8 text-center">
      <h1 class="text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-black text-emerald-500 mb-3 sm:mb-4 md:mb-5 leading-tight">"{{slideContent.faqQuestion}}"</h1>
    </div>
    <div class="flex-1 flex items-center">
      <div class="w-full">
        <div class="mb-3 sm:mb-4 md:mb-6"><h2 class="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold text-emerald-600 mb-2 sm:mb-3">Agent's Answer:</h2></div>
        <div class="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 sm:p-5 md:p-6 lg:p-8 rounded-lg sm:rounded-xl md:rounded-2xl relative overflow-hidden">
          <div class="absolute top-3 right-3 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-emerald-200 rounded-lg rotate-12 opacity-50"></div>
          <div class="relative z-10"><p class="text-gray-800 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed font-medium">"{{slideContent.faqAnswer}}"</p></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 8. Announcement -->
{{#if slideContent.announcementTitle}}
<section class="w-full h-full bg-white flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 xl:p-12 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg relative overflow-hidden">
  <div class="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 lg:top-12 lg:right-12 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-emerald-50 rounded-full opacity-30"></div>
  <div class="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8 lg:bottom-12 lg:left-12 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-emerald-100 rounded-full opacity-40"></div>
  <div class="absolute top-1/2 right-8 sm:right-12 md:right-16 lg:right-20 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-emerald-200 rounded-full opacity-25 transform -translate-y-1/2"></div>
  <div class="absolute bottom-1/3 left-8 sm:left-12 md:left-16 lg:left-20 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-emerald-300 rounded-full opacity-20"></div>
  <div class="max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto text-center z-10">
    <div class="mb-3 sm:mb-4 md:mb-6"><p class="text-gray-500 text-xs sm:text-sm md:text-base font-medium tracking-wide">{{slideContent.announcementHeader}}</p></div>
    <div class="mb-4 sm:mb-6 md:mb-8">
      <h1 class="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black text-emerald-500 mb-3 sm:mb-4 md:mb-5 leading-tight">{{slideContent.announcementTitle}}</h1>
    </div>
    <div class="max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-xl mx-auto mb-4 sm:mb-6 md:mb-8">
      <p class="text-gray-700 text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed mb-3 sm:mb-4 md:mb-5">{{slideContent.announcementContent}}</p>
    </div>
    <div class="bg-emerald-50 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl border border-emerald-100">
      <p class="text-gray-800 text-xs sm:text-sm md:text-base font-medium">{{slideContent.announcementClosing}}</p>
    </div>
  </div>
</section>
{{/if}}

<!-- 9. Motivational Quote -->
<section class="w-full h-full bg-white flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg relative overflow-hidden">
  <div class="absolute top-4 left-4 sm:top-8 sm:left-8 md:top-12 md:left-12 lg:top-20 lg:left-20 w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-56 lg:h-56 bg-emerald-50 rounded-full opacity-60"></div>
  <div class="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 md:bottom-12 md:right-12 lg:bottom-20 lg:right-20 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-emerald-100 rounded-2xl sm:rounded-3xl rotate-12 opacity-70"></div>
  <div class="absolute top-1/2 right-8 sm:right-12 md:right-16 lg:right-32 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-emerald-200 rounded-xl sm:rounded-2xl rotate-45 opacity-50"></div>
  <div class="max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl mx-auto text-center z-10">
    <div class="mb-6 sm:mb-8 md:mb-10 lg:mb-12">
      <div class="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-emerald-200 font-black mb-3 sm:mb-4 md:mb-5 lg:mb-6 leading-none">"</div>
      <blockquote class="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light text-gray-800 leading-relaxed mb-4 sm:mb-6 md:mb-8">{{slideContent.quote}}</blockquote>
      <div class="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-emerald-200 font-black transform rotate-180 leading-none">"</div>
    </div>
    <div class="mt-6 sm:mt-8 md:mt-10">
      <p class="text-gray-600 text-sm sm:text-base md:text-lg font-medium">— {{slideContent.author}}</p>
      <div class="w-12 sm:w-16 md:w-20 lg:w-24 h-0.5 sm:h-1 bg-emerald-500 mx-auto mt-3 sm:mt-4"></div>
    </div>
  </div>
</section>

<!-- 10. Thank You Slide (STATIC) -->
<section class="w-full h-full bg-emerald-700 flex items-center justify-center rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg relative overflow-hidden">
  <div class="absolute top-2 right-2 sm:top-4 sm:right-4 md:top-6 md:right-6 lg:top-10 lg:right-10 w-40 h-40 sm:w-50 sm:h-50 md:w-60 md:h-60 lg:w-80 lg:h-80 bg-emerald-600 rounded-full opacity-20"></div>
  <div class="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6 lg:bottom-10 lg:left-10 w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 lg:w-64 lg:h-64 bg-emerald-800 rounded-2xl sm:rounded-3xl rotate-12 opacity-30"></div>
  <div class="absolute top-1/2 left-4 sm:left-8 md:left-12 lg:left-20 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-emerald-500 rounded-xl sm:rounded-2xl rotate-45 opacity-40"></div>
  <div class="text-center text-white z-10 max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl px-4 sm:px-6 md:px-8">
    <div class="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-white bg-opacity-20 rounded-xl sm:rounded-2xl mx-auto mb-6 sm:mb-8 md:mb-10 lg:mb-12 flex items-center justify-center">
      <div class="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white rounded-md sm:rounded-lg"></div>
    </div>
    <h2 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-4 sm:mb-6 md:mb-8">THANK<br class="hidden sm:block">YOU</h2>
    <div class="w-16 sm:w-20 md:w-24 lg:w-32 h-0.5 sm:h-1 bg-white mx-auto mb-4 sm:mb-6 md:mb-8"></div>
    <p class="text-emerald-100 text-sm sm:text-base md:text-lg mb-4 sm:mb-6">Your journey to sales excellence starts today</p>
    <div class="text-emerald-200 text-xs sm:text-sm"><p>Ready to get started? Let's connect!</p></div>
  </div>
</section>
\`\`\`
`,
});

const generatePresentationFlow = ai.defineFlow(
  {
    name: 'generatePresentationFlow',
    inputSchema: GeneratePresentationInputSchema,
    outputSchema: GeneratePresentationOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) {
        throw new Error('AI failed to generate presentation HTML. The output was empty.');
      }
      return output;
    } catch (error) {
      console.error('Error in generatePresentationFlow:', error);
      // Re-throw a more user-friendly error or handle it as needed
      throw new Error(`Failed to generate the presentation. Please try again. Details: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
);
