import { useState, useEffect } from 'react';
import { EmailService, Email, Inbox } from '../services/email-service';

export function useInboxes() {
  const [inboxes, setInboxes] = useState<Inbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchInboxes = async () => {
      try {
        setLoading(true);
        const data = await EmailService.getInboxes();
        setInboxes(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch inboxes'));
        console.error('Error fetching inboxes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInboxes();
  }, []);

  return { inboxes, loading, error };
}

export function useEmails(inboxId: string) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!inboxId) return;

    const fetchEmails = async () => {
      try {
        setLoading(true);
        const data = await EmailService.getEmails(inboxId);
        setEmails(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch emails'));
        console.error('Error fetching emails:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, [inboxId]);

  // Function to trigger AI reply
  const triggerAiReply = async (emailId: string) => {
    try {
      const result = await EmailService.triggerAiReply(emailId);
      return result;
    } catch (err) {
      console.error('Error triggering AI reply:', err);
      throw err;
    }
  };

  // Function to send an email
  const sendEmail = async (params: {
    recipient: string;
    subject: string;
    body: string;
    thread_id?: string;
    cc?: string[];
    bcc?: string[];
  }) => {
    try {
      const result = await EmailService.sendEmail({
        inbox_id: inboxId,
        ...params
      });
      return result;
    } catch (err) {
      console.error('Error sending email:', err);
      throw err;
    }
  };

  return { emails, loading, error, triggerAiReply, sendEmail };
}

export function useEmail(emailId: string) {
  const [email, setEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!emailId) return;

    const fetchEmail = async () => {
      try {
        setLoading(true);
        const data = await EmailService.getEmail(emailId);
        setEmail(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch email'));
        console.error('Error fetching email:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmail();
  }, [emailId]);

  return { email, loading, error };
}
