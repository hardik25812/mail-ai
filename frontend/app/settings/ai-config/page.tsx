"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Save, Plus, Trash, MessageSquare, Clock, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleSwitch } from "@/components/ui/toggle-switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default function AIConfigPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState([
    { id: 1, name: "Professional", active: true, content: "Thank you for your email. I'll get back to you shortly." },
    { id: 2, name: "Friendly", active: false, content: "Thanks for reaching out! I'll respond as soon as I can." },
    {
      id: 3,
      name: "Out of Office",
      active: true,
      content: "I'm currently out of the office and will return on [date].",
    },
  ])

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
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <AnimatedButton variant="ghost" size="sm" onClick={() => router.push("/settings")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Settings
          </AnimatedButton>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">AI Reply Configuration</h1>
        <p className="text-muted-foreground">Customize how AI responds to your emails.</p>
      </motion.div>

      <motion.div variants={item} className="px-6">
        <Tabs defaultValue="settings">
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
            <TabsTrigger value="settings">General Settings</TabsTrigger>
            <TabsTrigger value="templates">Reply Templates</TabsTrigger>
            <TabsTrigger value="calendar">Calendar Integration</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Behavior</CardTitle>
                <CardDescription>Configure how the AI responds to emails</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Auto-Reply</Label>
                      <p className="text-sm text-muted-foreground">Automatically reply to emails based on content</p>
                    </div>
                    <ToggleSwitch checked={true} onCheckedChange={() => {}} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Smart Replies</Label>
                      <p className="text-sm text-muted-foreground">Suggest quick responses based on email content</p>
                    </div>
                    <ToggleSwitch checked={true} onCheckedChange={() => {}} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Follow-up Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get reminded to follow up on unanswered emails</p>
                    </div>
                    <ToggleSwitch checked={true} onCheckedChange={() => {}} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Tone Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="formalityLevel">Formality Level</Label>
                      <Select defaultValue="balanced">
                        <SelectTrigger id="formalityLevel">
                          <SelectValue placeholder="Select formality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="balanced">Balanced</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="responseLength">Response Length</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger id="responseLength">
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

                <div className="space-y-2">
                  <Label htmlFor="customInstructions">Custom Instructions</Label>
                  <Textarea
                    id="customInstructions"
                    placeholder="Add any specific instructions for the AI..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    These instructions will be used to guide the AI when generating replies.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <AnimatedButton gradient>
                  <Save className="mr-2 h-4 w-4" /> Save Settings
                </AnimatedButton>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Categories</CardTitle>
                <CardDescription>Configure how different types of emails are handled</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-500/20">
                      <MessageSquare className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Meeting Requests</p>
                      <p className="text-sm text-muted-foreground">How to handle meeting scheduling</p>
                    </div>
                  </div>
                  <Select defaultValue="auto">
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-schedule</SelectItem>
                      <SelectItem value="suggest">Suggest times</SelectItem>
                      <SelectItem value="manual">Manual only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-500/20">
                      <User className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">Customer Inquiries</p>
                      <p className="text-sm text-muted-foreground">How to handle customer questions</p>
                    </div>
                  </div>
                  <Select defaultValue="template">
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="template">Use template</SelectItem>
                      <SelectItem value="custom">Custom reply</SelectItem>
                      <SelectItem value="manual">Manual only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-amber-500/20">
                      <Clock className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium">Out of Office</p>
                      <p className="text-sm text-muted-foreground">How to handle emails during OOO periods</p>
                    </div>
                  </div>
                  <Select defaultValue="auto">
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-reply</SelectItem>
                      <SelectItem value="forward">Forward</SelectItem>
                      <SelectItem value="ignore">No action</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <AnimatedButton variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Add Category
                </AnimatedButton>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Email Templates</CardTitle>
                    <CardDescription>Create and manage templates for different scenarios</CardDescription>
                  </div>
                  <AnimatedButton gradient size="sm">
                    <Plus className="mr-2 h-4 w-4" /> New Template
                  </AnimatedButton>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
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
                        <Trash className="h-4 w-4" />
                      </AnimatedButton>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template Editor</CardTitle>
                <CardDescription>Edit your selected template</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
[Your Name]
[Your Title]`}
                  />
                  <p className="text-xs text-muted-foreground">Use [placeholders] for dynamic content.</p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    [Recipient Name]
                  </Badge>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    [Subject]
                  </Badge>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    [Custom Response]
                  </Badge>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    [Your Name]
                  </Badge>
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
                <CardTitle>Calendar Integration</CardTitle>
                <CardDescription>Configure how AI handles meeting scheduling</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Automatic Meeting Scheduling</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow AI to automatically schedule meetings based on your availability
                      </p>
                    </div>
                    <ToggleSwitch checked={true} onCheckedChange={() => {}} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Calendly Integration</Label>
                      <p className="text-sm text-muted-foreground">
                        Share your Calendly link when someone requests a meeting
                      </p>
                    </div>
                    <ToggleSwitch checked={true} onCheckedChange={() => {}} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calendlyLink">Calendly Link</Label>
                  <Input id="calendlyLink" defaultValue="https://calendly.com/johndoe/30min" />
                  <p className="text-xs text-muted-foreground">
                    This link will be shared when someone requests to schedule a meeting with you.
                  </p>
                </div>

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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meetingTemplate">Meeting Confirmation Template</Label>
                  <Textarea
                    id="meetingTemplate"
                    rows={6}
                    defaultValue={`I've scheduled our meeting for [Date] at [Time]. 

You can join using this link: [Meeting Link]

Looking forward to our conversation!`}
                  />
                  <p className="text-xs text-muted-foreground">
                    This template will be used when confirming scheduled meetings.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <AnimatedButton gradient>
                  <Save className="mr-2 h-4 w-4" /> Save Settings
                </AnimatedButton>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
