"use client"

import { useState, Suspense, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useSearchParams, usePathname } from "next/navigation"
import { Mail, Calendar, Users, Plus, Inbox as InboxIcon, CheckCircle, Clock, BarChart3, Settings, Brain, Save, ChevronDown, ChevronRight } from "lucide-react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { ToggleSwitch } from "@/components/ui/toggle-switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useInboxesQuery } from "@/hooks/useInboxesQuery";
import type { Inbox } from "@/lib/schemas"; // Import the Inbox type
import { EmailBisonImport } from "@/components/email-bison-import"
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { InboxOverviewCard } from "@/components/InboxOverviewCard";
import { EmailVolumeAreaChart, type EmailVolumeDataPoint } from "@/components/EmailVolumeAreaChart";
import { ResponseRateGauge } from "@/components/ResponseRateGauge";
import { TopContactsTable, type ContactData } from "@/components/TopContactsTable";
import { CategoryDonutChart, type CategoryDataPoint } from "@/components/CategoryDonutChart";

export default function DashboardPage() {
  const { data: inboxes = [], isLoading: loading, error, refetch } = useInboxesQuery({
    refetchInterval: 30000, // Refresh dashboard stats every 30 seconds
  });
  const [activeTab, setActiveTab] = useState("dashboard")
  const [inboxesExpanded, setInboxesExpanded] = useState(true)
  const searchParams = useSearchParams()
  const pathname = usePathname()

  useEffect(() => {
    // Check if there's a tab parameter in the URL
    const tabParam = searchParams.get("tab")
    if (tabParam) {
      setActiveTab(tabParam)
    } else {
      setActiveTab("dashboard")
    }
  }, [searchParams])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  // Calculate total statistics across all inboxes using real data
  // Calculate total statistics across all inboxes using real data
  // Ensure properties exist and default to 0 if not
  const totalEmails = inboxes.reduce((sum: number, inbox: Inbox) => sum + (inbox.total_count ?? 0), 0);
  const totalUnread = inboxes.reduce((sum: number, inbox: Inbox) => sum + (inbox.unread_count ?? 0), 0);
  const activeInboxes = inboxes.filter((inbox: Inbox) => inbox.status === 'active').length;

  
  // We may not have these metrics from Email Bison API yet, so use placeholders
  const avgResponseRate = 85 // Placeholder until we have real data

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <motion.div variants={item} className="p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Mail AI</h1>
              <p className="text-muted-foreground">Manage your inbox efficiently with AI assistance</p>
            </div>
            <TabsList>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="ai-settings" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Settings
              </TabsTrigger>
            </TabsList>
          </div>
        </motion.div>

        {/* Dashboard Tab Content */}
        <TabsContent value="dashboard" className="mt-0">
          {loading ? (
            <motion.div variants={item} className="p-6 flex justify-center">
              <div className="flex flex-col items-center justify-center p-8">
                <LoadingSpinner size="lg" />
                <p className="text-muted-foreground mt-4">Loading inbox data...</p>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div variants={item} className="p-6">
              <Card className="border-destructive">
                <CardContent className="p-6 text-center">
                  <p className="text-destructive mb-4">Failed to load inbox data. Please try again.</p>
                  <AnimatedButton variant="outline" onClick={() => refetch()}>
                    Retry
                  </AnimatedButton>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <>
            <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-6">
              <AnimatedCard delay={0.1}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalEmails.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Across all connected inboxes</p>
                </CardContent>
              </AnimatedCard>

              <AnimatedCard delay={0.2}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Unread Emails</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUnread}</div>
                  <p className="text-xs text-muted-foreground">Waiting for response</p>
                </CardContent>
              </AnimatedCard>

              <AnimatedCard delay={0.3}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Active Inboxes</CardTitle>
                  <InboxIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeInboxes}</div>
                  <p className="text-xs text-muted-foreground">Connected and syncing</p>
                </CardContent>
              </AnimatedCard>
            </motion.div>
            {/* --- BEGIN NEW CHARTS SECTION --- */}
            <motion.div variants={item} className="grid gap-4 md:grid-cols-2 p-6 pt-0">
              <AnimatedCard delay={0.4}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Email Volume</CardTitle>
                  <CardDescription>Recent email activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <EmailVolumeAreaChart data={inboxes[0]?.emails_by_day?.map((d: any) => ({date: d.day, count: d.count})) || [{date: "N/A", count: 0}]} />
                </CardContent>
              </AnimatedCard>
              <AnimatedCard delay={0.5}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                  <CardDescription>Response rate and time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponseRateGauge rate={inboxes[0]?.response_rate || 0} avgTime={inboxes[0]?.avg_response_time || 0} />
                </CardContent>
              </AnimatedCard>
            </motion.div>
            {/* --- END NEW CHARTS SECTION --- */}
          <motion.div variants={item} className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Connected Inboxes - Quick Overview</h2>
              <AnimatedButton gradient size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Inbox
              </AnimatedButton>
            </div>
            
            {/* Inbox Navigation Feature */}
            {/* Quick Inbox Overview Cards */}
            {!loading && !error && inboxes && inboxes.length > 0 && (
              <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                {inboxes.map((inbox: Inbox, index: number) => (
                  <InboxOverviewCard 
                    key={inbox.id} 
                    name={inbox.name || inbox.email}
                    unread={inbox.unread_count || 0}
                    total={inbox.total_count || 0}
                  />
                ))}
              </motion.div>
            )}
            <div className="mt-4 border rounded-lg p-4 bg-card">
              <button 
                onClick={() => setInboxesExpanded(!inboxesExpanded)}
                className="flex items-center gap-2 p-2 w-full text-left hover:bg-accent rounded-md"
              >
                {inboxesExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <InboxIcon className="h-5 w-5" />
                <span>Inboxes</span>
              </button>
              
              {inboxesExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {loading ? (
                    <div className="flex items-center justify-center p-4">
                      <LoadingSpinner size="sm" />
                    </div>
                  ) : error ? (
                    <p className="text-sm text-destructive p-2">Failed to load inboxes</p>
                  ) : inboxes && inboxes.length > 0 ? (
                    inboxes.map((inbox: Inbox) => (
                      <Link
                        key={inbox.id}
                        href={`/inbox/${inbox.id}`}
                        className={`block p-2 rounded-md text-sm ${
                          pathname === `/inbox/${inbox.id}` 
                            ? 'bg-primary/10 text-primary' 
                            : 'hover:bg-accent'
                        }`}
                      >
                        - {inbox.name || inbox.email}
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground p-2">No inboxes found</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-6">
            {loading ? (
              <div className="col-span-3 flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="col-span-3">
                <Card className="border-destructive">
                  <CardContent className="p-6 text-center">
                    <p className="text-destructive mb-4">Failed to load inboxes. Please try again.</p>
                    <AnimatedButton variant="outline" onClick={() => refetch()}>
                      Retry
                    </AnimatedButton>
                  </CardContent>
                </Card>
              </div>
            ) : inboxes && inboxes.length > 0 ? (
              inboxes.map((inbox: Inbox, index: number) => (
                <AnimatedCard key={inbox.id} delay={0.1 * (index + 1)} className="hover-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{inbox.name || 'Unnamed Inbox'}</CardTitle>
                      <ToggleSwitch
                        checked={inbox.status === 'active'}
                        onCheckedChange={() => console.log(`Toggle inbox ${inbox.id} status`)}
                      />
                    </div>
                    <CardDescription>{inbox.email}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <InboxIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{inbox.total_count || 0} emails</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{inbox.unread_count || 0} unread</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Status: {inbox.status || 'unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Last sync: {new Date(inbox.last_synced_at || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Link href={`/inbox/${inbox.id}`}>
                      <AnimatedButton variant="outline" size="sm">
                        <Mail className="mr-2 h-4 w-4" /> View Inbox
                      </AnimatedButton>
                    </Link>
                    <Link href={`/analytics?inbox=${inbox.id}`}>
                      <AnimatedButton variant="outline" size="sm">
                        <BarChart3 className="mr-2 h-4 w-4" /> View Stats
                      </AnimatedButton>
                    </Link>
                  </CardFooter>
                </AnimatedCard>
              ))
            ) : (
              <div className="col-span-3">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">No inboxes found</p>
                    <p className="text-muted-foreground mb-4">Connect your first email inbox to get started</p>
                    <AnimatedButton gradient>
                      <Plus className="mr-2 h-4 w-4" /> Connect Inbox
                    </AnimatedButton>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>

          {/* --- BEGIN NEW TABLES/CHARTS SECTION --- */}
          {!loading && !error && inboxes && inboxes.length > 0 && (
            <motion.div variants={item} className="grid gap-4 md:grid-cols-2 p-6">
              <AnimatedCard delay={0.6}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Top Contacts</CardTitle>
                  <CardDescription>Most frequent interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <TopContactsTable contacts={inboxes[0]?.top_contacts || []} />
                </CardContent>
              </AnimatedCard>
              <AnimatedCard delay={0.7}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Email Categories</CardTitle>
                  <CardDescription>Distribution of email types</CardDescription>
                </CardHeader>
                <CardContent>
                  <CategoryDonutChart data={inboxes[0]?.categories || []} />
                </CardContent>
              </AnimatedCard>
            </motion.div>
          )}
          {/* --- END NEW TABLES/CHARTS SECTION --- */}

          {/* Email Bison Import Section */}
          
          <motion.div variants={item} className="p-6">
            <h2 className="text-xl font-bold tracking-tight mb-4">Email Bison Integration</h2>
            <Suspense fallback={<div className="w-full flex justify-center p-12"><LoadingSpinner size="lg" /></div>}>
              <EmailBisonImport />
            </Suspense>
          </motion.div>

          <motion.div variants={item} className="p-6">
            <Card className="bg-gradient-to-br from-card to-card/80 border-primary/20">
              <CardHeader>
                <CardTitle>Complete Your Setup</CardTitle>
                <CardDescription>Finish setting up your account to get the most out of InboxAI</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center gap-4 rounded-lg border p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Connect Gmail</h3>
                    <p className="text-sm text-muted-foreground">
                      Connected {inboxes.length} of {inboxes.length + 1} accounts
                    </p>
                  </div>
                  <AnimatedButton variant="ghost" size="sm">
                    Add More
                  </AnimatedButton>
                </div>
                <div className="flex items-center gap-4 rounded-lg border p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Connect Calendar</h3>
                    <p className="text-sm text-muted-foreground">Connected {inboxes.length} calendars</p>
                  </div>
                  <AnimatedButton variant="ghost" size="sm">
                    Add More
                  </AnimatedButton>
                </div>
                <div className="flex items-center gap-4 rounded-lg border p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Invite Team Members</h3>
                    <p className="text-sm text-muted-foreground">Collaborate with your team</p>
                  </div>
                  <AnimatedButton variant="outline" size="sm">
                    Invite
                  </AnimatedButton>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          </>
          )}
        </TabsContent>

        {/* Settings Tab Content */}
        <TabsContent value="settings" className="mt-0">
          <motion.div variants={item} className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences and notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Profile Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" defaultValue="john@example.com" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Preferences</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive notifications when new emails arrive</p>
                      </div>
                      <ToggleSwitch checked={true} onCheckedChange={() => {}} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Weekly Reports</p>
                        <p className="text-sm text-muted-foreground">Receive weekly email summary reports</p>
                      </div>
                      <ToggleSwitch checked={true} onCheckedChange={() => {}} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Meeting Reminders</p>
                        <p className="text-sm text-muted-foreground">Get reminders before scheduled meetings</p>
                      </div>
                      <ToggleSwitch checked={true} onCheckedChange={() => {}} />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <AnimatedButton gradient>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </AnimatedButton>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        {/* AI Settings Tab Content */}
        <TabsContent value="ai-settings" className="mt-0">
          <motion.div variants={item} className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Assistant Settings</CardTitle>
                <CardDescription>Configure how the AI assistant handles your emails</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Response Generation</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Auto-Reply</p>
                        <p className="text-sm text-muted-foreground">Automatically generate replies to incoming emails</p>
                      </div>
                      <ToggleSwitch checked={true} onCheckedChange={() => {}} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Smart Suggestions</p>
                        <p className="text-sm text-muted-foreground">Show AI-generated reply suggestions</p>
                      </div>
                      <ToggleSwitch checked={true} onCheckedChange={() => {}} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Follow-up Reminders</p>
                        <p className="text-sm text-muted-foreground">Suggest follow-ups for unanswered emails</p>
                      </div>
                      <ToggleSwitch checked={true} onCheckedChange={() => {}} />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Memory & Learning</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Dynamic Memory System</p>
                        <p className="text-sm text-muted-foreground">Use past replies to improve future responses</p>
                      </div>
                      <ToggleSwitch checked={true} onCheckedChange={() => {}} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memory-size">Memory Size</Label>
                      <Select defaultValue="5">
                        <SelectTrigger id="memory-size">
                          <SelectValue placeholder="Select memory size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 past replies</SelectItem>
                          <SelectItem value="5">5 past replies</SelectItem>
                          <SelectItem value="10">10 past replies</SelectItem>
                          <SelectItem value="20">20 past replies</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Number of past replies to use for context</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Response Style</h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tone">Tone</Label>
                      <Select defaultValue="professional">
                        <SelectTrigger id="tone">
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="length">Response Length</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger id="length">
                          <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="concise">Concise</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="detailed">Detailed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <AnimatedButton gradient>
                  <Save className="mr-2 h-4 w-4" /> Save AI Settings
                </AnimatedButton>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
