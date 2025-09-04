-- FASE 1: Criar tabela creator_listings (que estava faltando)
CREATE TABLE IF NOT EXISTS public.creator_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  niche TEXT,
  price_range TEXT,
  rating NUMERIC DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  total_campaigns INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  badge_level TEXT DEFAULT 'bronze',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creator_listings ENABLE ROW LEVEL SECURITY;

-- Create policies for creator_listings
CREATE POLICY "Creator listings are viewable by everyone" 
ON public.creator_listings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own creator listing" 
ON public.creator_listings 
FOR UPDATE 
USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own creator listing" 
ON public.creator_listings 
FOR INSERT 
WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_creator_listings_updated_at
BEFORE UPDATE ON public.creator_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- FASE 2: Inserir dados de seed

-- Primeiro, criar alguns usuários fictícios e seus perfis
-- Usuário Admin (email: admin@statusads.com, senha: admin123)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'authenticated',
  'authenticated', 
  'admin@statusads.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"display_name":"Admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Inserir role de admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'admin');

-- Inserir perfil do admin
INSERT INTO public.profiles (
  id,
  user_id,
  display_name,
  bio,
  niche,
  avatar_url,
  rating,
  total_reviews,
  total_campaigns,
  is_verified,
  badge_level,
  price_per_post
) VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479', 
  'Admin',
  'Platform Administrator',
  'Administration',
  null,
  5.0,
  0,
  0,
  true,
  'diamond',
  null
);

