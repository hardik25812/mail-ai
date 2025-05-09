import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { formatDistanceToNow, format } from 'date-fns';
import { ArrowLeft, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useEmailThread, useTriggerAIReply } from '../lib/hooks/useApi';
import { Email } from '../lib/api';
import Link from 'next/link';
import { toast } from 'sonner';

// Utility functions for email display
// Get the initials for the avatar
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Extract sender name from email sender field
const getSenderName = (sender: string) => {
  const match = sender.match(/^([^<]+)/);
  return match ? match[1].trim() : sender;
};

// Extract email address from sender field
const getSenderEmail = (sender: string) => {
  const match = sender.match(/<([^>]+)>/);
  return match ? match[1] : sender;
};

interface EmailThreadViewProps {
  threadId: string;
}

export function EmailThreadView({ threadId }: EmailThreadViewProps) {
  const { emails, loading, error, refetch } = useEmailThread(threadId);
  const { triggerReply, generating } = useTriggerAIReply();
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  // Handle AI reply generation
  const handleGenerateReply = async (emailId: string) => {
    setReplyingToId(emailId);
    try {
      await triggerReply(emailId);
      await refetch();
      toast.success('AI reply generated successfully');
    } catch (error) {
      toast.error('Failed to generate AI reply');
      console.error('Error generating AI reply:', error);
    } finally {
      setReplyingToId(null);
    }
  };

  // Sort emails by received_at
  const sortedEmails = emails ? [...emails].sort((a, b) => 
    new Date(a.received_at).getTime() - new Date(b.received_at).getTime()
  ) : [];

  // Get the subject from the first email
  const subject = sortedEmails.length > 0 ? sortedEmails[0].subject : 'Email Thread';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/inbox">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold">{subject}</h2>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="py-6 text-center">
            <p className="text-destructive">Failed to load email thread. Please try again.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && sortedEmails.length === 0 && (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground">No emails found in this thread</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {sortedEmails.map((email, index) => (
          <EmailCard 
            key={email.id} 
            email={email} 
            onGenerateReply={handleGenerateReply}
            isGenerating={generating && replyingToId === email.id}
            showReplyButton={email.is_inbound && index === sortedEmails.length - 1 && !sortedEmails.some(e => e.is_ai_reply && e.thread_id === email.thread_id)}
          />
        ))}
      </div>
    </div>
  );
}

interface EmailCardProps {
  email: Email;
  onGenerateReply: (emailId: string) => void;
  isGenerating: boolean;
  showReplyButton: boolean;
}

function EmailCard({ email, onGenerateReply, isGenerating, showReplyButton }: EmailCardProps) {
  const { id, subject, body, sender, is_inbound, is_ai_reply, received_at } = email;
  const senderName = getSenderName(sender);
  const senderEmail = getSenderEmail(sender);
  const timeAgo = formatDistanceToNow(new Date(received_at), { addSuffix: true });
  const formattedDate = format(new Date(received_at), 'PPpp');
  
  return (
    <Card className={is_ai_reply ? 'border-primary/30 bg-primary/5' : ''}>
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://avatar.vercel.sh/${senderEmail}`} alt={senderName} />
              <AvatarFallback>{getInitials(senderName)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                <CardTitle className="text-base">{senderName}</CardTitle>
                {is_ai_reply && (
                  <span className="ml-2 inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    <Sparkles className="mr-1 h-3 w-3" />
                    AI Reply
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{senderEmail}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-muted-foreground" title={formattedDate}>{timeAgo}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{is_inbound ? 'Received' : 'Sent'}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-4">
        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: body }} />
        
        {showReplyButton && (
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={() => onGenerateReply(id)} 
              disabled={isGenerating}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating AI Reply...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI Reply
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
