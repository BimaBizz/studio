'use server';

/**
 * @fileOverview A flow for assigning user roles with validation using generative AI.
 *
 * - assignUserRoleWithValidation - A function that assigns a role to a user, validating the role against organizational structure and naming conventions.
 * - AssignUserRoleWithValidationInput - The input type for the assignUserRoleWithValidation function.
 * - AssignUserRoleWithValidationOutput - The return type for the assignUserRoleWithValidation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssignUserRoleWithValidationInputSchema = z.object({
  userRequestRole: z
    .string()
    .describe('The user-requested role to be assigned. Please provide the roles name.'),
});
export type AssignUserRoleWithValidationInput =
  z.infer<typeof AssignUserRoleWithValidationInputSchema>;

const AssignUserRoleWithValidationOutputSchema = z.object({
  systemRoleId: z
    .string()
    .describe(
      'The validated role ID that aligns with system conventions.  If the role does not exist, create the role and return the role ID. Return the existing role ID if the role already exists.'
    ),
});

export type AssignUserRoleWithValidationOutput =
  z.infer<typeof AssignUserRoleWithValidationOutputSchema>;

export async function assignUserRoleWithValidation(
  input: AssignUserRoleWithValidationInput
): Promise<AssignUserRoleWithValidationOutput> {
  return assignUserRoleWithValidationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assignUserRoleWithValidationPrompt',
  input: {schema: AssignUserRoleWithValidationInputSchema},
  output: {schema: AssignUserRoleWithValidationOutputSchema},
  prompt: `You are an expert in organizational role management.  Your task is to take a user-requested role and convert it to the appropriate system role ID, checking for compliance with organizational structure and naming conventions.

  User-Requested Role: {{{userRequestRole}}}

  Considerations:
  1.  The role must align with the existing organizational structure.
  2.  The role ID should follow established naming conventions.
  3. If the role does not exist, create the role and return the role ID. Return the existing role ID if the role already exists.

  Please provide the validated role ID.
  `,
});

const assignUserRoleWithValidationFlow = ai.defineFlow(
  {
    name: 'assignUserRoleWithValidationFlow',
    inputSchema: AssignUserRoleWithValidationInputSchema,
    outputSchema: AssignUserRoleWithValidationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
