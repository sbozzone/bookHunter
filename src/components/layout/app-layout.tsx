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
import { BookMarked, Rss, Settings } from 'lucide-react';
import { Separator } from '../ui/separator';
import { ThemeSelector } from '../theme-selector';

function SidebarContentWithState() {
  const { watchlist, removeFromWatchlist } = useWatchlist();
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel className="flex items-center gap-2">
          <Rss className="size-4" />
          AI Recommendations
        </SidebarGroupLabel>
        <AIRecommender />
      </SidebarGroup>
      <Separator />
      <Watchlist
        watchlist={watchlist}
        removeFromWatchlist={removeFromWatchlist}
      />
      <Separator />
      <SidebarGroup>
        <SidebarGroupLabel className="flex items-center gap-2">
          <Settings className="size-4" />
          Settings
        </SidebarGroupLabel>
        <div className="px-2">
            <p className="text-xs text-muted-foreground mb-2">Color Theme</p>
            <ThemeSelector />
        </div>
      </SidebarGroup>
    </>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <WatchlistProvider>
      <SidebarProvider defaultOpen={true}>
        <Sidebar>
          <SidebarHeader>
            <Link href="/" className="flex items-center gap-2">
              <BookMarked className="size-8 text-primary" />
              <h1 className="text-xl font-bold font-headline">The Budget Book Hunter</h1>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-0">
             <SidebarContentWithState />
          </SidebarContent>
          <SidebarFooter>
            <p className="text-xs text-muted-foreground text-center">© 2024 The Budget Book Hunter</p>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </WatchlistProvider>
  );
}
