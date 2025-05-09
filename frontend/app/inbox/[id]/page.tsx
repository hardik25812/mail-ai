"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { SidebarNavigation } from '@/components/sidebar-navigation'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { EmailThreadList } from '@/components/email-thread-list'
import { useInbox } from '@/lib/hooks/useApi'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'

interface Inbox {
  id: string
  email: string
  name?: string
}

interface Email {
  id: string
  subject: string
  from: string
  status: 'replied' | 'pending' | 'failed'
  receivedAt: string
}

export default function InboxPage() {
  // Get params using useParams hook
  const params = useParams<{ id: string }>();
  const inboxId = params.id;
  const { inbox, loading, error } = useInbox(inboxId);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error('Failed to load inbox details');
    }
  }, [error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !inbox) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <h1 className="text-2xl font-bold mb-4">Inbox not found</h1>
        <p className="text-muted-foreground mb-6">
          The inbox you're looking for doesn't exist or you don't have access to it.
        </p>
        <Link href="/inbox">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inboxes
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/inbox">
          <Button variant="ghost" size="sm" className="mb-4" aria-label="Back to Inboxes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inboxes
          </Button>
        </Link>
        {inbox && (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{inbox.name || 'Unnamed Inbox'}</h1>
              <p className="text-muted-foreground">{inbox.email}</p>
            </div>
          </div>
        )}
      </div>

      {inboxId && inbox && <EmailThreadList 
        inboxId={inboxId} 
        title={`Emails in ${inbox.name || inbox.email}`} 
      />}
    </div>
  )
}
