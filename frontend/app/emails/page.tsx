"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Inbox, Send, Archive, Star, Trash, Download, MoreHorizontal } from "lucide-react"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock data for emails
const mockEmails = [
  {
    id: "1",
    subject: "Meeting Tomorrow",
    sender: {
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      avatar: "/stylized-initials.png",
    },
    preview: "Hi there, I wanted to confirm our meeting tomorrow at 2 PM...",
    date: "10:30 AM",
    isRead: false,
    hasAttachment: true,
    isStarred: true,
    labels: ["Important", "Work"],
    aiReplied: true,
  },
  {
    id: "2",
    subject: "Project Update",
    sender: {
      name: "Michael Chen",
      email: "michael.chen@example.com",
      avatar: "/microphone-crowd.png",
    },
    preview: "Here's the latest update on the project. We've completed the first phase...",
    date: "Yesterday",
    isRead: true,
    hasAttachment: false,
    isStarred: false,
    labels: ["Work"],
    aiReplied: false,
  },
  {
    id: "3",
    subject: "Invoice #1234",
    sender: {
      name: "Billing Department",
      email: "billing@example.com",
      avatar: "/abstract-blue-design.png",
    },
    preview: "Please find attached the invoice for your recent purchase...",
    date: "Jul 15",
    isRead: true,
    hasAttachment: true,
    isStarred: false,
    labels: ["Finance"],
    aiReplied: true,
  },
  {
    id: "4",
    subject: "Weekend Plans",
    sender: {
      name: "Alex Rodriguez",
      email: "alex.r@example.com",
      avatar: "/augmented-reality-cityscape.png",
    },
    preview: "Hey! Are you free this weekend? I was thinking we could go to that new restaurant...",
    date: "Jul 14",
    isRead: false,
    hasAttachment: false,
    isStarred: true,
    labels: ["Personal"],
    aiReplied: false,
  },
  {
    id: "5",
    subject: "Quarterly Report",
    sender: {
      name: "Finance Team",
      email: "finance@example.com",
      avatar: "/financial-times-headline.png",
    },
    preview: "Attached is the quarterly financial report for your review...",
    date: "Jul 12",
    isRead: true,
    hasAttachment: true,
    isStarred: false,
    labels: ["Finance", "Important"],
    aiReplied: true,
  },
]

