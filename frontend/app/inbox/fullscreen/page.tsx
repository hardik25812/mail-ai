"use client"

import { useState } from "react"
import {
  Search,
  Filter,
  Star,
  MoreHorizontal,
  ArrowLeft,
  Mail,
  Calendar,
  Paperclip,
  Send,
  Trash,
  Archive,
  Reply,
  Forward,
  Plus,
  ChevronDown,
  RefreshCw,
  CheckSquare,
  Square,
  Tag,
  AlertCircle,
  InboxIcon,
  MailPlus,
  MailQuestion,
  MailX,
  Bookmark,
  Folder,
} from "lucide-react"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function FullscreenInboxPage() {
  const [selectedEmail, setSelectedEmail] = useState<number | null>(1)
  const [showReply, setShowReply] = useState(false)
  const [selectedEmails, setSelectedEmails] = useState<number[]>([])
  const [selectedFolder, setSelectedFolder] = useState("inbox")
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])

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
    {
      id: 6,
      from: {
        name: "Jennifer Lee",
        email: "jennifer.lee@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      subject: "Product feedback request",
      preview:
        "Hi John, We're collecting feedback on our new product features. Could you spare 5 minutes to fill out our survey?...",
      date: "Jul 8",
      unread: false,
      starred: false,
      hasAttachment: false,
      labels: ["Product"],
    },
    {
      id: 7,
      from: {
        name: "Robert Wilson",
        email: "robert.wilson@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      subject: "Team building event next month",
      preview: "Hello team, I'm excited to announce our upcoming team building event next month. We'll be going to...",
      date: "Jul 5",
      unread: false,
      starred: true,
      hasAttachment: false,
      labels: ["Team", "Important"],
    },
  ]

  const filteredEmails = emails.filter((email) => {
    if (selectedFolder === "starred" && !email.starred) return false
    if (selectedFolder === "important" && !email.labels.includes("Important")) return false
    if (selectedFolder === "sent") return false // In a real app, this would filter for sent emails
    if (selectedFolder === "drafts") return false // In a real app, this would filter for drafts
    if (selectedFolder === "trash") return false // In a real app, this would filter for deleted emails

    // Filter by labels if any are selected
    if (selectedLabels.length > 0) {
      return email.labels.some((label) => selectedLabels.includes(label))
    }

    return true
  })

  const selectedEmailData = emails.find((email) => email.id === selectedEmail)

  const allLabels = Array.from(new Set(emails.flatMap((email) => email.labels)))

  const toggleSelectEmail = (id: number) => {
    if (selectedEmails.includes(id)) {
      setSelectedEmails(selectedEmails.filter((emailId) => emailId !== id))
    } else {
      setSelectedEmails([...selectedEmails, id])
    }
  }

  const toggleSelectAll = () => {
    if (selectedEmails.length === filteredEmails.length) {
      setSelectedEmails([])
    } else {
      setSelectedEmails(filteredEmails.map((email) => email.id))
    }
  }

  const toggleLabel = (label: string) => {
    if (selectedLabels.includes(label)) {
      setSelectedLabels(selectedLabels.filter((l) => l !== label))
    } else {
      setSelectedLabels([...selectedLabels, label])
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top Toolbar */}
      <div className="border-b bg-background p-2 flex items-center gap-2">
        <div className="flex items-center gap-2">
          <AnimatedButton variant="ghost" size="icon" className="h-9 w-9">
            {selectedEmails.length > 0 ? (
              <Square className="h-4 w-4" onClick={toggleSelectAll} />
            ) : (
              <CheckSquare className="h-4 w-4" onClick={toggleSelectAll} />
            )}
          </AnimatedButton>

          <AnimatedButton variant="ghost" size="icon" className="h-9 w-9">
            <RefreshCw className="h-4 w-4" />
          </AnimatedButton>

          {selectedEmails.length > 0 ? (
            <>
              <AnimatedButton variant="ghost" size="icon" className="h-9 w-9">
                <Archive className="h-4 w-4" />
              </AnimatedButton>
              <AnimatedButton variant="ghost" size="icon" className="h-9 w-9">
                <Trash className="h-4 w-4" />
              </AnimatedButton>
              <AnimatedButton variant="ghost" size="icon" className="h-9 w-9">
                <MailX className="h-4 w-4" />
              </AnimatedButton>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <AnimatedButton variant="ghost" size="icon" className="h-9 w-9">
                    <Tag className="h-4 w-4" />
                  </AnimatedButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Add label</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {allLabels.map((label) => (
                    <DropdownMenuItem key={label}>{label}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <AnimatedButton variant="ghost" size="icon" className="h-9 w-9">
                    <Folder className="h-4 w-4" />
                  </AnimatedButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Move to folder</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Inbox</DropdownMenuItem>
                  <DropdownMenuItem>Archived</DropdownMenuItem>
                  <DropdownMenuItem>Spam</DropdownMenuItem>
                  <DropdownMenuItem>Trash</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <AnimatedButton variant="ghost" className="h-9">
                    <Filter className="h-4 w-4 mr-2" /> Filter <ChevronDown className="h-4 w-4 ml-1" />
                  </AnimatedButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>All</DropdownMenuItem>
                  <DropdownMenuItem>Unread</DropdownMenuItem>
                  <DropdownMenuItem>Starred</DropdownMenuItem>
                  <DropdownMenuItem>With attachments</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search emails..." className="pl-8 h-9" />
          </div>

          <AnimatedButton gradient className="h-9">
            <Plus className="mr-2 h-4 w-4" /> Compose
          </AnimatedButton>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[240px_350px_1fr] overflow-hidden">
        {/* Folders Sidebar */}
        <div className="border-r hidden md:block overflow-y-auto">
          <div className="p-4 space-y-1">
            <button
              className={`flex items-center gap-2 w-full p-2 rounded-md text-left ${selectedFolder === "inbox" ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
              onClick={() => setSelectedFolder("inbox")}
            >
              <InboxIcon className="h-4 w-4" />
              <span>Inbox</span>
              <Badge className="ml-auto">12</Badge>
            </button>
            <button
              className={`flex items-center gap-2 w-full p-2 rounded-md text-left ${selectedFolder === "starred" ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
              onClick={() => setSelectedFolder("starred")}
            >
              <Star className="h-4 w-4" />
              <span>Starred</span>
            </button>
            <button
              className={`flex items-center gap-2 w-full p-2 rounded-md text-left ${selectedFolder === "important" ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
              onClick={() => setSelectedFolder("important")}
            >
              <AlertCircle className="h-4 w-4" />
              <span>Important</span>
            </button>
            <button
              className={`flex items-center gap-2 w-full p-2 rounded-md text-left ${selectedFolder === "sent" ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
              onClick={() => setSelectedFolder("sent")}
            >
              <MailPlus className="h-4 w-4" />
              <span>Sent</span>
            </button>
            <button
              className={`flex items-center gap-2 w-full p-2 rounded-md text-left ${selectedFolder === "drafts" ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
              onClick={() => setSelectedFolder("drafts")}
            >
              <MailQuestion className="h-4 w-4" />
              <span>Drafts</span>
              <Badge className="ml-auto">3</Badge>
            </button>
            <button
              className={`flex items-center gap-2 w-full p-2 rounded-md text-left ${selectedFolder === "trash" ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
              onClick={() => setSelectedFolder("trash")}
            >
              <Trash className="h-4 w-4" />
              <span>Trash</span>
            </button>
          </div>

          <Separator className="my-2" />

          <div className="p-4">
            <h3 className="text-sm font-medium mb-2">Labels</h3>
            <div className="space-y-1">
              {allLabels.map((label) => (
                <button
                  key={label}
                  className={`flex items-center gap-2 w-full p-2 rounded-md text-left ${selectedLabels.includes(label) ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                  onClick={() => toggleLabel(label)}
                >
                  <Bookmark className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Email List */}
        <div className={`border-r overflow-y-auto ${selectedEmail !== null ? "hidden md:block" : ""}`}>
          <div className="divide-y divide-border">
            {filteredEmails.length > 0 ? (
              filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className={`flex items-start p-3 cursor-pointer transition-colors ${
                    selectedEmail === email.id ? "bg-muted" : "hover:bg-muted/50"
                  } ${email.unread ? "border-l-4 border-l-primary pl-2" : "pl-3"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-2 mt-1">
                      <div
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSelectEmail(email.id)
                        }}
                      >
                        {selectedEmails.includes(email.id) ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Toggle star in a real app
                        }}
                      >
                        <Star
                          className={`h-4 w-4 ${email.starred ? "fill-amber-500 text-amber-500" : "text-muted-foreground"}`}
                        />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0" onClick={() => setSelectedEmail(email.id)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={email.from.avatar || "/placeholder.svg"} alt={email.from.name} />
                            <AvatarFallback>{email.from.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <p
                            className={`font-medium truncate ${email.unread ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {email.from.name}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{email.date}</span>
                      </div>
                      <h3 className={`text-sm truncate mt-1 ${email.unread ? "font-medium" : ""}`}>{email.subject}</h3>
                      <p className="text-xs text-muted-foreground truncate mt-1">{email.preview}</p>
                      <div className="flex items-center gap-1 mt-2">
                        {email.hasAttachment && <Paperclip className="h-3 w-3 text-muted-foreground" />}
                        {email.labels.map((label) => (
                          <Badge key={label} variant="outline" className="text-[10px] px-1 py-0 h-4">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto p-3 rounded-full bg-muted w-fit mb-3">
                  <Mail className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium">No emails found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Email Detail */}
        {selectedEmail !== null && (
          <div className="overflow-y-auto">
            {selectedEmailData && (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AnimatedButton
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 md:hidden"
                      onClick={() => setSelectedEmail(null)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </AnimatedButton>
                    <h2 className="font-medium truncate">{selectedEmailData.subject}</h2>
                  </div>
                  <div className="flex items-center gap-1">
                    <AnimatedButton variant="ghost" size="icon" className="h-8 w-8">
                      <Archive className="h-4 w-4" />
                    </AnimatedButton>
                    <AnimatedButton variant="ghost" size="icon" className="h-8 w-8">
                      <Trash className="h-4 w-4" />
                    </AnimatedButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <AnimatedButton variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </AnimatedButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Star className="mr-2 h-4 w-4" />
                          <span>{selectedEmailData.starred ? "Unstar" : "Star"}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          <span>Mark as {selectedEmailData.unread ? "read" : "unread"}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Forward className="mr-2 h-4 w-4" />
                          <span>Forward</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                              I wanted to share the latest results from our Q2 analysis. The numbers are looking
                              promising and I think we're on track to exceed our targets for the year.
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
                              Please let me know if you need to reschedule or if you have any topics you'd like to add
                              to the agenda.
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
                              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
                              ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                              ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </p>

                            <p>
                              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                              nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                              deserunt mollit anim id est laborum.
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
