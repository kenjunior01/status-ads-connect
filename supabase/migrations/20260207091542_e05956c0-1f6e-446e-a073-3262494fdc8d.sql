
CREATE OR REPLACE FUNCTION public.sync_creator_listing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.display_name IS NOT NULL THEN
    INSERT INTO public.creator_listings (profile_id, display_name, niche, price_range, rating, total_reviews, total_campaigns, is_verified, badge_level)
    VALUES (NEW.id, NEW.display_name, NEW.niche, NEW.price_range, NEW.rating, NEW.total_reviews, NEW.total_campaigns, NEW.is_verified, NEW.badge_level)
    ON CONFLICT (profile_id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      niche = EXCLUDED.niche,
      price_range = EXCLUDED.price_range,
      rating = EXCLUDED.rating,
      total_reviews = EXCLUDED.total_reviews,
      total_campaigns = EXCLUDED.total_campaigns,
      is_verified = EXCLUDED.is_verified,
      badge_level = EXCLUDED.badge_level,
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$function$;
