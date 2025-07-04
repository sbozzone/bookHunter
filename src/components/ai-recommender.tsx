'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { getSuggestions } from '@/app/actions';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, LoaderCircle } from 'lucide-react';

const initialState = {
  message: null,
  suggestions: [],
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Thinking...
        </>
      ) : 'Get Suggestions'}
    </Button>
  );
}

export default function AIRecommender() {
  const [state, formAction] = useActionState(getSuggestions, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-2">
        <Input
          name="query"
          placeholder="e.g., 'Dune' or 'Stephen King'"
          required
          className="bg-background"
        />
        <SubmitButton />
      </form>
      {state.suggestions && state.suggestions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Suggestions:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {state.suggestions.map((suggestion: string, index: number) => (
              <li key={index} className="flex items-start">
                <Sparkles className="w-3 h-3 mr-2 mt-1 text-primary shrink-0"/>
                <Link
                  href={`/?q=${encodeURIComponent(suggestion)}`}
                  className="hover:underline hover:text-foreground"
                >
                  {suggestion}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
