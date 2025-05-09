"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Calendar, ArrowRight, Plus, Inbox, CheckCircle, Search, BarChart3, MessageSquare } from "lucide-react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { ToggleSwitch } from "@/components/ui/toggle-switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function FullscreenDashboardPage() {
  const [activeInboxes, setActiveInboxes] = useState(2)

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

  return (
    <div className="h-full flex flex-col">
      {/* Top Stats Bar */}
      <div className="bg-background border-b">
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
          <div className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/20">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Emails</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">1,248</h3>
                <span className="text-xs text-green-500">+24%</span>
              </div>
            </div>
          </div>

          <div className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/20">
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Meetings</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">42</h3>
                <span className="text-xs text-green-500">+12%</span>
              </div>
            </div>
          </div>

          <div className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-500/20">
              <MessageSquare className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Response Rate</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">94%</h3>
                <span className="text-xs text-green-500">+2%</span>
              </div>
            </div>
          </div>

          <div className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/20">
              <Inbox className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Inboxes</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">{activeInboxes}</h3>
                <span className="text-xs text-muted-foreground">of 3</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_350px] overflow-hidden">
        {/* Left Column */}
        <div className="overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome back, John</h1>
              <p className="text-muted-foreground">Here's what's happening with your inboxes today.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search..." className="pl-8 w-[200px]" />
              </div>
              <AnimatedButton gradient>
                <Plus className="mr-2 h-4 w-4" /> Compose
              </AnimatedButton>
            </div>
          </div>

          <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6 md:grid-cols-2">
            <motion.div variants={item}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Emails</CardTitle>
                    <Badge variant="outline">Today</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt="User" />
                            <AvatarFallback>{String.fromCharCode(64 + i)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">
                                {i === 1
                                  ? "Sarah Johnson"
                                  : i === 2
                                    ? "Alex Chen"
                                    : i === 3
                                      ? "David Miller"
                                      : "Emily Parker"}
                              </p>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {i === 1 ? "10:23 AM" : i === 2 ? "9:45 AM" : i === 3 ? "Yesterday" : "Yesterday"}
                              </span>
                            </div>
                            <h3 className="text-sm truncate">
                              {i === 1
                                ? "Project Update - Q2 Results"
                                : i === 2
                                  ? "Meeting Confirmation: Strategy Discussion"
                                  : i === 3
                                    ? "Inquiry about pricing plans"
                                    : "Content calendar for next month"}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">
                              {i === 1
                                ? "Hi John, I wanted to share the latest results from our Q2 analysis. The numbers are looking promising and..."
                                : i === 2
                                  ? "This is a confirmation for our meeting tomorrow at 2:00 PM. I've attached the agenda and some preliminary..."
                                  : i === 3
                                    ? "Hello, I'm interested in your premium plan but I have a few questions about the features included. Could you..."
                                    : "Hi team, I've prepared the content calendar for next month. Please review and let me know if you have any..."}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t p-4 flex justify-center">
                  <AnimatedButton variant="ghost" size="sm">
                    View All Emails <ArrowRight className="ml-2 h-4 w-4" />
                  </AnimatedButton>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Upcoming Meetings</CardTitle>
                    <Badge variant="outline">This Week</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-md bg-blue-500/20 text-blue-500">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">
                              {i === 1 ? "Strategy Discussion" : i === 2 ? "Weekly Team Sync" : "Client Presentation"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {i === 1 ? "Tomorrow" : i === 2 ? "Wednesday" : "Friday"},{" "}
                              {i === 1 ? "2:00 PM" : i === 2 ? "10:00 AM" : "1:30 PM"} -{" "}
                              {i === 1 ? "3:00 PM" : i === 2 ? "11:00 AM" : "3:00 PM"}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex -space-x-2">
                                {Array.from({ length: i + 1 }).map((_, j) => (
                                  <Avatar key={j} className="h-6 w-6 border-2 border-background">
                                    <AvatarImage src={`/placeholder.svg?height=24&width=24`} alt="User" />
                                    <AvatarFallback>{String.fromCharCode(65 + j)}</AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">{i + 1} attendees</span>
                            </div>
                          </div>
                          <AnimatedButton variant="outline" size="sm">
                            Join
                          </AnimatedButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t p-4 flex justify-center">
                  <AnimatedButton variant="ghost" size="sm">
                    View Calendar <ArrowRight className="ml-2 h-4 w-4" />
                  </AnimatedButton>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div variants={item} initial="hidden" animate="show">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Weekly Performance</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-primary"></div>
                      <span className="text-xs text-muted-foreground">Emails</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-xs text-muted-foreground">Meetings</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <div className="flex h-full items-end gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                      <div key={day} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex flex-col gap-1">
                          <div
                            className="w-full bg-primary/20 rounded-sm"
                            style={{
                              height: `${Math.max(20, Math.min(100, 30 + i * 10 + Math.random() * 40))}px`,
                              opacity: day === "Thu" ? 1 : 0.7,
                            }}
                          >
                            <div
                              className="w-full bg-primary rounded-sm transition-all duration-500"
                              style={{
                                height: `${Math.max(10, Math.min(100, 20 + i * 10 + Math.random() * 30))}px`,
                              }}
                            ></div>
                          </div>
                          <div
                            className="w-full bg-blue-500/20 rounded-sm"
                            style={{
                              height: `${Math.max(10, Math.min(80, 10 + i * 5 + Math.random() * 30))}px`,
                              opacity: day === "Thu" ? 1 : 0.7,
                            }}
                          >
                            <div
                              className="w-full bg-blue-500 rounded-sm transition-all duration-500"
                              style={{
                                height: `${Math.max(5, Math.min(60, 5 + i * 5 + Math.random() * 20))}px`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground mt-2">{day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Sidebar */}
        <div className="border-l overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Connected Inboxes</h2>
              <AnimatedButton gradient size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add
              </AnimatedButton>
            </div>

            <div className="space-y-4">
              <AnimatedCard delay={0.1} className="hover-card border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Work Gmail</CardTitle>
                    <ToggleSwitch
                      checked={true}
                      onCheckedChange={() => setActiveInboxes((prev) => (prev === 2 ? 1 : 2))}
                    />
                  </div>
                  <CardDescription>john.doe@company.com</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Inbox className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>842 emails</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5 text-primary" />
                      <span>Auto-reply on</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <AnimatedButton variant="ghost" size="sm" className="w-full">
                    Manage <ArrowRight className="ml-2 h-4 w-4" />
                  </AnimatedButton>
                </CardFooter>
              </AnimatedCard>

              <AnimatedCard delay={0.2} className="hover-card border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Personal Gmail</CardTitle>
                    <ToggleSwitch
                      checked={true}
                      onCheckedChange={() => setActiveInboxes((prev) => (prev === 2 ? 1 : 2))}
                    />
                  </div>
                  <CardDescription>john.personal@gmail.com</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Inbox className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>406 emails</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5 text-primary" />
                      <span>Auto-reply on</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <AnimatedButton variant="ghost" size="sm" className="w-full">
                    Manage <ArrowRight className="ml-2 h-4 w-4" />
                  </AnimatedButton>
                </CardFooter>
              </AnimatedCard>
            </div>

            <div className="pt-4 border-t">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="p-2 rounded-full bg-primary/20">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Compose Email</h3>
                    <p className="text-sm text-muted-foreground">Create a new email</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="p-2 rounded-full bg-blue-500/20">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Schedule Meeting</h3>
                    <p className="text-sm text-muted-foreground">Book a new appointment</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="p-2 rounded-full bg-amber-500/20">
                    <MessageSquare className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Create Template</h3>
                    <p className="text-sm text-muted-foreground">Add a new email template</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="p-2 rounded-full bg-green-500/20">
                    <BarChart3 className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">View Reports</h3>
                    <p className="text-sm text-muted-foreground">Check detailed analytics</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-full ${i % 3 === 0 ? "bg-primary/20" : i % 3 === 1 ? "bg-blue-500/20" : "bg-amber-500/20"}`}
                    >
                      {i % 3 === 0 ? (
                        <Mail
                          className={`h-4 w-4 ${i % 3 === 0 ? "text-primary" : i % 3 === 1 ? "text-blue-500" : "text-amber-500"}`}
                        />
                      ) : i % 3 === 1 ? (
                        <Calendar
                          className={`h-4 w-4 ${i % 3 === 0 ? "text-primary" : i % 3 === 1 ? "text-blue-500" : "text-amber-500"}`}
                        />
                      ) : (
                        <MessageSquare
                          className={`h-4 w-4 ${i % 3 === 0 ? "text-primary" : i % 3 === 1 ? "text-blue-500" : "text-amber-500"}`}
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {i % 3 === 0
                          ? "New email from Sarah Johnson"
                          : i % 3 === 1
                            ? "Meeting scheduled with Alex Chen"
                            : "Auto-reply sent to David Miller"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {i === 1 ? "Just now" : i === 2 ? "5m ago" : "1h ago"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
