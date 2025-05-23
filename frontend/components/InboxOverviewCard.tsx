// components/InboxOverviewCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox } from "lucide-react";

type Props = { name: string; unread: number; total: number };

export function InboxOverviewCard({ name, unread, total }: Props) {
  const pctUnread = total > 0 ? ((unread / total) * 100).toFixed(1) : "0.0";
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium truncate max-w-[calc(100%-2rem)]" title={name}>{name}</CardTitle>
        <Inbox className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-1 pt-2">
        <p className="text-2xl font-bold">{total.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">
          {unread.toLocaleString()} unread &bull; {pctUnread}%
        </p>
      </CardContent>
    </Card>
  );
}
