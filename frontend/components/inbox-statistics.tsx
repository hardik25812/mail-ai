import type { ReactNode } from "react"
import { Mail } from "lucide-react"

export interface InboxStats {
  id: string
  name: string
  email: string
  totalEmails: number
  unreadEmails: number
  sentEmails: number
  archivedEmails: number
  responseRate: number
  avgResponseTime: number
  meetingsScheduled: number
  autoReplies: number
  emailsByDay: { day: string; count: number }[]
  responseTimeByHour: { hour: string; time: number }[]
  categories: { name: string; count: number; color: string }[]
  topContacts: { name: string; email: string; count: number }[]
}

export const mockInboxStats: InboxStats[] = [
  {
    id: "work-gmail",
    name: "Work Gmail",
    email: "john.doe@company.com",
    totalEmails: 1248,
    unreadEmails: 37,
    sentEmails: 892,
    archivedEmails: 456,
    responseRate: 94,
    avgResponseTime: 28,
    meetingsScheduled: 42,
    autoReplies: 356,
    emailsByDay: [
      { day: "Mon", count: 45 },
      { day: "Tue", count: 52 },
      { day: "Wed", count: 48 },
      { day: "Thu", count: 61 },
      { day: "Fri", count: 55 },
      { day: "Sat", count: 28 },
      { day: "Sun", count: 22 },
    ],
    responseTimeByHour: [
      { hour: "9AM", time: 45 },
      { hour: "10AM", time: 38 },
      { hour: "11AM", time: 42 },
      { hour: "12PM", time: 35 },
      { hour: "1PM", time: 40 },
      { hour: "2PM", time: 32 },
      { hour: "3PM", time: 28 },
      { hour: "4PM", time: 30 },
      { hour: "5PM", time: 52 },
    ],
    categories: [
      { name: "Business", count: 45, color: "#7B68EE" },
      { name: "Personal", count: 25, color: "#4ECDC4" },
      { name: "Marketing", count: 20, color: "#FF6B6B" },
      { name: "Other", count: 10, color: "#FFE66D" },
    ],
    topContacts: [
      { name: "Sarah Johnson", email: "sarah.j@example.com", count: 78 },
      { name: "Michael Chen", email: "m.chen@example.com", count: 65 },
      { name: "Alex Rodriguez", email: "alex.r@example.com", count: 52 },
      { name: "Emily Davis", email: "e.davis@example.com", count: 43 },
      { name: "David Kim", email: "d.kim@example.com", count: 37 },
    ],
  },
  {
    id: "personal-gmail",
    name: "Personal Gmail",
    email: "john.personal@gmail.com",
    totalEmails: 856,
    unreadEmails: 24,
    sentEmails: 623,
    archivedEmails: 312,
    responseRate: 88,
    avgResponseTime: 35,
    meetingsScheduled: 18,
    autoReplies: 245,
    emailsByDay: [
      { day: "Mon", count: 32 },
      { day: "Tue", count: 38 },
      { day: "Wed", count: 35 },
      { day: "Thu", count: 42 },
      { day: "Fri", count: 40 },
      { day: "Sat", count: 45 },
      { day: "Sun", count: 38 },
    ],
    responseTimeByHour: [
      { hour: "9AM", time: 52 },
      { hour: "10AM", time: 45 },
      { hour: "11AM", time: 48 },
      { hour: "12PM", time: 42 },
      { hour: "1PM", time: 46 },
      { hour: "2PM", time: 38 },
      { hour: "3PM", time: 35 },
      { hour: "4PM", time: 40 },
      { hour: "5PM", time: 58 },
    ],
    categories: [
      { name: "Friends", count: 55, color: "#7B68EE" },
      { name: "Family", count: 35, color: "#4ECDC4" },
      { name: "Shopping", count: 15, color: "#FF6B6B" },
      { name: "Other", count: 5, color: "#FFE66D" },
    ],
    topContacts: [
      { name: "Lisa Wong", email: "lisa.w@example.com", count: 65 },
      { name: "Robert Smith", email: "r.smith@example.com", count: 58 },
      { name: "Jessica Lee", email: "j.lee@example.com", count: 47 },
      { name: "Thomas Brown", email: "t.brown@example.com", count: 36 },
      { name: "Amanda Clark", email: "a.clark@example.com", count: 29 },
    ],
  },
  {
    id: "outlook",
    name: "Outlook",
    email: "j.doe@outlook.com",
    totalEmails: 624,
    unreadEmails: 18,
    sentEmails: 412,
    archivedEmails: 215,
    responseRate: 91,
    avgResponseTime: 32,
    meetingsScheduled: 24,
    autoReplies: 178,
    emailsByDay: [
      { day: "Mon", count: 28 },
      { day: "Tue", count: 35 },
      { day: "Wed", count: 32 },
      { day: "Thu", count: 38 },
      { day: "Fri", count: 36 },
      { day: "Sat", count: 22 },
      { day: "Sun", count: 18 },
    ],
    responseTimeByHour: [
      { hour: "9AM", time: 38 },
      { hour: "10AM", time: 32 },
      { hour: "11AM", time: 35 },
      { hour: "12PM", time: 30 },
      { hour: "1PM", time: 34 },
      { hour: "2PM", time: 28 },
      { hour: "3PM", time: 25 },
      { hour: "4PM", time: 32 },
      { hour: "5PM", time: 42 },
    ],
    categories: [
      { name: "Projects", count: 48, color: "#7B68EE" },
      { name: "Clients", count: 32, color: "#4ECDC4" },
      { name: "Internal", count: 18, color: "#FF6B6B" },
      { name: "Other", count: 12, color: "#FFE66D" },
    ],
    topContacts: [
      { name: "James Wilson", email: "j.wilson@example.com", count: 72 },
      { name: "Patricia Moore", email: "p.moore@example.com", count: 63 },
      { name: "Richard Taylor", email: "r.taylor@example.com", count: 54 },
      { name: "Jennifer White", email: "j.white@example.com", count: 45 },
      { name: "Charles Harris", email: "c.harris@example.com", count: 38 },
    ],
  },
]

export function InboxStatistics({ inboxId }: { inboxId: string }) {
  const inboxData = mockInboxStats.find((inbox) => inbox.id === inboxId)

  if (!inboxData) {
    return <div>Inbox not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Emails"
          value={inboxData.totalEmails}
          change="+24%"
          icon={<Mail className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Response Rate"
          value={`${inboxData.responseRate}%`}
          change="+5%"
          icon={<Mail className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Avg. Response Time"
          value={`${inboxData.avgResponseTime}m`}
          change="-15%"
          icon={<Mail className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Auto-Replies"
          value={inboxData.autoReplies}
          change="+18%"
          icon={<Mail className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  change,
  icon,
}: {
  title: string
  value: string | number
  change: string
  icon: ReactNode
}) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <div className="flex flex-row items-center justify-between pb-2 space-y-0">
          <h3 className="tracking-tight text-sm font-medium">{title}</h3>
          {icon}
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-green-500">{change}</span>
          <p className="text-xs text-muted-foreground">from last period</p>
        </div>
      </div>
    </div>
  )
}
