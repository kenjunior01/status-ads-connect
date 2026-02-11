
-- Add CPV-related columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS follower_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS engagement_rate numeric(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cpv_rate numeric(10,4) DEFAULT 0;

-- Add CPV/escrow columns to campaigns
ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS cpv_rate numeric(10,4) DEFAULT 0,
ADD COLUMN IF NOT EXISTS expected_views integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_views integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS escrow_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS escrow_amount numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_fee numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS creator_payout numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS duration_days integer DEFAULT 7,
ADD COLUMN IF NOT EXISTS publish_deadline timestamp with time zone,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;

-- Creator wallets for balance tracking
CREATE TABLE IF NOT EXISTS public.creator_wallets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  available_balance numeric(12,2) NOT NULL DEFAULT 0,
  pending_balance numeric(12,2) NOT NULL DEFAULT 0,
  total_earned numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.creator_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet"
ON public.creator_wallets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert wallet"
ON public.creator_wallets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update wallet"
ON public.creator_wallets FOR UPDATE
USING (auth.uid() = user_id);

-- Transactions table for payment history
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid REFERENCES public.campaigns(id),
  payer_id uuid NOT NULL,
  payee_id uuid NOT NULL,
  amount numeric(12,2) NOT NULL,
  platform_fee numeric(12,2) DEFAULT 0,
  net_amount numeric(12,2) DEFAULT 0,
  type text NOT NULL, -- 'escrow_hold', 'escrow_release', 'refund', 'withdrawal', 'penalty'
  status text DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  stripe_payment_intent_id text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = payer_id OR auth.uid() = payee_id);

CREATE POLICY "Authenticated users can create transactions"
ON public.transactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = payer_id);

-- Withdrawals table
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  amount numeric(12,2) NOT NULL,
  status text DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
  pix_key text,
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own withdrawals"
ON public.withdrawals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can request withdrawals"
ON public.withdrawals FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admin policies for wallets, transactions, withdrawals
CREATE POLICY "Admins full access wallets"
ON public.creator_wallets FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins full access transactions"
ON public.transactions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins full access withdrawals"
ON public.withdrawals FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to calculate CPV rate
CREATE OR REPLACE FUNCTION public.calculate_cpv_rate(
  _follower_count integer,
  _engagement_rate numeric,
  _niche text DEFAULT NULL
)
RETURNS numeric
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base_cpv numeric;
  niche_multiplier numeric := 1.0;
BEGIN
  -- Base CPV = (followers * engagement_rate) / 1000
  base_cpv := (_follower_count * _engagement_rate / 100.0) / 1000.0;
  
  -- Minimum CPV
  IF base_cpv < 0.05 THEN
    base_cpv := 0.05;
  END IF;
  
  -- Premium niche bonus (+50%)
  IF _niche IN ('Tecnologia', 'Negócios', 'Finanças', 'Marketing') THEN
    niche_multiplier := 1.5;
  END IF;
  
  RETURN ROUND(base_cpv * niche_multiplier, 4);
END;
$$;

-- Trigger to auto-calculate CPV when profile updates
CREATE OR REPLACE FUNCTION public.update_cpv_on_profile_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.cpv_rate := calculate_cpv_rate(
    COALESCE(NEW.follower_count, 0),
    COALESCE(NEW.engagement_rate, 0),
    NEW.niche
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profile_cpv
BEFORE INSERT OR UPDATE OF follower_count, engagement_rate, niche
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_cpv_on_profile_change();

-- Auto-create wallet on profile creation
CREATE OR REPLACE FUNCTION public.auto_create_wallet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.creator_wallets (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_wallet_on_profile
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_wallet();