-- Criadores de demonstração
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES 
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'authenticated', 'authenticated', 'sofia.martinez@email.com', crypt('demo123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Sofia Martinez"}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440002', 'authenticated', 'authenticated', 'lucas.silva@email.com', crypt('demo123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Lucas Silva"}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440003', 'authenticated', 'authenticated', 'marina.costa@email.com', crypt('demo123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Marina Costa"}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440004', 'authenticated', 'authenticated', 'rafael.santos@email.com', crypt('demo123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Rafael Santos"}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440005', 'authenticated', 'authenticated', 'ana.oliveira@email.com', crypt('demo123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Ana Oliveira"}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440006', 'authenticated', 'authenticated', 'pedro.almeida@email.com', crypt('demo123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Pedro Almeida"}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440007', 'authenticated', 'authenticated', 'julia.ferreira@email.com', crypt('demo123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Julia Ferreira"}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440008', 'authenticated', 'authenticated', 'diego.ribeiro@email.com', crypt('demo123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Diego Ribeiro"}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440009', 'authenticated', 'authenticated', 'camila.rocha@email.com', crypt('demo123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Camila Rocha"}', now(), now(), '', '', '', ''),
('00000000-0000-0000-0000-000000000000', '550e8400-e29b-41d4-a716-44665544000a', 'authenticated', 'authenticated', 'bruno.pereira@email.com', crypt('demo123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Bruno Pereira"}', now(), now(), '', '', '', '');

-- Inserir user_roles para criadores
INSERT INTO public.user_roles (user_id, role) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'creator'),
('550e8400-e29b-41d4-a716-446655440002', 'creator'),
('550e8400-e29b-41d4-a716-446655440003', 'creator'),
('550e8400-e29b-41d4-a716-446655440004', 'creator'),
('550e8400-e29b-41d4-a716-446655440005', 'creator'),
('550e8400-e29b-41d4-a716-446655440006', 'creator'),
('550e8400-e29b-41d4-a716-446655440007', 'creator'),
('550e8400-e29b-41d4-a716-446655440008', 'creator'),
('550e8400-e29b-41d4-a716-446655440009', 'creator'),
('550e8400-e29b-41d4-a716-44665544000a', 'creator');

-- Inserir perfis dos criadores
INSERT INTO public.profiles (
  id, user_id, display_name, bio, niche, rating, total_reviews, total_campaigns, is_verified, badge_level, price_per_post
) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Sofia Martinez', 'Influenciadora de lifestyle e moda com 150K seguidores. Especialista em conteúdo autêntico e engajamento orgânico.', 'Lifestyle', 4.9, 47, 23, true, 'gold', 450),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Lucas Silva', 'Tech reviewer com foco em gadgets e inovação. Audiência de 95K tech enthusiasts.', 'Tecnologia', 4.8, 32, 18, true, 'silver', 320),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Marina Costa', 'Fitness coach e nutricionista. Inspirando 200K pessoas a viverem mais saudavelmente.', 'Fitness', 4.9, 68, 34, true, 'gold', 580),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Rafael Santos', 'Gaming content creator. Streams e reviews dos últimos lançamentos para 85K gamers.', 'Gaming', 4.7, 28, 15, false, 'silver', 280),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'Ana Oliveira', 'Food blogger especializada em culinária brasileira. Compartilhando receitas com 120K foodies.', 'Culinária', 4.8, 41, 22, true, 'silver', 380),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', 'Pedro Almeida', 'Travel vlogger. Explorando destinos únicos e compartilhando experiências com 110K aventureiros.', 'Viagem', 4.6, 35, 19, false, 'bronze', 250),
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', 'Julia Ferreira', 'Beauty guru com expertise em skincare e makeup. Educando 180K sobre beleza natural.', 'Beleza', 4.9, 52, 28, true, 'gold', 520),
('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440008', 'Diego Ribeiro', 'Micro-influencer focado em sustentabilidade e vida consciente. Comunidade engajada de 45K.', 'Sustentabilidade', 4.8, 23, 12, false, 'bronze', 180),
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440009', 'Camila Rocha', 'Pet influencer com conteúdo sobre cuidados e treinamento. Conectando 90K pet lovers.', 'Pets', 4.7, 31, 16, false, 'silver', 300),
('550e8400-e29b-41d4-a716-44665544000a', '550e8400-e29b-41d4-a716-44665544000a', 'Bruno Pereira', 'Finance educator criando conteúdo sobre investimentos e educação financeira para 75K seguidores.', 'Finanças', 4.8, 26, 14, true, 'silver', 350);

-- Inserir creator_listings correspondentes
INSERT INTO public.creator_listings (
  profile_id, display_name, niche, price_range, rating, total_reviews, total_campaigns, is_verified, badge_level
) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Sofia Martinez', 'Lifestyle', 'Premium', 4.9, 47, 23, true, 'gold'),
('550e8400-e29b-41d4-a716-446655440002', 'Lucas Silva', 'Tecnologia', 'Premium', 4.8, 32, 18, true, 'silver'),
('550e8400-e29b-41d4-a716-446655440003', 'Marina Costa', 'Fitness', 'Premium', 4.9, 68, 34, true, 'gold'),
('550e8400-e29b-41d4-a716-446655440004', 'Rafael Santos', 'Gaming', 'Mid-range', 4.7, 28, 15, false, 'silver'),
('550e8400-e29b-41d4-a716-446655440005', 'Ana Oliveira', 'Culinária', 'Premium', 4.8, 41, 22, true, 'silver'),
('550e8400-e29b-41d4-a716-446655440006', 'Pedro Almeida', 'Viagem', 'Mid-range', 4.6, 35, 19, false, 'bronze'),
('550e8400-e29b-41d4-a716-446655440007', 'Julia Ferreira', 'Beleza', 'Premium', 4.9, 52, 28, true, 'gold'),
('550e8400-e29b-41d4-a716-446655440008', 'Diego Ribeiro', 'Sustentabilidade', 'Budget-friendly', 4.8, 23, 12, false, 'bronze'),
('550e8400-e29b-41d4-a716-446655440009', 'Camila Rocha', 'Pets', 'Mid-range', 4.7, 31, 16, false, 'silver'),
('550e8400-e29b-41d4-a716-44665544000a', 'Bruno Pereira', 'Finanças', 'Premium', 4.8, 26, 14, true, 'silver');

-- Inserir algumas campanhas de exemplo
INSERT INTO public.campaigns (
  id, title, description, advertiser_id, creator_id, price, status
) VALUES 
(gen_random_uuid(), 'Campanha Produto de Beleza Natural', 'Divulgação de nova linha de cosméticos orgânicos focada em pele sensível', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '550e8400-e29b-41d4-a716-446655440007', 1200.00, 'active'),
(gen_random_uuid(), 'Review Smartphone Latest Gen', 'Review completo do novo smartphone flagship incluindo vídeo unboxing', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '550e8400-e29b-41d4-a716-446655440002', 800.00, 'completed'),
(gen_random_uuid(), 'Programa Fitness 30 Dias', 'Divulgação de programa de exercícios online com acompanhamento nutricional', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '550e8400-e29b-41d4-a716-446655440003', 1500.00, 'active');

-- Inserir algumas reviews de exemplo
INSERT INTO public.reviews (
  advertiser_id, creator_id, campaign_id, rating, comment
) VALUES 
('f47ac10b-58cc-4372-a567-0e02b2c3d479', '550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM public.campaigns WHERE title = 'Review Smartphone Latest Gen'), 5, 'Excelente trabalho! Lucas entregou um review muito detalhado e profissional. O engajamento foi excepcional.'),
('f47ac10b-58cc-4372-a567-0e02b2c3d479', '550e8400-e29b-41d4-a716-446655440007', (SELECT id FROM public.campaigns WHERE title = 'Campanha Produto de Beleza Natural'), 5, 'Julia fez um trabalho incrível! O conteúdo ficou muito autêntico e gerou ótimas conversões.'),
('f47ac10b-58cc-4372-a567-0e02b2c3d479', '550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM public.campaigns WHERE title = 'Programa Fitness 30 Dias'), 5, 'Marina superou expectativas! Sua comunidade respondeu muito bem à campanha.');