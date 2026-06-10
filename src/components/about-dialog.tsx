'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BookMarked, Info, Sparkles, Library, PiggyBank } from 'lucide-react';
import { APP_VERSION } from '@/lib/version';

const FUN_FACTS = [
  {
    icon: <Library className="h-4 w-4 text-primary" />,
    text: 'The average U.S. library card holder saves hundreds of dollars a year just by borrowing instead of buying.',
  },
  {
    icon: <PiggyBank className="h-4 w-4 text-primary" />,
    text: 'Every book here is checked against 7 sources — 4 of them completely free — before you spend a dime.',
  },
  {
    icon: <Sparkles className="h-4 w-4 text-primary" />,
    text: 'Search runs on a single fast metadata lookup — no AI in the loop, so results land in under a second.',
  },
];

export function AboutDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start" aria-label="About this app">
          <span className="flex items-center gap-2">
            <Info className="size-4" />
            <span>About</span>
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader className="items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
            <BookMarked className="h-7 w-7 text-primary-foreground" />
          </div>
          <DialogTitle className="font-headline text-xl">The Budget Book Hunter</DialogTitle>
          <DialogDescription>
            Find your next great read — for less.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1 text-center text-sm">
          <p>
            <span className="text-muted-foreground">Version</span>{' '}
            <span className="font-mono font-medium">{APP_VERSION}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Created by:</span>{' '}
            <span className="font-medium">Stephen Bozzone</span>
          </p>
        </div>
        <div className="space-y-2.5 rounded-lg border border-border/60 bg-muted/30 p-3.5">
          {FUN_FACTS.map((fact, i) => (
            <p key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="mt-0.5 shrink-0">{fact.icon}</span>
              {fact.text}
            </p>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground/70">
          Happy hunting — the best book is the one you didn&apos;t pay full price for.
        </p>
      </DialogContent>
    </Dialog>
  );
}
