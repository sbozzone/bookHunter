'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import AIRecommender from '@/components/ai-recommender';
import Watchlist from '@/components/watchlist';
import { WatchlistProvider, useWatchlist } from '@/components/watchlist-provider';
import { AboutDialog } from '@/components/about-dialog';
import { BookMarked, Sparkles, Settings } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { SettingsProvider } from '../settings-provider';
import { APP_VERSION } from '@/lib/version';

function SidebarContentWithState() {
  const { watchlist, removeFromWatchlist } = useWatchlist();
  return (
    <>
      {/* About + Settings live at the top so the mobile keyboard never hides them. */}
      <SidebarGroup className="py-1">
        <AboutDialog />
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/settings" className="flex items-center gap-2">
            <Settings className="size-4" />
            <span>Settings</span>
          </Link>
        </Button>
      </SidebarGroup>
      <Separator />
      <SidebarGroup>
        <SidebarGroupLabel className="flex items-center gap-2">
          <Sparkles className="size-4" />
          Find Similar Books
        </SidebarGroupLabel>
        <AIRecommender />
      </SidebarGroup>
      <Separator />
      <Watchlist
        watchlist={watchlist}
        removeFromWatchlist={removeFromWatchlist}
      />
    </>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <WatchlistProvider>
        <SidebarProvider defaultOpen={true}>
          <Sidebar>
            <SidebarHeader>
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-sm">
                  <BookMarked className="size-5 text-primary-foreground" />
                </div>
                <h1 className="text-lg font-bold leading-tight font-headline">
                  The Budget Book Hunter
                </h1>
              </Link>
            </SidebarHeader>
            <SidebarContent className="p-0">
               <SidebarContentWithState />
            </SidebarContent>
            <SidebarFooter>
               <Separator className="mb-2" />
              <p className="text-xs text-muted-foreground text-center">
                © 2026 The Budget Book Hunter · v{APP_VERSION}
              </p>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </WatchlistProvider>
    </SettingsProvider>
  );
}
