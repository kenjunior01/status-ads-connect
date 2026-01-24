-- Create campaign_proofs table for verification system
CREATE TABLE public.campaign_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID NOT NULL,
  proof_type TEXT NOT NULL CHECK (proof_type IN ('screenshot', 'video', 'link')),
  file_url TEXT NOT NULL,
  file_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  reviewer_notes TEXT,
  view_count INTEGER,
  engagement_data JSONB
);

-- Enable RLS on campaign_proofs
ALTER TABLE public.campaign_proofs ENABLE ROW LEVEL SECURITY;

-- Creators can insert proofs for their campaigns
CREATE POLICY "Creators can insert proofs"
ON public.campaign_proofs
FOR INSERT
WITH CHECK (creator_id = auth.uid());

-- Creators can view their own proofs
CREATE POLICY "Creators can view own proofs"
ON public.campaign_proofs
FOR SELECT
USING (creator_id = auth.uid());

-- Advertisers can view proofs for their campaigns
CREATE POLICY "Advertisers can view campaign proofs"
ON public.campaign_proofs
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.campaigns c 
  WHERE c.id = campaign_proofs.campaign_id 
  AND c.advertiser_id = auth.uid()
));

-- Advertisers can update proof status (approve/reject)
CREATE POLICY "Advertisers can review proofs"
ON public.campaign_proofs
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.campaigns c 
  WHERE c.id = campaign_proofs.campaign_id 
  AND c.advertiser_id = auth.uid()
));

-- Admins can do everything (using has_role function)
CREATE POLICY "Admins full access to proofs"
ON public.campaign_proofs
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add verification fields to campaigns table
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS proof_required BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS proof_deadline TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'not_started' CHECK (verification_status IN ('not_started', 'proof_submitted', 'under_review', 'verified', 'rejected'));

-- Create user_favorites table for persistent favorites
CREATE TABLE public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, profile_id)
);

-- Enable RLS on user_favorites
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Users can manage their own favorites
CREATE POLICY "Users can view own favorites"
ON public.user_favorites
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
ON public.user_favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
ON public.user_favorites
FOR DELETE
USING (auth.uid() = user_id);

-- Create disputes table
CREATE TABLE public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  opened_by UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved')),
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID
);

-- Enable RLS on disputes
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Participants can view disputes for their campaigns
CREATE POLICY "Participants can view disputes"
ON public.disputes
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.campaigns c 
  WHERE c.id = disputes.campaign_id 
  AND (c.creator_id = auth.uid() OR c.advertiser_id = auth.uid())
));

-- Participants can create disputes
CREATE POLICY "Participants can create disputes"
ON public.disputes
FOR INSERT
WITH CHECK (opened_by = auth.uid() AND EXISTS (
  SELECT 1 FROM public.campaigns c 
  WHERE c.id = campaign_id 
  AND (c.creator_id = auth.uid() OR c.advertiser_id = auth.uid())
));

-- Admins can manage all disputes
CREATE POLICY "Admins full access to disputes"
ON public.disputes
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for campaign proofs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('campaign-proofs', 'campaign-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for campaign-proofs bucket
CREATE POLICY "Creators can upload proofs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'campaign-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their proofs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'campaign-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Advertisers can view campaign proofs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'campaign-proofs'
);