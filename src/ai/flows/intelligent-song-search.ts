'use server';
/**
 * @fileOverview This file implements a Genkit flow for intelligently searching and identifying songs.
 *
 * - intelligentSongSearch - A function that identifies a song based on a user's query.
 * - IntelligentSongSearchInput - The input type for the intelligentSongSearch function.
 * - IntelligentSongSearchOutput - The return type for the intelligentSongSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentSongSearchInputSchema = z
  .string()
  .describe(
    'The user\'s song request, which can include lyrics, a partial name, or a description of the melody.'
  );
export type IntelligentSongSearchInput = z.infer<
  typeof IntelligentSongSearchInputSchema
>;

const IntelligentSongSearchOutputSchema = z.object({
  isIdentified: z
    .boolean()
    .describe('True if a song was successfully identified, false otherwise.'),
  songTitle: z
    .string()
    .optional()
    .describe('The identified song title, if a song was identified.'),
  artist: z
    .string()
    .optional()
    .describe('The artist of the identified song, if a song was identified.'),
  reasoning: z
    .string()
    .optional()
    .describe(
      'Explanation for the identified song or why a song could not be found.'
    ),
});
export type IntelligentSongSearchOutput = z.infer<
  typeof IntelligentSongSearchOutputSchema
>;

export async function intelligentSongSearch(
  input: IntelligentSongSearchInput
): Promise<IntelligentSongSearchOutput> {
  return intelligentSongSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentSongSearchPrompt',
  input: {schema: IntelligentSongSearchInputSchema},
  output: {schema: IntelligentSongSearchOutputSchema},
  prompt: `You are an intelligent music identification bot named SITHU MD. Your goal is to identify songs based on various clues like lyrics, partial names, or descriptions of melodies. 

Carefully analyze the user's query and try to identify the song with high confidence. 

If you can confidently identify a song, provide its title and artist, and set 'isIdentified' to true. If you cannot confidently identify a song, set 'isIdentified' to false and provide a reason why you couldn't identify it or suggest what might help in identification.

Query: {{{query}}}`,
});

const intelligentSongSearchFlow = ai.defineFlow(
  {
    name: 'intelligentSongSearchFlow',
    inputSchema: IntelligentSongSearchInputSchema,
    outputSchema: IntelligentSongSearchOutputSchema,
  },
  async input => {
    const {output} = await prompt({query: input});
    return output!;
  }
);
