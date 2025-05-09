import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Mail, RefreshCw, Search } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useEmailThreads } from '../lib/hooks/useApi';
import { EmailThread } from '../lib/api';
import Link from 'next/link';

// Get the initials for the avatar
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

interface EmailThreadListProps {
  inboxId?: string;
  title?: string;
}

export function EmailThreadList({ inboxId, title = 'Email Threads' }: EmailThreadListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { threads, loading, error, refetch } = useEmailThreads(inboxId);

  // Filter threads based on search query
  const filteredThreads = threads?.filter(thread => 
    thread.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.latest_email.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.latest_email.senderEmail.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search emails..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="py-6 text-center">
            <p className="text-destructive">Failed to load email threads. Please try again.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && filteredThreads.length === 0 && (
        <Card>
          <CardContent className="py-6 text-center">
            <Mail className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No emails match your search' : 'No emails found in this inbox'}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {filteredThreads.map((thread) => (
          <ThreadCard key={thread.id} thread={thread} />
        ))}
      </div>
    </div>
  );
}

function ThreadCard({ thread }: { thread: EmailThread }) {
  const { id, subject, latest_email, email_count, has_unread } = thread;
  const timeAgo = formatDistanceToNow(new Date(latest_email.received_at), { addSuffix: true });
  
  return (
    <Link href={`/email/${id}`}>
      <Card className={`hover:bg-accent/50 transition-colors cursor-pointer ${has_unread ? 'border-primary/50' : ''}`}>
        <CardHeader className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://avatar.vercel.sh/${latest_email.senderEmail}`} alt={latest_email.senderName} />
                <AvatarFallback>{getInitials(latest_email.senderName)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center">
                  <CardTitle className="text-base">{latest_email.senderName}</CardTitle>
                  {has_unread && <Badge className="ml-2 bg-primary">New</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{latest_email.senderEmail}</p>
                <h3 className={`mt-1 font-medium ${has_unread ? 'font-semibold' : ''}`}>{subject}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{latest_email.body}</p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
              {email_count > 1 && (
                <Badge variant="outline" className="text-xs">
                  {email_count} emails
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
