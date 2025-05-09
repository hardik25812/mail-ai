"use client"

import { useState } from "react"
import { Mail, Calendar, ArrowRight, Plus, Inbox, CheckCircle, BarChart3, MessageSquare, Search } from "lucide-react"
import { AnimatedButton } from "@/components/ui/animated-button"
import { ToggleSwitch } from "@/components/ui/toggle-switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AltDashboardPage() {
  const [activeInboxes, setActiveInboxes] = useState(2)

  return (
    <div className="h-full">
      <div className="p-6 space-y-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, John</h1>
            <p className="text-muted-foreground">Here's what's happening with your inboxes today.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search..." className="pl-8 bg-background w-full" />
            </div>
            <AnimatedButton gradient>
              <Plus className="mr-2 h-4 w-4" /> New
            </AnimatedButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/10">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Emails</p>
                  <div className="flex items-baseline space-x-2">
                    <h2 className="text-3xl font-bold">1,248</h2>
                    <span className="text-xs text-green-500 font-medium">+12%</span>
                  </div>
                </div>
                <div className="p-2 bg-primary/20 rounded-full">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: "75%" }}></div>
              </div>
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>75% processed</span>
                <span>Target: 1,500</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border-blue-500/10">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Meetings</p>
                  <div className="flex items-baseline space-x-2">
                    <h2 className="text-3xl font-bold">42</h2>
                    <span className="text-xs text-green-500 font-medium">+8%</span>
                  </div>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-full">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: "60%" }}></div>
              </div>
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>60% of goal</span>
                <span>Target: 70</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-amber-500/10">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                  <div className="flex items-baseline space-x-2">
                    <h2 className="text-3xl font-bold">94%</h2>
                    <span className="text-xs text-green-500 font-medium">+2%</span>
                  </div>
                </div>
                <div className="p-2 bg-amber-500/20 rounded-full">
                  <MessageSquare className="h-5 w-5 text-amber-500" />
                </div>
              </div>
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: "94%" }}></div>
              </div>
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>Excellent</span>
                <span>Target: 90%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/10">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Active Inboxes</p>
                  <div className="flex items-baseline space-x-2">
                    <h2 className="text-3xl font-bold">{activeInboxes}</h2>
                    <span className="text-xs text-muted-foreground font-medium">of 3</span>
                  </div>
                </div>
                <div className="p-2 bg-green-500/20 rounded-full">
                  <Inbox className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="bg-green-500 h-full rounded-full"
                  style={{ width: `${(activeInboxes / 3) * 100}%` }}
                ></div>
              </div>
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>{Math.round((activeInboxes / 3) * 100)}% active</span>
                <span>Target: 100%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="inboxes" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
            <TabsTrigger value="inboxes">Inboxes</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="inboxes" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Connected Inboxes</h2>
              <AnimatedButton gradient size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Inbox
              </AnimatedButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="hover-card border-l-4 border-l-primary">
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
              </Card>

              <Card className="hover-card border-l-4 border-l-primary">
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
              </Card>

              <Card className="hover-card border-l-4 border-l-muted border-dashed">
                <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center">
                  <div className="p-3 rounded-full bg-muted mb-3">
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-1">Connect New Inbox</h3>
                  <p className="text-sm text-muted-foreground mb-4">Add another email account</p>
                  <AnimatedButton variant="outline" size="sm">
                    Connect
                  </AnimatedButton>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-start gap-4 p-4">
                      <div
                        className={`p-2 rounded-full ${
                          i % 3 === 0 ? "bg-primary/20" : i % 3 === 1 ? "bg-blue-500/20" : "bg-amber-500/20"
                        }`}
                      >
                        {i % 3 === 0 ? (
                          <Mail
                            className={`h-4 w-4 ${
                              i % 3 === 0 ? "text-primary" : i % 3 === 1 ? "text-blue-500" : "text-amber-500"
                            }`}
                          />
                        ) : i % 3 === 1 ? (
                          <Calendar
                            className={`h-4 w-4 ${
                              i % 3 === 0 ? "text-primary" : i % 3 === 1 ? "text-blue-500" : "text-amber-500"
                            }`}
                          />
                        ) : (
                          <MessageSquare
                            className={`h-4 w-4 ${
                              i % 3 === 0 ? "text-primary" : i % 3 === 1 ? "text-blue-500" : "text-amber-500"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {i % 3 === 0
                            ? "New email from Sarah Johnson"
                            : i % 3 === 1
                              ? "Meeting scheduled with Alex Chen"
                              : "Auto-reply sent to David Miller"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {i % 3 === 0
                            ? "Subject: Project Update - Q2 Results"
                            : i % 3 === 1
                              ? "Tomorrow at 2:00 PM - 3:00 PM"
                              : "Re: Inquiry about pricing plans"}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {i === 1
                          ? "Just now"
                          : i === 2
                            ? "5m ago"
                            : i === 3
                              ? "1h ago"
                              : i === 4
                                ? "3h ago"
                                : "Yesterday"}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="justify-center border-t">
                <AnimatedButton variant="ghost" size="sm">
                  View All Activity
                </AnimatedButton>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <h2 className="text-xl font-bold">Pending Tasks</h2>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                      <div className="flex-shrink-0">
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                          {i === 3 && <div className="h-2.5 w-2.5 rounded-full bg-primary"></div>}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${i === 3 ? "line-through text-muted-foreground" : ""}`}>
                          {i === 1
                            ? "Review and respond to high priority emails"
                            : i === 2
                              ? "Prepare for tomorrow's client meeting"
                              : i === 3
                                ? "Update email templates"
                                : "Schedule follow-up with marketing team"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-full ${
                              i === 1
                                ? "bg-red-500/20 text-red-500"
                                : i === 2
                                  ? "bg-amber-500/20 text-amber-500"
                                  : "bg-blue-500/20 text-blue-500"
                            }`}
                          >
                            {i === 1 ? "High" : i === 2 ? "Medium" : "Low"}
                          </span>
                          <span>
                            Due {i === 1 ? "Today" : i === 2 ? "Tomorrow" : i === 3 ? "Completed" : "Next week"}
                          </span>
                        </div>
                      </div>
                      <AnimatedButton variant="ghost" size="sm">
                        {i === 3 ? "Completed" : "Mark Done"}
                      </AnimatedButton>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="justify-center border-t">
                <AnimatedButton variant="ghost" size="sm">
                  <Plus className="mr-2 h-4 w-4" /> Add New Task
                </AnimatedButton>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
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
              <div className="h-[200px] w-full">
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

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
