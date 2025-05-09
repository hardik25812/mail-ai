"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Plus, Mail, Check, Clock, BarChart3, MoreHorizontal, Search, Loader2, Sparkles } from "lucide-react"
import { AnimatedButton } from "@/components/ui/animated-button"
import { AnimatedCard } from "@/components/ui/animated-card"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ToggleSwitch } from "@/components/ui/toggle-switch"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useInboxes, useWorkspaces } from "@/lib/hooks/useApi"
import { EmailThreadList } from "@/components/email-thread-list"
import { toast } from "sonner"

export default function InboxPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { inboxes, loading, error, refetch } = useInboxes();
  const { workspaces } = useWorkspaces();

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Filter inboxes based on search query
  const filteredInboxes = inboxes?.filter(
    (inbox) =>
      inbox.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inbox.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Handle connect new inbox
  const handleConnectInbox = () => {
    toast.info("Connect inbox feature coming soon");
  };

  // Handle toggle inbox active state
  const handleToggleInbox = (inboxId: string, isActive: boolean) => {
    toast.info(`Inbox ${isActive ? 'activated' : 'deactivated'}`); 
    // In a real implementation, you would call an API to update the inbox status
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="p-6">
        <h1 className="text-3xl font-bold tracking-tight">Inbox Manager</h1>
        <p className="text-muted-foreground">Manage your connected email inboxes and settings.</p>
      </motion.div>

      <motion.div variants={item} className="px-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inboxes..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <AnimatedButton gradient onClick={handleConnectInbox}>
            <Plus className="mr-2 h-4 w-4" /> Connect New Inbox
          </AnimatedButton>
        </div>
      </motion.div>

      {loading && (
        <motion.div variants={item} className="p-6 flex justify-center">
          <div className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading inboxes...</p>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div variants={item} className="p-6">
          <Card className="border-destructive">
            <CardContent className="p-6 text-center">
              <p className="text-destructive mb-4">Failed to load inboxes. Please try again.</p>
              <AnimatedButton variant="outline" onClick={() => refetch()}>
                Retry
              </AnimatedButton>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {!loading && !error && (
        <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-6">
          {filteredInboxes.map((inbox, index) => {
            // Find the workspace for this inbox
            const workspace = workspaces?.find(w => w.id === inbox.workspace_id);
            const isConnectedToBison = workspace?.is_connected || false;
            
            return (
              <AnimatedCard key={inbox.id} delay={0.1 * (index + 1)} className="hover-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{inbox.name}</CardTitle>
                      {isConnectedToBison && (
                        <Badge className="mt-1 bg-green-100 text-green-800 hover:bg-green-200">
                          <Sparkles className="mr-1 h-3 w-3" />
                          Bison Connected
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <ToggleSwitch
                        checked={inbox.active !== false}
                        onCheckedChange={(checked) => handleToggleInbox(inbox.id, checked)}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <AnimatedButton variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </AnimatedButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link href={`/settings/inboxes/${inbox.id}`} className="w-full">
                              Edit Inbox
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.info("Syncing inbox...")}>Sync Now</DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href={`/settings/ai-config?inbox=${inbox.id}`} className="w-full">
                              Configure AI
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => toast.error("This would disconnect the inbox")}>Disconnect</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardDescription>{inbox.email}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-3">
                      <Mail className="mb-2 h-6 w-6 text-primary" />
                      <div className="text-2xl font-bold">{inbox.email_count || 0}</div>
                      <p className="text-xs text-muted-foreground">Total Emails</p>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-3">
                      <Clock className="mb-2 h-6 w-6 text-primary" />
                      <div className="text-2xl font-bold">{inbox.unread_count || 0}</div>
                      <p className="text-xs text-muted-foreground">Unread</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <div className="text-sm">AI Replies</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {inbox.ai_reply_count || 0} sent
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      <div className="text-sm">Response Rate</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {inbox.response_rate || 0}%
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Link href={`/inbox/${inbox.id}`} className="flex-1">
                    <AnimatedButton variant="outline" size="sm" className="w-full">
                      View Emails
                    </AnimatedButton>
                  </Link>
                  <Link href={`/inbox/stats/${inbox.id}`} className="flex-1">
                    <AnimatedButton variant="outline" size="sm" className="w-full">
                      <BarChart3 className="mr-2 h-4 w-4" /> Stats
                    </AnimatedButton>
                  </Link>
                </CardFooter>
              </AnimatedCard>
            );
          })}
        </motion.div>
      )}

      {!loading && !error && filteredInboxes.length === 0 && (
        <motion.div variants={item} className="p-6">
          <Card>
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
              <Mail className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No inboxes found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No inboxes match your search query." : "You haven't connected any inboxes yet."}
              </p>
              {searchQuery ? (
                <AnimatedButton variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </AnimatedButton>
              ) : (
                <AnimatedButton gradient onClick={handleConnectInbox}>
                  <Plus className="mr-2 h-4 w-4" /> Connect New Inbox
                </AnimatedButton>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={item} className="p-6">
        <Card className="bg-gradient-to-br from-card to-card/80 border-primary/20">
          <CardHeader>
            <CardTitle>Inbox Management Tips</CardTitle>
            <CardDescription>Get the most out of your connected inboxes with our RAG-powered AI</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-4 rounded-lg border p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">RAG Dynamic Memory</h3>
                <p className="text-sm text-muted-foreground">Our AI learns from past replies to improve future responses</p>
              </div>
              <Link href="/settings/ai-config">
                <AnimatedButton variant="ghost" size="sm">
                  Configure
                </AnimatedButton>
              </Link>
            </div>
            <div className="flex items-center gap-4 rounded-lg border p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Create Email Templates</h3>
                <p className="text-sm text-muted-foreground">Set up templates for common responses</p>
              </div>
              <Link href="/settings/ai-config?tab=templates">
                <AnimatedButton variant="ghost" size="sm">
                  Create
                </AnimatedButton>
              </Link>
            </div>
            <div className="flex items-center gap-4 rounded-lg border p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Review Analytics</h3>
                <p className="text-sm text-muted-foreground">Track performance metrics across all inboxes</p>
              </div>
              <Link href="/analytics">
                <AnimatedButton variant="ghost" size="sm">
                  View
                </AnimatedButton>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
