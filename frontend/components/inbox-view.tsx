"use client"

import { useState } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  RefreshCw, 
  Filter, 
  Search,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'

interface Email {
  id: string
  subject: string
  from: string
  status: 'replied' | 'pending' | 'failed'
  receivedAt: string
}

interface InboxViewProps {
  inboxEmail: string
  emails?: Email[]
  isLoading?: boolean
}

export function InboxView({ inboxEmail, emails = [], isLoading = false }: InboxViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Default emails if none provided
  const defaultEmails: Email[] = [
    { 
      id: '1', 
      subject: 'Inquiry', 
      from: 'john@example.com', 
      status: 'replied',
      receivedAt: '2025-04-28T10:30:00Z'
    },
    { 
      id: '2', 
      subject: 'Pricing', 
      from: 'emily@example.com', 
      status: 'pending',
      receivedAt: '2025-04-28T11:15:00Z'
    },
    { 
      id: '3', 
      subject: 'Support', 
      from: 'david@example.com', 
      status: 'replied',
      receivedAt: '2025-04-28T09:45:00Z'
    },
    { 
      id: '4', 
      subject: 'Partnership Opportunity', 
      from: 'sarah@example.com', 
      status: 'pending',
      receivedAt: '2025-04-28T14:20:00Z'
    },
    { 
      id: '5', 
      subject: 'Technical Issue', 
      from: 'michael@example.com', 
      status: 'failed',
      receivedAt: '2025-04-28T08:10:00Z'
    }
  ]
  
  const displayEmails = emails.length > 0 ? emails : defaultEmails
  
  // Filter emails based on search query and status filter
  const filteredEmails = displayEmails.filter(email => {
    const matchesSearch = 
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = 
      statusFilter === 'all' || 
      email.status === statusFilter
    
    return matchesSearch && matchesStatus
  })
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'replied':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Replied
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Failed
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="flex-1 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Inbox: {inboxEmail}</h1>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Subject</TableHead>
              <TableHead className="w-[30%]">From</TableHead>
              <TableHead className="w-[20%]">AI Reply Status</TableHead>
              <TableHead className="w-[10%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                  <p>Loading emails...</p>
                </TableCell>
              </TableRow>
            ) : filteredEmails.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <p className="text-muted-foreground">No emails found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredEmails.map(email => (
                <TableRow key={email.id}>
                  <TableCell className="font-medium">{email.subject}</TableCell>
                  <TableCell>{email.from}</TableCell>
                  <TableCell>{getStatusBadge(email.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
