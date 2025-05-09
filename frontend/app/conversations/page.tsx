"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  Star,
  Clock,
  MoreHorizontal,
  ArrowLeft,
  ArrowRight,
  Mail,
  Calendar,
  Paperclip,
  Send,
  Trash,
  Archive,
  Reply,
  Forward,
} from "lucide-react"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"

export default function ConversationsPage() {
  const [selectedEmail, setSelectedEmail] = useState(1)
  const [showReply, setShowReply] = useState(false)

  const emails = [
    {
      id: 1,
      from: {
        name: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      subject: "Project Update - Q2 Results",
      preview:
        "Hi John, I wanted to share the latest results from our Q2 analysis. The numbers are looking promising and...",
      date: "10:23 AM",
      unread: true,
      starred: true,
      hasAttachment: true,
      labels: ["Work", "Important"],
    },
    {
      id: 2,
      from: {
        name: "Alex Chen",
        email: "alex.chen@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      subject: "Meeting Confirmation: Strategy Discussion",
      preview:
        "This is a confirmation for our meeting tomorrow at 2:00 PM. I've attached the agenda and some preliminary...",
      date: "Yesterday",
      unread: false,
      starred: false,
      hasAttachment: true,
      labels: ["Meeting"],
    },
    {
      id: 3,
      from: {
        name: "David Miller",
        email: "david.miller@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      subject: "Inquiry about pricing plans",
      preview:
        "Hello, I'm interested in your premium plan but I have a few questions about the features included. Could you...",
      date: "Yesterday",
      unread: true,
      starred: false,
      hasAttachment: false,
      labels: ["Sales", "Follow-up"],
    },
    {
      id: 4,
      from: {
        name: "Emily Parker",
        email: "emily.parker@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      subject: "Content calendar for next month",
      preview:
        "Hi team, I've prepared the content calendar for next month. Please review and let me know if you have any...",
      date: "Jul 12",
      unread: false,
      starred: true,
      hasAttachment: true,
      labels: ["Marketing"],
    },
    {
      id: 5,
      from: {
        name: "Michael Roberts",
        email: "michael.roberts@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      subject: "Invoice #1234 - Due in 7 days",
      preview:
        "Please find attached invoice #1234 for the services provided in June. The payment is due in 7 days. If you have...",
      date: "Jul 10",
      unread: false,
      starred: false,
      hasAttachment: true,
      labels: ["Finance"],
    },
  ]

  const selectedEmailData = emails.find((email) => email.id === selectedEmail)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Conversations</h1>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search emails..." className="pl-8" />
          </div>
          <AnimatedButton variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </AnimatedButton>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-[350px_1fr] gap-4 h-full overflow-hidden">
        {/* Email List */}
        <Card className="overflow-hidden flex flex-col">
          <div className="p-2 border-b">
            <Tabs defaultValue="inbox" className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="inbox">Inbox</TabsTrigger>
                <TabsTrigger value="sent">Sent</TabsTrigger>
                <TabsTrigger value="drafts">Drafts</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex-1 overflow-y-auto">
            <motion.div variants={container} initial="hidden" animate="show" className="divide-y divide-border">
              {emails.map((email) => (
                <motion.div
                  key={email.id}
                  variants={item}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedEmail === email.id ? "bg-muted" : "hover:bg-muted/50"
                  } ${email.unread ? "border-l-4 border-l-primary" : ""}`}
                  onClick={() => setSelectedEmail(email.id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={email.from.avatar || "/placeholder.svg"} alt={email.from.name} />
                      <AvatarFallback>{email.from.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={`font-medium truncate ${email.unread ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {email.from.name}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{email.date}</span>
                      </div>
                      <h3 className={`text-sm truncate ${email.unread ? "font-medium" : ""}`}>{email.subject}</h3>
                      <p className="text-xs text-muted-foreground truncate">{email.preview}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {email.starred && <Star className="h-3 w-3 fill-amber-500 text-amber-500" />}
                        {email.hasAttachment && <Paperclip className="h-3 w-3 text-muted-foreground" />}
                        {email.labels.map((label) => (
                          <Badge key={label} variant="outline" className="text-[10px] px-1 py-0 h-4">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </Card>

        {/* Email Detail */}
        <Card className="overflow-hidden flex flex-col">
          {selectedEmailData && (
            <>
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AnimatedButton variant="ghost" size="icon" className="h-8 w-8">
                    <ArrowLeft className="h-4 w-4" />
                  </AnimatedButton>
                  <h2 className="font-medium">{selectedEmailData.subject}</h2>
                </div>
                <div className="flex items-center gap-1">
                  <AnimatedButton variant="ghost" size="icon" className="h-8 w-8">
                    <Archive className="h-4 w-4" />
                  </AnimatedButton>
                  <AnimatedButton variant="ghost" size="icon" className="h-8 w-8">
                    <Trash className="h-4 w-4" />
                  </AnimatedButton>
                  <AnimatedButton variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </AnimatedButton>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-start gap-4 mb-6">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={selectedEmailData.from.avatar || "/placeholder.svg"}
                      alt={selectedEmailData.from.name}
                    />
                    <AvatarFallback>{selectedEmailData.from.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{selectedEmailData.from.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedEmailData.from.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{selectedEmailData.date}</span>
                        <AnimatedButton variant="ghost" size="icon" className="h-8 w-8">
                          <Star
                            className={`h-4 w-4 ${selectedEmailData.starred ? "fill-amber-500 text-amber-500" : ""}`}
                          />
                        </AnimatedButton>
                      </div>
                    </div>

                    <div className="mt-4 space-y-4">
                      <p>Hi John,</p>

                      {selectedEmailData.id === 1 && (
                        <>
                          <p>
                            I wanted to share the latest results from our Q2 analysis. The numbers are looking promising
                            and I think we're on track to exceed our targets for the year.
                          </p>

                          <p>Here are the key highlights:</p>

                          <ul className="list-disc pl-5 space-y-1">
                            <li>Revenue increased by 24% compared to Q1</li>
                            <li>Customer acquisition cost decreased by 12%</li>
                            <li>Retention rate improved to 87%</li>
                            <li>Average response time reduced to under 2 hours</li>
                          </ul>

                          <p>
                            I've attached the full report for your review. Let's discuss these results in our next
                            meeting.
                          </p>

                          <p>
                            Best regards,
                            <br />
                            Sarah
                          </p>

                          <div className="mt-6 p-3 border rounded-md bg-muted/30">
                            <div className="flex items-center gap-2">
                              <Paperclip className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Q2_Results_Report.pdf</span>
                              <span className="text-xs text-muted-foreground">(2.4 MB)</span>
                              <AnimatedButton variant="ghost" size="sm" className="ml-auto">
                                Download
                              </AnimatedButton>
                            </div>
                          </div>
                        </>
                      )}

                      {selectedEmailData.id === 2 && (
                        <>
                          <p>
                            This is a confirmation for our meeting tomorrow at 2:00 PM. I've attached the agenda and
                            some preliminary notes for our strategy discussion.
                          </p>

                          <p>
                            Please let me know if you need to reschedule or if you have any topics you'd like to add to
                            the agenda.
                          </p>

                          <p>Looking forward to our discussion!</p>

                          <p>
                            Best,
                            <br />
                            Alex
                          </p>

                          <div className="mt-6 p-3 border rounded-md bg-muted/30">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-500" />
                              <div>
                                <span className="font-medium">Strategy Discussion</span>
                                <p className="text-xs text-muted-foreground">Tomorrow, 2:00 PM - 3:00 PM</p>
                              </div>
                              <AnimatedButton variant="outline" size="sm" className="ml-auto">
                                Add to Calendar
                              </AnimatedButton>
                            </div>
                          </div>
                        </>
                      )}

                      {selectedEmailData.id > 2 && (
                        <>
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                            labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                            laboris nisi ut aliquip ex ea commodo consequat.
                          </p>

                          <p>
                            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                            mollit anim id est laborum.
                          </p>

                          <p>
                            Regards,
                            <br />
                            {selectedEmailData.from.name}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="flex items-center gap-4 mb-6">
                  <div className="p-2 rounded-full bg-primary/20">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">AI-Generated Reply</p>
                    <p className="text-sm text-muted-foreground">Automatically sent on Jul 14, 10:45 AM</p>
                  </div>
                </div>

                <div className="ml-12 p-4 border rounded-md bg-muted/30">
                  <p>Hi {selectedEmailData.from.name},</p>
                  <p className="mt-2">
                    Thank you for your email. I've received your{" "}
                    {selectedEmailData.id === 1
                      ? "Q2 results report"
                      : selectedEmailData.id === 2
                        ? "meeting confirmation"
                        : "message"}{" "}
                    and will review it shortly.
                  </p>

                  {selectedEmailData.id === 1 && (
                    <p className="mt-2">
                      The preliminary numbers look promising. I'll go through the full report and we can discuss the
                      details in our upcoming meeting.
                    </p>
                  )}

                  {selectedEmailData.id === 2 && (
                    <p className="mt-2">
                      I've confirmed the meeting for tomorrow at 2:00 PM and added it to my calendar. The agenda looks
                      good, and I don't have any additional topics to add at this time.
                    </p>
                  )}

                  <p className="mt-2">
                    Best regards,
                    <br />
                    John Doe
                  </p>
                </div>

                {showReply ? (
                  <div className="mt-6">
                    <div className="p-4 border rounded-md">
                      <div className="flex items-center justify-between mb-4">
                        <p className="font-medium">Reply to {selectedEmailData.from.name}</p>
                        <AnimatedButton variant="ghost" size="sm" onClick={() => setShowReply(false)}>
                          Cancel
                        </AnimatedButton>
                      </div>
                      <Textarea
                        placeholder="Write your reply here..."
                        className="min-h-[120px] mb-4"
                        defaultValue={`Hi ${selectedEmailData.from.name},\n\nThank you for your email. `}
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AnimatedButton variant="outline" size="sm">
                            <Paperclip className="h-4 w-4 mr-1" /> Attach
                          </AnimatedButton>
                        </div>
                        <div className="flex items-center gap-2">
                          <AnimatedButton variant="outline" size="sm">
                            Save Draft
                          </AnimatedButton>
                          <AnimatedButton gradient size="sm">
                            <Send className="h-4 w-4 mr-1" /> Send
                          </AnimatedButton>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 flex items-center gap-2">
                    <AnimatedButton onClick={() => setShowReply(true)}>
                      <Reply className="h-4 w-4 mr-1" /> Reply
                    </AnimatedButton>
                    <AnimatedButton variant="outline">
                      <Forward className="h-4 w-4 mr-1" /> Forward
                    </AnimatedButton>
                  </div>
                )}
              </div>

              <div className="p-4 border-t bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Timeline</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        <div className="h-[2px] w-12 bg-blue-500"></div>
                      </div>
                      <span className="text-xs text-muted-foreground">Received Jul 14, 10:23 AM</span>

                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <div className="h-[2px] w-12 bg-primary"></div>
                      </div>
                      <span className="text-xs text-muted-foreground">AI Reply Jul 14, 10:45 AM</span>

                      {selectedEmailData.id === 2 && (
                        <>
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <div className="h-[2px] w-12 bg-green-500"></div>
                          </div>
                          <span className="text-xs text-muted-foreground">Meeting Confirmed</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <AnimatedButton variant="outline" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-1" /> Previous
                    </AnimatedButton>
                    <AnimatedButton variant="outline" size="sm" className="ml-2">
                      Next <ArrowRight className="h-4 w-4 ml-1" />
                    </AnimatedButton>
                  </div>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
