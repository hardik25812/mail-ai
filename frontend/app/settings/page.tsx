"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Bell,
  Mail,
  Calendar,
  MessageSquare,
  User,
  CreditCard,
  Trash,
  Save,
  Plus,
  X,
  Check,
  HelpCircle,
  Link as LinkIcon,
  Sparkles,
} from "lucide-react"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleSwitch } from "@/components/ui/toggle-switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { WorkspaceSettings } from "@/components/workspace-settings"
import { useWorkspaces } from "@/lib/hooks/useApi"

export default function SettingsPage() {
  const { workspaces, loading: workspacesLoading } = useWorkspaces();
  const [notifications, setNotifications] = useState({
    emailReceived: true,
    emailReplied: true,
    meetingScheduled: true,
    meetingReminder: true,
    weeklyReport: true,
  })

  const [emailSettings, setEmailSettings] = useState({
    autoReply: true,
    smartReplies: true,
    followUp: true,
    attachmentHandling: true,
    prioritization: true,
  })

  const [templates, setTemplates] = useState([
    { id: 1, name: "Professional", active: true },
    { id: 2, name: "Friendly", active: false },
    { id: 3, name: "Concise", active: false },
    { id: 4, name: "Follow-up", active: true },
  ])

  const [officeHours, setOfficeHours] = useState({
    enabled: true,
    startTime: "09:00",
    endTime: "17:00",
    timezone: "America/New_York",
    workDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  })

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
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </motion.div>

      <motion.div variants={item}>
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid grid-cols-7 w-full max-w-3xl mb-8">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account details and profile information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Profile" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <AnimatedButton variant="outline" size="sm">
                      Change Avatar
                    </AnimatedButton>
                  </div>
                  <div className="flex-1 grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" defaultValue="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" defaultValue="Doe" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="john.doe@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input id="jobTitle" defaultValue="Product Manager" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    defaultValue="Product Manager with 5+ years of experience in SaaS companies. Passionate about user experience and data-driven decision making."
                  />
                  <p className="text-xs text-muted-foreground">This will be displayed on your profile and in emails.</p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Security</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div />
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <AnimatedButton variant="outline">Cancel</AnimatedButton>
                <AnimatedButton gradient>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </AnimatedButton>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>Manage your connected accounts and services.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-blue-500/20">
                      <svg className="h-6 w-6 text-blue-500" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Google</h3>
                      <p className="text-sm text-muted-foreground">john.doe@gmail.com</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    Connected
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-blue-500/20">
                      <svg className="h-6 w-6 text-blue-500" viewBox="0 0 24 24">
                        <path
                          d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Microsoft</h3>
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    </div>
                  </div>
                  <AnimatedButton variant="outline" size="sm">
                    Connect
                  </AnimatedButton>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-blue-500/20">
                      <svg className="h-6 w-6 text-blue-500" viewBox="0 0 24 24">
                        <path
                          d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.82 17.82c-.238.042-.473.084-.72.126-.24.04-.48.08-.72.11-.23.03-.46.05-.69.07-.24.02-.48.03-.72.03-1.2 0-2.27-.27-3.2-.8-.93-.53-1.7-1.3-2.29-2.29-.59-.99-.88-2.13-.88-3.43 0-1.33.28-2.51.85-3.53.57-1.02 1.35-1.82 2.34-2.39.99-.57 2.11-.86 3.37-.86.24 0 .48.01.72.03.23.02.46.04.69.07.24.03.48.07.72.11.25.04.49.08.73.13v2.32c-.24-.09-.48-.16-.73-.21-.25-.05-.5-.1-.75-.13-.25-.03-.5-.05-.75-.05-1.23 0-2.22.41-2.97 1.22-.75.81-1.12 1.89-1.12 3.23 0 1.33.37 2.39 1.12 3.18.75.79 1.74 1.18 2.97 1.18.25 0 .5-.01.75-.05.25-.03.5-.08.75-.13.25-.05.49-.12.73-.21v2.32z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Slack</h3>
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    </div>
                  </div>
                  <AnimatedButton variant="outline" size="sm">
                    Connect
                  </AnimatedButton>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible account actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                  <div>
                    <h3 className="font-medium">Delete Account</h3>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all data.</p>
                  </div>
                  <AnimatedButton variant="destructive">
                    <Trash className="mr-2 h-4 w-4" /> Delete Account
                  </AnimatedButton>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control how and when you receive notifications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">New Email Received</Label>
                        <p className="text-sm text-muted-foreground">Get notified when you receive a new email</p>
                      </div>
                      <ToggleSwitch
                        checked={notifications.emailReceived}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, emailReceived: checked })}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Email Replied</Label>
                        <p className="text-sm text-muted-foreground">Get notified when your email receives a reply</p>
                      </div>
                      <ToggleSwitch
                        checked={notifications.emailReplied}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, emailReplied: checked })}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Meeting Scheduled</Label>
                        <p className="text-sm text-muted-foreground">Get notified when a meeting is scheduled</p>
                      </div>
                      <ToggleSwitch
                        checked={notifications.meetingScheduled}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, meetingScheduled: checked })}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Meeting Reminder</Label>
                        <p className="text-sm text-muted-foreground">Get reminded before your scheduled meetings</p>
                      </div>
                      <ToggleSwitch
                        checked={notifications.meetingReminder}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, meetingReminder: checked })}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Weekly Report</Label>
                        <p className="text-sm text-muted-foreground">Receive a weekly summary of your email activity</p>
                      </div>
                      <ToggleSwitch
                        checked={notifications.weeklyReport}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReport: checked })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Delivery</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emailFrequency">Email Frequency</Label>
                      <Select defaultValue="realtime">
                        <SelectTrigger id="emailFrequency">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realtime">Real-time</SelectItem>
                          <SelectItem value="hourly">Hourly Digest</SelectItem>
                          <SelectItem value="daily">Daily Digest</SelectItem>
                          <SelectItem value="weekly">Weekly Digest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notificationTime">Digest Delivery Time</Label>
                      <Select defaultValue="morning">
                        <SelectTrigger id="notificationTime">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning (8:00 AM)</SelectItem>
                          <SelectItem value="afternoon">Afternoon (1:00 PM)</SelectItem>
                          <SelectItem value="evening">Evening (6:00 PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <AnimatedButton gradient>
                  <Save className="mr-2 h-4 w-4" /> Save Preferences
                </AnimatedButton>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>Configure how your emails are processed and managed.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">AI Features</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Auto-Reply</Label>
                        <p className="text-sm text-muted-foreground">Automatically reply to emails based on content</p>
                      </div>
                      <ToggleSwitch
                        checked={emailSettings.autoReply}
                        onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, autoReply: checked })}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Smart Replies</Label>
                        <p className="text-sm text-muted-foreground">Suggest quick responses based on email content</p>
                      </div>
                      <ToggleSwitch
                        checked={emailSettings.smartReplies}
                        onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, smartReplies: checked })}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Follow-up Reminders</Label>
                        <p className="text-sm text-muted-foreground">Get reminded to follow up on unanswered emails</p>
                      </div>
                      <ToggleSwitch
                        checked={emailSettings.followUp}
                        onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, followUp: checked })}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Attachment Handling</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically process and categorize attachments
                        </p>
                      </div>
                      <ToggleSwitch
                        checked={emailSettings.attachmentHandling}
                        onCheckedChange={(checked) =>
                          setEmailSettings({ ...emailSettings, attachmentHandling: checked })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Email Prioritization</Label>
                        <p className="text-sm text-muted-foreground">Automatically prioritize important emails</p>
                      </div>
                      <ToggleSwitch
                        checked={emailSettings.prioritization}
                        onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, prioritization: checked })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Office Hours</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <Label className="text-base">Enable Office Hours</Label>
                    <ToggleSwitch
                      checked={officeHours.enabled}
                      onCheckedChange={(checked) => setOfficeHours({ ...officeHours, enabled: checked })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={officeHours.startTime}
                        onChange={(e) => setOfficeHours({ ...officeHours, startTime: e.target.value })}
                        disabled={!officeHours.enabled}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={officeHours.endTime}
                        onChange={(e) => setOfficeHours({ ...officeHours, endTime: e.target.value })}
                        disabled={!officeHours.enabled}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={officeHours.timezone}
                        onValueChange={(value) => setOfficeHours({ ...officeHours, timezone: value })}
                        disabled={!officeHours.enabled}
                      >
                        <SelectTrigger id="timezone">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                          <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Working Days</Label>
                    <div className="flex flex-wrap gap-2">
                      {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                        <Badge
                          key={day}
                          variant={officeHours.workDays.includes(day) ? "default" : "outline"}
                          className="cursor-pointer capitalize"
                          onClick={() => {
                            if (officeHours.enabled) {
                              setOfficeHours({
                                ...officeHours,
                                workDays: officeHours.workDays.includes(day)
                                  ? officeHours.workDays.filter((d) => d !== day)
                                  : [...officeHours.workDays, day],
                              })
                            }
                          }}
                        >
                          {day.slice(0, 3)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <AnimatedButton gradient>
                  <Save className="mr-2 h-4 w-4" /> Save Settings
                </AnimatedButton>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>Manage your email templates for different scenarios.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Your Templates</h3>
                  <AnimatedButton gradient size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Add Template
                  </AnimatedButton>
                </div>

                <div className="space-y-4">
                  {templates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${template.active ? "bg-primary/20" : "bg-muted"}`}>
                          <MessageSquare
                            className={`h-5 w-5 ${template.active ? "text-primary" : "text-muted-foreground"}`}
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{template.name}</h3>
                          <p className="text-sm text-muted-foreground">{template.active ? "Active" : "Inactive"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ToggleSwitch
                          checked={template.active}
                          onCheckedChange={(checked) => {
                            setTemplates(templates.map((t) => (t.id === template.id ? { ...t, active: checked } : t)))
                          }}
                        />
                        <AnimatedButton variant="ghost" size="icon">
                          <HelpCircle className="h-4 w-4" />
                        </AnimatedButton>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Template Preview</h3>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Professional Template</h4>
                      <Badge>Active</Badge>
                    </div>
                    <div className="space-y-2">
                      <p>Dear [Recipient Name],</p>
                      <p>
                        Thank you for your email regarding [Subject]. I appreciate you taking the time to reach out.
                      </p>
                      <p>[Custom Response]</p>
                      <p>If you have any further questions, please don't hesitate to contact me.</p>
                      <p>
                        Best regards,
                        <br />
                        John Doe
                        <br />
                        Product Manager
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="templateName">Template Name</Label>
                      <Input id="templateName" defaultValue="Professional" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="templateCategory">Category</Label>
                      <Select defaultValue="business">
                        <SelectTrigger id="templateCategory">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="personal">Personal</SelectItem>
                          <SelectItem value="followup">Follow-up</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="templateContent">Template Content</Label>
                    <Textarea
                      id="templateContent"
                      rows={8}
                      defaultValue={`Dear [Recipient Name],

Thank you for your email regarding [Subject]. I appreciate you taking the time to reach out.

[Custom Response]

If you have any further questions, please don't hesitate to contact me.

Best regards,
John Doe
Product Manager`}
                    />
                    <p className="text-xs text-muted-foreground">Use [placeholders] for dynamic content.</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <AnimatedButton variant="outline">
                  <Trash className="mr-2 h-4 w-4" /> Delete Template
                </AnimatedButton>
                <AnimatedButton gradient>
                  <Save className="mr-2 h-4 w-4" /> Save Template
                </AnimatedButton>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Calendar Settings</CardTitle>
                <CardDescription>Configure your calendar integration and meeting preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Connected Calendars</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-blue-500/20">
                          <Calendar className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-medium">Google Calendar</h3>
                          <p className="text-sm text-muted-foreground">john.doe@gmail.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          Primary
                        </Badge>
                        <AnimatedButton variant="ghost" size="icon">
                          <X className="h-4 w-4" />
                        </AnimatedButton>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-blue-500/20">
                          <Calendar className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-medium">Outlook Calendar</h3>
                          <p className="text-sm text-muted-foreground">john.doe@company.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <AnimatedButton variant="ghost" size="icon">
                          <X className="h-4 w-4" />
                        </AnimatedButton>
                      </div>
                    </div>

                    <AnimatedButton variant="outline" className="w-full">
                      <Plus className="mr-2 h-4 w-4" /> Connect Another Calendar
                    </AnimatedButton>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Meeting Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="meetingDuration">Default Meeting Duration</Label>
                      <Select defaultValue="30">
                        <SelectTrigger id="meetingDuration">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bufferTime">Buffer Time Between Meetings</Label>
                      <Select defaultValue="15">
                        <SelectTrigger id="bufferTime">
                          <SelectValue placeholder="Select buffer time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No buffer</SelectItem>
                          <SelectItem value="5">5 minutes</SelectItem>
                          <SelectItem value="10">10 minutes</SelectItem>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-base">Automatic Meeting Scheduling</Label>
                      <ToggleSwitch checked={true} onCheckedChange={() => {}} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Allow AI to automatically schedule meetings based on your availability
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-base">Meeting Reminders</Label>
                      <ToggleSwitch checked={true} onCheckedChange={() => {}} />
                    </div>
                    <p className="text-sm text-muted-foreground">Send reminders before scheduled meetings</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reminderTime">Reminder Time</Label>
                    <Select defaultValue="15">
                      <SelectTrigger id="reminderTime">
                        <SelectValue placeholder="Select reminder time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes before</SelectItem>
                        <SelectItem value="10">10 minutes before</SelectItem>
                        <SelectItem value="15">15 minutes before</SelectItem>
                        <SelectItem value="30">30 minutes before</SelectItem>
                        <SelectItem value="60">1 hour before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Booking Page</h3>
                  <div className="space-y-2">
                    <Label htmlFor="bookingLink">Your Booking Link</Label>
                    <div className="flex">
                      <Input
                        id="bookingLink"
                        value="https://inboxai.app/book/johndoe"
                        readOnly
                        className="rounded-r-none"
                      />
                      <AnimatedButton className="rounded-l-none">Copy</AnimatedButton>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Share this link to let others book meetings with you
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-base">Require Approval</Label>
                      <ToggleSwitch checked={false} onCheckedChange={() => {}} />
                    </div>
                    <p className="text-sm text-muted-foreground">Require your approval before meetings are confirmed</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <AnimatedButton gradient>
                  <Save className="mr-2 h-4 w-4" /> Save Settings
                </AnimatedButton>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>Connect your workspace to external services.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {workspacesLoading ? (
                  <div className="flex items-center justify-center p-6">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : workspaces && workspaces.length > 0 ? (
                  <div className="space-y-6">
                    {workspaces.map((workspace) => (
                      <div key={workspace.id} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium">{workspace.name || 'Default Workspace'}</h3>
                            <p className="text-sm text-muted-foreground">ID: {workspace.id}</p>
                          </div>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            <Sparkles className="mr-1 h-3 w-3" />
                            RAG Enabled
                          </Badge>
                        </div>
                        <WorkspaceSettings 
                          workspaceId={workspace.id} 
                          workspaceName={workspace.name || 'Default Workspace'} 
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No workspaces found. Create a workspace to enable integrations.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Plan</CardTitle>
                <CardDescription>Manage your subscription and billing information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-lg">Pro Plan</h3>
                      <p className="text-sm text-muted-foreground">$29/month, billed monthly</p>
                    </div>
                    <Badge>Current Plan</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Unlimited email accounts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Advanced AI features</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Custom templates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Priority support</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <AnimatedButton variant="outline" className="w-full">
                      Change Plan
                    </AnimatedButton>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Payment Method</h3>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-muted">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium">Visa ending in 4242</h3>
                        <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                      </div>
                    </div>
                    <AnimatedButton variant="outline" size="sm">
                      Update
                    </AnimatedButton>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Billing History</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-medium">Date</th>
                          <th className="text-left p-3 font-medium">Description</th>
                          <th className="text-left p-3 font-medium">Amount</th>
                          <th className="text-left p-3 font-medium">Status</th>
                          <th className="text-left p-3 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="p-3">Jul 1, 2023</td>
                          <td className="p-3">Pro Plan - Monthly</td>
                          <td className="p-3">$29.00</td>
                          <td className="p-3">
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                              Paid
                            </Badge>
                          </td>
                          <td className="p-3">
                            <AnimatedButton variant="ghost" size="sm">
                              Receipt
                            </AnimatedButton>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3">Jun 1, 2023</td>
                          <td className="p-3">Pro Plan - Monthly</td>
                          <td className="p-3">$29.00</td>
                          <td className="p-3">
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                              Paid
                            </Badge>
                          </td>
                          <td className="p-3">
                            <AnimatedButton variant="ghost" size="sm">
                              Receipt
                            </AnimatedButton>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3">May 1, 2023</td>
                          <td className="p-3">Pro Plan - Monthly</td>
                          <td className="p-3">$29.00</td>
                          <td className="p-3">
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                              Paid
                            </Badge>
                          </td>
                          <td className="p-3">
                            <AnimatedButton variant="ghost" size="sm">
                              Receipt
                            </AnimatedButton>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
