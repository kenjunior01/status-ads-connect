-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'creator', 'advertiser', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name text,
  bio text,
  avatar_url text,
  niche text,
  price_per_post numeric(10,2),
  price_range text,
  rating numeric(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  total_campaigns integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  badge_level text DEFAULT 'bronze',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1 
      WHEN 'creator' THEN 2 
      WHEN 'advertiser' THEN 3 
      ELSE 4 
    END
  LIMIT 1
$$;

-- Create campaigns table
CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  creator_id uuid NOT NULL,
  advertiser_id uuid NOT NULL,
  price numeric(10,2) NOT NULL,
  status text DEFAULT 'pending',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Campaigns policies
CREATE POLICY "Users can view own campaigns" ON public.campaigns
  FOR SELECT TO authenticated
  USING (creator_id = auth.uid() OR advertiser_id = auth.uid());

CREATE POLICY "Advertisers can create campaigns" ON public.campaigns
  FOR INSERT TO authenticated WITH CHECK (advertiser_id = auth.uid());

CREATE POLICY "Participants can update campaigns" ON public.campaigns
  FOR UPDATE TO authenticated
  USING (creator_id = auth.uid() OR advertiser_id = auth.uid());

-- Create reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  advertiser_id uuid NOT NULL,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Advertisers can create reviews" ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (advertiser_id = auth.uid());

-- Create creator_listings table (public marketplace)
CREATE TABLE public.creator_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  niche text,
  price_range text,
  rating numeric(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  total_campaigns integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  badge_level text DEFAULT 'bronze',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(profile_id)
);

-- Enable RLS on creator_listings
ALTER TABLE public.creator_listings ENABLE ROW LEVEL SECURITY;

-- Creator listings policies (public read)
CREATE POLICY "Anyone can view creator listings" ON public.creator_listings
  FOR SELECT USING (true);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to sync creator_listings from profiles
CREATE OR REPLACE FUNCTION sync_creator_listing()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-sync when profiles change
CREATE TRIGGER sync_creator_listing_trigger
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION sync_creator_listing();

-- Insert seed creator listings (demo data)
INSERT INTO public.creator_listings (display_name, niche, price_range, rating, total_reviews, total_campaigns, is_verified, badge_level) VALUES
  ('Maria Santos', 'Lifestyle & Moda', 'R$ 50-150', 4.9, 127, 89, true, 'gold'),
  ('João Silva', 'Tecnologia', 'R$ 100-300', 4.8, 98, 67, true, 'gold'),
  ('Ana Oliveira', 'Beleza & Skincare', 'R$ 30-80', 4.7, 156, 112, true, 'silver'),
  ('Pedro Costa', 'Fitness & Saúde', 'R$ 80-200', 4.6, 84, 54, true, 'silver'),
  ('Carla Mendes', 'Gastronomia', 'R$ 40-100', 4.8, 203, 145, true, 'gold'),
  ('Lucas Ferreira', 'Games & Entretenimento', 'R$ 60-150', 4.5, 67, 43, true, 'silver'),
  ('Julia Ribeiro', 'Viagens', 'R$ 100-250', 4.9, 189, 134, true, 'gold'),
  ('Rafael Almeida', 'Finanças', 'R$ 150-400', 4.7, 76, 52, true, 'silver'),
  ('Fernanda Lima', 'Maternidade', 'R$ 50-120', 4.6, 112, 78, true, 'silver'),
  ('Bruno Martins', 'Esportes', 'R$ 70-180', 4.4, 54, 38, false, 'bronze'),
  ('Camila Souza', 'Educação', 'R$ 40-90', 4.8, 145, 98, true, 'gold'),
  ('Diego Nascimento', 'Música', 'R$ 60-140', 4.3, 43, 29, false, 'bronze'),
  ('Isabela Santos', 'Arte & Design', 'R$ 80-200', 4.7, 87, 61, true, 'silver'),
  ('Thiago Rocha', 'Automóveis', 'R$ 100-280', 4.5, 62, 44, true, 'silver'),
  ('Larissa Costa', 'Pets', 'R$ 30-70', 4.9, 234, 167, true, 'gold');