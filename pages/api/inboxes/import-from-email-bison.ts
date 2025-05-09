import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase-client';
import { EmailBisonClient } from '@/lib/email-bison';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient();
    
    // Initialize Email Bison client
    const emailBisonClient = new EmailBisonClient({
      apiUrl: process.env.EMAIL_BISON_API_URL || 'https://api.emailbison.com',
      apiKey: process.env.EMAIL_BISON_API_KEY || '',
    });

    // Fetch connected inboxes from Email Bison
    const bisonInboxes = await emailBisonClient.getConnectedInboxes();
    
    // Process each inbox and insert/update in our database
    const importResults = [];
    
    for (const bisonInbox of bisonInboxes) {
      // Check if inbox already exists in our database
      const { data: existingInbox } = await supabase
        .from('inboxes')
        .select('*')
        .eq('email', bisonInbox.email)
        .single();
      
      if (existingInbox) {
        // Update existing inbox
        const { data: updatedInbox, error } = await supabase
          .from('inboxes')
          .update({
            name: bisonInbox.name,
            provider: bisonInbox.provider,
            connected: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingInbox.id)
          .single();
        
        if (error) throw error;
        importResults.push({ ...updatedInbox, status: 'updated' });
      } else {
        // Insert new inbox
        const { data: newInbox, error } = await supabase
          .from('inboxes')
          .insert({
            name: bisonInbox.name,
            email: bisonInbox.email,
            provider: bisonInbox.provider,
            connected: true,
            auto_reply_enabled: false,
            office_hours_enabled: false,
            office_hours_start: '09:00',
            office_hours_end: '17:00',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .single();
        
        if (error) throw error;
        importResults.push({ ...newInbox, status: 'created' });
      }
    }
    
    return res.status(200).json(importResults);
  } catch (error) {
    console.error('Error importing inboxes from Email Bison:', error);
    return res.status(500).json({ error: 'Failed to import inboxes from Email Bison' });
  }
}
