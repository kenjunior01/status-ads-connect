
-- Recreate all missing triggers for the auth pipeline

-- 1. Trigger: when a new user signs up, create profile + assign role
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Trigger: when a profile is created/updated, auto-create wallet for creators
CREATE OR REPLACE TRIGGER on_profile_created_wallet
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_wallet();

-- 3. Trigger: when profile changes, recalculate CPV rate
CREATE OR REPLACE TRIGGER on_profile_update_cpv
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cpv_on_profile_change();

-- 4. Trigger: when profile changes, sync to creator_listings
CREATE OR REPLACE TRIGGER on_profile_sync_listing
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_creator_listing();

-- 5. Trigger: update conversation last_message_at on new message
CREATE OR REPLACE TRIGGER on_new_message_update_conversation
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_last_message();

-- 6. Backfill: create profiles for existing auth users that don't have one
INSERT INTO public.profiles (user_id, display_name)
SELECT au.id, au.raw_user_meta_data ->> 'display_name'
FROM auth.users au
LEFT JOIN public.profiles p ON p.user_id = au.id
WHERE p.id IS NULL
ON CONFLICT DO NOTHING;

-- 7. Backfill: create roles for existing users that don't have one
INSERT INTO public.user_roles (user_id, role)
SELECT au.id, COALESCE((au.raw_user_meta_data ->> 'role')::app_role, 'user'::app_role)
FROM auth.users au
LEFT JOIN public.user_roles ur ON ur.user_id = au.id
WHERE ur.id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 8. Backfill: create wallets for existing users that don't have one
INSERT INTO public.creator_wallets (user_id)
SELECT au.id
FROM auth.users au
LEFT JOIN public.creator_wallets cw ON cw.user_id = au.id
WHERE cw.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- 9. Clean up orphan creator_listings without real profiles
DELETE FROM public.creator_listings WHERE profile_id IS NULL;
