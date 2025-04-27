-- Create AI Reply Jobs table
CREATE TABLE IF NOT EXISTS public.ai_reply_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_id UUID NOT NULL REFERENCES public.emails(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS ai_reply_jobs_email_id_idx ON public.ai_reply_jobs(email_id);
CREATE INDEX IF NOT EXISTS ai_reply_jobs_user_id_idx ON public.ai_reply_jobs(user_id);
CREATE INDEX IF NOT EXISTS ai_reply_jobs_status_idx ON public.ai_reply_jobs(status);
CREATE INDEX IF NOT EXISTS ai_reply_jobs_campaign_id_idx ON public.ai_reply_jobs(campaign_id);

-- Add RLS policies
ALTER TABLE public.ai_reply_jobs ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own jobs
CREATE POLICY "Users can view their own jobs" 
  ON public.ai_reply_jobs 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow service role to manage all jobs
CREATE POLICY "Service role can manage all jobs" 
  ON public.ai_reply_jobs 
  USING (auth.role() = 'service_role');

-- Update database types
COMMENT ON TABLE public.ai_reply_jobs IS 'Jobs for generating AI replies to emails';
