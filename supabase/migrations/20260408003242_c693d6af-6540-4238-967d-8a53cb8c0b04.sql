
-- Recreate all critical triggers that are missing

-- 1. Trigger: on new auth user → create profile + role
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Trigger: on profile created → auto-create wallet
CREATE OR REPLACE TRIGGER on_profile_created_wallet
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_wallet();

-- 3. Trigger: on profile update → recalculate CPV
CREATE OR REPLACE TRIGGER on_profile_update_cpv
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cpv_on_profile_change();

-- 4. Trigger: on profile insert/update → sync creator listing
CREATE OR REPLACE TRIGGER on_profile_sync_listing
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_creator_listing();

-- 5. Trigger: on message → update conversation last_message_at
CREATE OR REPLACE TRIGGER on_message_update_conversation
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_last_message();

-- Backfill: create wallets for users who don't have one
INSERT INTO public.creator_wallets (user_id)
SELECT p.user_id FROM public.profiles p
LEFT JOIN public.creator_wallets w ON w.user_id = p.user_id
WHERE w.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Clean orphan listings with no profile
DELETE FROM public.creator_listings WHERE profile_id IS NULL;
