-- Seed data for Supabase

-- 1. Grooming Services
INSERT INTO public.grooming_services (id, name, description, duration_minutes, base_price, is_active)
VALUES
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Basic Bath & Brush', 'Includes bath, blow dry, brush out, ear cleaning, and nail trim.', 60, 45.00, true),
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Full Grooming', 'Includes Basic Bath & Brush plus full body haircut.', 90, 75.00, true),
    ('70eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'Puppy Package', 'Gentle introduction to grooming for puppies under 5 months.', 45, 30.00, true)
ON CONFLICT (id) DO NOTHING;

-- 2. Products
INSERT INTO public.products (id, name, description, price, stock_quantity, is_active)
VALUES
    ('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'Premium Dog Food', 'High-quality grain-free dog food, 5lb bag.', 24.99, 50, true),
    ('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'Squeaky Toy', 'Durable rubber squeaky toy for dogs.', 9.99, 100, true),
    ('30eebc99-9c0b-4ef8-bb6d-6bb9bd380a00', 'Cat Nip', 'Organic cat nip, 1oz.', 5.99, 200, true)
ON CONFLICT (id) DO NOTHING;
