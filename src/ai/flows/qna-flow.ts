
'use server';

/**
 * @fileOverview A Q&A flow that answers questions based on data from Firestore.
 *
 * - answerQuestion - A function that takes a user's question and provides an answer using data from the database.
 * - AnswerQuestionInput - The input type for the answerQuestion function.
 * - AnswerQuestionOutput - The return type for the answerQuestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AnswerQuestionInputSchema = z.object({
  question: z.string().describe('The user\'s question about the data.'),
});
export type AnswerQuestionInput = z.infer<typeof AnswerQuestionInputSchema>;

const AnswerQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the user\'s question.'),
});
export type AnswerQuestionOutput = z.infer<typeof AnswerQuestionOutputSchema>;

// Define a tool for the AI to get all data from a Firestore collection
const firestoreTool = ai.defineTool(
  {
    name: 'getCollectionData',
    description: 'Retrieves all documents from a specified Firestore collection. Use this to get data about users, teams, schedules, attendance, spare parts, or drive files.',
    inputSchema: z.object({
      collectionName: z.enum(['users', 'teams', 'schedules', 'attendance', 'spareParts', 'driveFiles']).describe("The name of the collection to fetch data from."),
    }),
    outputSchema: z.any(),
  },
  async ({ collectionName }) => {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      return `Error fetching data for ${collectionName}.`;
    }
  }
);

export async function answerQuestion(input: AnswerQuestionInput): Promise<AnswerQuestionOutput> {
  return qnaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'qnaPrompt',
  input: { schema: AnswerQuestionInputSchema },
  output: { schema: AnswerQuestionOutputSchema },
  tools: [firestoreTool],
  prompt: `You are an intelligent assistant for the TechFlow application.
Your role is to answer questions based on the data available in the Firestore database.
Use the 'getCollectionData' tool to fetch information when needed.
Analyze the user's question, determine which collection(s) to query, and use the retrieved data to formulate a clear and concise answer.

User Question: {{{question}}}

Based on the data, provide a direct answer.
If the data is insufficient to answer the question, state that you don't have enough information.
Answer in Indonesian language.
`,
});

const qnaFlow = ai.defineFlow(
  {
    name: 'qnaFlow',
    inputSchema: AnswerQuestionInputSchema,
    outputSchema: AnswerQuestionOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
