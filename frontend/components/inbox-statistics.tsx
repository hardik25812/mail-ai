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

// Create a mapping function to convert API inbox data to the format expected by this component
export function mapApiInboxToStats(apiInbox: any): InboxStats {
  // Default values for visualization data that might not be in the API response
  const defaultEmailsByDay = [
    { day: "Mon", count: 0 },
    { day: "Tue", count: 0 },
    { day: "Wed", count: 0 },
    { day: "Thu", count: 0 },
    { day: "Fri", count: 0 },
    { day: "Sat", count: 0 },
    { day: "Sun", count: 0 },
  ];

  const defaultResponseTimeByHour = [
    { hour: "9AM", time: 0 },
    { hour: "10AM", time: 0 },
    { hour: "11AM", time: 0 },
    { hour: "12PM", time: 0 },
    { hour: "1PM", time: 0 },
    { hour: "2PM", time: 0 },
    { hour: "3PM", time: 0 },
    { hour: "4PM", time: 0 },
    { hour: "5PM", time: 0 },
  ];

  const defaultCategories = [
    { name: "Business", count: 0, color: "#7B68EE" },
    { name: "Personal", count: 0, color: "#4ECDC4" },
    { name: "Marketing", count: 0, color: "#FF6B6B" },
    { name: "Other", count: 0, color: "#FFE66D" },
  ];

  const defaultTopContacts = [
    { name: "Contact 1", email: "contact1@example.com", count: 0 },
    { name: "Contact 2", email: "contact2@example.com", count: 0 },
    { name: "Contact 3", email: "contact3@example.com", count: 0 },
    { name: "Contact 4", email: "contact4@example.com", count: 0 },
    { name: "Contact 5", email: "contact5@example.com", count: 0 },
  ];

  return {
    id: apiInbox.id || '',
    name: apiInbox.name || apiInbox.email || 'Unknown Inbox',
    email: apiInbox.email || '',
    totalEmails: apiInbox.total_count || 0,
    unreadEmails: apiInbox.unread_count || 0,
    sentEmails: apiInbox.sent_count || 0,
    archivedEmails: apiInbox.archived_count || 0,
    responseRate: apiInbox.response_rate || 0,
    avgResponseTime: apiInbox.avg_response_time || 0,
    meetingsScheduled: apiInbox.meetings_scheduled || 0,
    autoReplies: apiInbox.auto_replies || 0,
    emailsByDay: apiInbox.emails_by_day || defaultEmailsByDay,
    responseTimeByHour: apiInbox.response_time_by_hour || defaultResponseTimeByHour,
    categories: apiInbox.categories || defaultCategories,
    topContacts: apiInbox.top_contacts || defaultTopContacts,
  };
}

export function InboxStatistics({ inboxId, inboxData }: { inboxId: string; inboxData: any }) {
  // Convert API inbox data to the format expected by this component
  const formattedData = mapApiInboxToStats(inboxData);
  if (!inboxData) {
    return <div>Inbox not found</div>
  }
  
  // Use the formatted data for rendering

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Emails"
          value={formattedData.totalEmails}
          change="+24%"
          icon={<Mail className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Response Rate"
          value={`${formattedData.responseRate}%`}
          change="+5%"
          icon={<Mail className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Avg. Response Time"
          value={`${formattedData.avgResponseTime}m`}
          change="-15%"
          icon={<Mail className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Auto-Replies"
          value={formattedData.autoReplies}
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
