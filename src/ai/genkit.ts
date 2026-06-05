import {genkit} from 'genkit';
import {anthropic} from '@genkit-ai/anthropic';

export const ai = genkit({
  plugins: [anthropic()],
  model: 'anthropic/claude-sonnet-4-5',
});
