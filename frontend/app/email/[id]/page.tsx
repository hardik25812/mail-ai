"use client"

import { useParams } from 'next/navigation';
import { EmailThreadView } from '@/components/email-thread-view';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EmailThreadPage() {
  // Get params using useParams hook
  const params = useParams<{ id: string }>();
  const threadId = params.id;
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/inbox">
          <Button variant="ghost" size="sm" className="mb-4" aria-label="Back to Inboxes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inboxes
          </Button>
        </Link>
      </div>
      
      {threadId && <EmailThreadView threadId={threadId} />}
    </div>
  );
}