export default function EmailsPage() {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentTab, setCurrentTab] = useState("inbox")

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

  const toggleEmailSelection = (emailId: string) => {
    if (selectedEmails.includes(emailId)) {
      setSelectedEmails(selectedEmails.filter((id) => id !== emailId))
    } else {
      setSelectedEmails([...selectedEmails, emailId])
    }
  }

  const toggleAllEmails = () => {
    if (selectedEmails.length === mockEmails.length) {
      setSelectedEmails([])
    } else {
      setSelectedEmails(mockEmails.map((email) => email.id))
    }
  }

  const filteredEmails = mockEmails.filter((email) => {
    if (!searchQuery) return true
    return (
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.sender.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.preview.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="p-6">
        <h1 className="text-3xl font-bold tracking-tight">Email Management</h1>
        <p className="text-muted-foreground">View and manage all your emails across connected inboxes.</p>
      </motion.div>

      <motion.div variants={item} className="px-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select inbox" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Inboxes</SelectItem>
                <SelectItem value="work">Work Gmail</SelectItem>
                <SelectItem value="personal">Personal Gmail</SelectItem>
              </SelectContent>
            </Select>
            <AnimatedButton variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </AnimatedButton>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="px-6">
        <Tabs defaultValue="inbox" onValueChange={setCurrentTab}>
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="inbox" className="flex items-center gap-2">
                <Inbox className="h-4 w-4" /> Inbox
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex items-center gap-2">
                <Send className="h-4 w-4" /> Sent
              </TabsTrigger>
              <TabsTrigger value="archived" className="flex items-center gap-2">
                <Archive className="h-4 w-4" /> Archived
              </TabsTrigger>
              <TabsTrigger value="starred" className="flex items-center gap-2">
                <Star className="h-4 w-4" /> Starred
              </TabsTrigger>
            </TabsList>

            {selectedEmails.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{selectedEmails.length} selected</span>
                <AnimatedButton variant="ghost" size="icon">
                  <Archive className="h-4 w-4" />
                </AnimatedButton>
                <AnimatedButton variant="ghost" size="icon">
                  <Trash className="h-4 w-4" />
                </AnimatedButton>
                <AnimatedButton variant="ghost" size="icon">
                  <Star className="h-4 w-4" />
                </AnimatedButton>
              </div>
            )}
          </div>

          <TabsContent value="inbox" className="mt-4">
            <Card>
              <CardHeader className="p-4 border-b">
                <div className="flex items-center gap-4">
                  <Checkbox checked={selectedEmails.length === mockEmails.length} onCheckedChange={toggleAllEmails} />
                  <CardTitle className="text-sm font-medium">
                    {selectedEmails.length > 0
                      ? `${selectedEmails.length} selected`
                      : `${filteredEmails.length} emails`}
                  </CardTitle>
                  <div className="ml-auto flex items-center gap-2">
                    <AnimatedButton variant="ghost" size="sm">
                      <Download className="h-4 w-4 mr-2" /> Export
                    </AnimatedButton>
                    <Select defaultValue="newest">
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="oldest">Oldest</SelectItem>
                        <SelectItem value="unread">Unread</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredEmails.map((email) => (
                    <div
                      key={email.id}
                      className={`flex items-start p-4 hover:bg-muted/50 cursor-pointer ${
                        !email.isRead ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-[220px]">
                        <Checkbox
                          checked={selectedEmails.includes(email.id)}
                          onCheckedChange={() => toggleEmailSelection(email.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Avatar>
                          <AvatarImage src={email.sender.avatar || "/placeholder.svg"} alt={email.sender.name} />
                          <AvatarFallback>{email.sender.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="truncate">
                          <p className={`font-medium ${!email.isRead ? "font-semibold" : ""}`}>{email.sender.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{email.sender.email}</p>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 px-4">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium truncate ${!email.isRead ? "font-semibold" : ""}`}>
                            {email.subject}
                          </p>
                          {email.labels.map((label) => (
                            <Badge
                              key={label}
                              variant="outline"
                              className={`${
                                label === "Important"
                                  ? "bg-red-500/10 text-red-500 border-red-500/20"
                                  : label === "Work"
                                    ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                    : label === "Personal"
                                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              }`}
                            >
                              {label}
                            </Badge>
                          ))}
                          {email.hasAttachment && (
                            <span className="text-muted-foreground">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                              </svg>
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{email.preview}</p>
                      </div>
                      <div className="flex items-center gap-3 min-w-[100px] text-right">
                        <div className="ml-auto">
                          <p className="text-xs text-muted-foreground">{email.date}</p>
                          {email.aiReplied && (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 mt-1">
                              AI Replied
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          {email.isStarred && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <AnimatedButton variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </AnimatedButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Mark as read</DropdownMenuItem>
                              <DropdownMenuItem>Star</DropdownMenuItem>
                              <DropdownMenuItem>Archive</DropdownMenuItem>
                              <DropdownMenuItem>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sent" className="mt-4">
            <Card>
              <CardContent className="p-12 flex flex-col items-center justify-center">
                <p className="text-muted-foreground">Sent emails will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="archived" className="mt-4">
            <Card>
              <CardContent className="p-12 flex flex-col items-center justify-center">
                <p className="text-muted-foreground">Archived emails will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="starred" className="mt-4">
            <Card>
              <CardContent className="p-12 flex flex-col items-center justify-center">
                <p className="text-muted-foreground">Starred emails will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
