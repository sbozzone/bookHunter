'use client';

import type { ReactNode } from 'react';
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
import { BookMarked, Rss } from 'lucide-react';
import { Separator } from '../ui/separator';

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
    </>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <WatchlistProvider>
      <SidebarProvider defaultOpen={true}>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <BookMarked className="size-8 text-primary" />
              <h1 className="text-2xl font-bold font-headline">Bibliosleuth</h1>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-0">
             <SidebarContentWithState />
          </SidebarContent>
          <SidebarFooter>
            <p className="text-xs text-muted-foreground text-center">© 2024 Bibliosleuth</p>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </WatchlistProvider>
  );
}
