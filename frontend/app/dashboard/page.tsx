"use client"

import { useState, Suspense, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useSearchParams, usePathname } from "next/navigation"
import { Mail, Calendar, Users, Plus, Inbox, CheckCircle, Clock, BarChart3, Settings, Brain, Save, ChevronDown, ChevronRight } from "lucide-react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { ToggleSwitch } from "@/components/ui/toggle-switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockInboxStats } from "@/components/inbox-statistics"
import { EmailBisonImport } from "@/components/email-bison-import"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function DashboardPage() {
  const [activeInboxes, setActiveInboxes] = useState(mockInboxStats.length)
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

  // Calculate total statistics across all inboxes
  const totalEmails = mockInboxStats.reduce((sum, inbox) => sum + inbox.totalEmails, 0)
  const totalMeetings = mockInboxStats.reduce((sum, inbox) => sum + inbox.meetingsScheduled, 0)
  const avgResponseRate = Math.round(
    mockInboxStats.reduce((sum, inbox) => sum + inbox.responseRate, 0) / mockInboxStats.length,
  )

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
          <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-6">
            <AnimatedCard delay={0.1}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEmails.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Across all inboxes</p>
              </CardContent>
            </AnimatedCard>
            <AnimatedCard delay={0.2}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Meetings Booked</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMeetings}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </AnimatedCard>
            <AnimatedCard delay={0.3}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Active Inboxes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeInboxes}</div>
                <p className="text-xs text-muted-foreground">
                  {activeInboxes} of {mockInboxStats.length} inboxes active
                </p>
              </CardContent>
            </AnimatedCard>
          </motion.div>

          <motion.div variants={item} className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Connected Inboxes</h2>
              <AnimatedButton gradient size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Inbox
              </AnimatedButton>
            </div>
            
            {/* Inbox Navigation Feature */}
            <div className="mt-4 border rounded-lg p-4 bg-card">
              <button 
                onClick={() => setInboxesExpanded(!inboxesExpanded)}
                className="flex items-center gap-2 p-2 w-full text-left hover:bg-accent rounded-md"
              >
                {inboxesExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <Inbox className="h-5 w-5" />
                <span>Inboxes</span>
              </button>
              
              {inboxesExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {mockInboxStats.map(inbox => (
                    <Link
                      key={inbox.id}
                      href={`/inbox/${inbox.id}`}
                      className={`block p-2 rounded-md text-sm ${
                        pathname === `/inbox/${inbox.id}` 
                          ? 'bg-primary/10 text-primary' 
                          : 'hover:bg-accent'
                      }`}
                    >
                      - {inbox.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-6">
            {mockInboxStats.map((inbox, index) => (
              <AnimatedCard key={inbox.id} delay={0.1 * (index + 1)} className="hover-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{inbox.name}</CardTitle>
                    <ToggleSwitch
                      checked={true}
                      onCheckedChange={() =>
                        setActiveInboxes((prev) => (prev === mockInboxStats.length ? prev - 1 : mockInboxStats.length))
                      }
                    />
                  </div>
                  <CardDescription>{inbox.email}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Inbox className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{inbox.totalEmails} emails</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Auto-reply on</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{inbox.avgResponseTime}m response</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{inbox.meetingsScheduled} meetings</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/inbox/stats/${inbox.id}`} className="w-full">
                    <AnimatedButton variant="outline" size="sm" className="w-full">
                      View Stats <BarChart3 className="ml-2 h-4 w-4" />
                    </AnimatedButton>
                  </Link>
                </CardFooter>
              </AnimatedCard>
            ))}
          </motion.div>

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
                      Connected {mockInboxStats.length} of {mockInboxStats.length + 1} accounts
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
                    <p className="text-sm text-muted-foreground">Connected {mockInboxStats.length} calendars</p>
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
                      <ToggleSwitch checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Weekly Reports</p>
                        <p className="text-sm text-muted-foreground">Receive weekly email summary reports</p>
                      </div>
                      <ToggleSwitch checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Meeting Reminders</p>
                        <p className="text-sm text-muted-foreground">Get reminders before scheduled meetings</p>
                      </div>
                      <ToggleSwitch checked={true} />
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
                      <ToggleSwitch checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Smart Suggestions</p>
                        <p className="text-sm text-muted-foreground">Show AI-generated reply suggestions</p>
                      </div>
                      <ToggleSwitch checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Follow-up Reminders</p>
                        <p className="text-sm text-muted-foreground">Suggest follow-ups for unanswered emails</p>
                      </div>
                      <ToggleSwitch checked={true} />
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
                      <ToggleSwitch checked={true} />
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
