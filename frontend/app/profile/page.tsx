"use client"

import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Calendar, Clock, Edit, Camera, Shield, User, Settings, LogOut } from "lucide-react"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export default function ProfilePage() {
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
      <div className="relative">
        <div className="absolute inset-0 h-40 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg" />

        <motion.div variants={item} className="relative pt-16 px-4 md:px-8 pb-8">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-end">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Profile" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 p-1 rounded-full bg-primary text-white">
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold">John Doe</h1>
              <p className="text-muted-foreground">Product Manager</p>
              <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  Pro Plan
                </Badge>
                <Badge variant="outline">3 Connected Inboxes</Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <AnimatedButton variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </AnimatedButton>
              <AnimatedButton gradient size="sm">
                <Settings className="mr-2 h-4 w-4" /> Settings
              </AnimatedButton>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={item} className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>john.doe@example.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p>+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p>San Francisco, CA</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Timezone</p>
                  <p>Pacific Time (PT)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p>Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Enabled</p>
                  </div>
                </div>
                <AnimatedButton variant="ghost" size="sm">
                  Configure
                </AnimatedButton>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p>Password</p>
                    <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                  </div>
                </div>
                <AnimatedButton variant="ghost" size="sm">
                  Change
                </AnimatedButton>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LogOut className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p>Sessions</p>
                    <p className="text-sm text-muted-foreground">1 active session</p>
                  </div>
                </div>
                <AnimatedButton variant="ghost" size="sm">
                  Manage
                </AnimatedButton>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connected Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1 rounded-full bg-blue-500/20">
                    <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24">
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
                    <p>Google</p>
                    <p className="text-sm text-muted-foreground">Connected</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  Active
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1 rounded-full bg-blue-500/20">
                    <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24">
                      <path
                        d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.82 17.82c-.238.042-.473.084-.72.126-.24.04-.48.08-.72.11-.23.03-.46.05-.69.07-.24.02-.48.03-.72.03-1.2 0-2.27-.27-3.2-.8-.93-.53-1.7-1.3-2.29-2.29-.59-.99-.88-2.13-.88-3.43 0-1.33.28-2.51.85-3.53.57-1.02 1.35-1.82 2.34-2.39.99-.57 2.11-.86 3.37-.86.24 0 .48.01.72.03.23.02.46.04.69.07.24.03.48.07.72.11.25.04.49.08.73.13v2.32c-.24-.09-.48-.16-.73-.21-.25-.05-.5-.1-.75-.13-.25-.03-.5-.05-.75-.05-1.23 0-2.22.41-2.97 1.22-.75.81-1.12 1.89-1.12 3.23 0 1.33.37 2.39 1.12 3.18.75.79 1.74 1.18 2.97 1.18.25 0 .5-.01.75-.05.25-.03.5-.08.75-.13.25-.05.49-.12.73-.21v2.32z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div>
                    <p>Slack</p>
                    <p className="text-sm text-muted-foreground">Not connected</p>
                  </div>
                </div>
                <AnimatedButton variant="outline" size="sm">
                  Connect
                </AnimatedButton>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="activity">
                <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="stats">Stats</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>

                <TabsContent value="activity" className="space-y-4">
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex gap-4">
                        <div className="relative mt-1">
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              i % 3 === 0 ? "bg-primary/20" : i % 3 === 1 ? "bg-blue-500/20" : "bg-amber-500/20"
                            }`}
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
                              <Settings
                                className={`h-4 w-4 ${i % 3 === 0 ? "text-primary" : i % 3 === 1 ? "text-blue-500" : "text-amber-500"}`}
                              />
                            )}
                          </div>
                          {i < 5 && (
                            <div className="absolute top-8 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-border" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">
                            {i % 3 === 0
                              ? "Sent an email to Sarah Johnson"
                              : i % 3 === 1
                                ? "Scheduled a meeting with Alex Chen"
                                : "Updated email template settings"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {i === 1
                              ? "Just now"
                              : i === 2
                                ? "5 minutes ago"
                                : i === 3
                                  ? "1 hour ago"
                                  : i === 4
                                    ? "Yesterday"
                                    : "2 days ago"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="stats" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Emails</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-3xl font-bold">1,248</p>
                        <span className="text-xs text-green-500">+24%</span>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Response Rate</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-3xl font-bold">94%</p>
                        <span className="text-xs text-green-500">+2%</span>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Avg. Response Time</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-3xl font-bold">28m</p>
                        <span className="text-xs text-green-500">-15%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-4">Weekly Activity</h3>
                    <div className="h-[200px] w-full">
                      <div className="flex h-full items-end gap-2">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                          <div key={day} className="flex-1 flex flex-col items-center gap-1">
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
                            <span className="text-xs text-muted-foreground mt-2">{day}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="preferences" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive email notifications</p>
                      </div>
                      <Badge>Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Language</p>
                        <p className="text-sm text-muted-foreground">English (US)</p>
                      </div>
                      <AnimatedButton variant="ghost" size="sm">
                        Change
                      </AnimatedButton>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Theme</p>
                        <p className="text-sm text-muted-foreground">Dark Mode</p>
                      </div>
                      <AnimatedButton variant="ghost" size="sm">
                        Change
                      </AnimatedButton>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connected Inboxes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/20">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Work Gmail</p>
                      <p className="text-sm text-muted-foreground">john.doe@company.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      Active
                    </Badge>
                    <AnimatedButton variant="ghost" size="sm">
                      Manage
                    </AnimatedButton>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/20">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Personal Gmail</p>
                      <p className="text-sm text-muted-foreground">john.personal@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      Active
                    </Badge>
                    <AnimatedButton variant="ghost" size="sm">
                      Manage
                    </AnimatedButton>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Add New Inbox</p>
                      <p className="text-sm text-muted-foreground">Connect another email account</p>
                    </div>
                  </div>
                  <AnimatedButton gradient size="sm">
                    Connect
                  </AnimatedButton>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
