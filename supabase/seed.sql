-- Seed data for destinations
INSERT INTO public.destinations (name, rating, image)
VALUES 
  ('Switzerland', 4.8, 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80'),
  ('Australia', 4.6, 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80'),
  ('Ireland', 4.5, 'https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?auto=format&fit=crop&q=80');

-- Seed data for events
INSERT INTO public.events (title, venue, date, image, category, price_amount, price_currency, is_featured, rating)
VALUES 
  ('Camelot', 'Vivian Beaumont Theatre', '2024-04-28', 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&q=80', 'Theatre', 45.00, 'USD', true, 4.5),
  ('Hamilton', 'Richard Rodgers Theatre', '2024-04-23', 'https://images.unsplash.com/photo-1583200786218-ccb420258601?auto=format&fit=crop&q=80', 'Musical', 89.00, 'USD', true, 5.0),
  ('Comedy Night', 'Gershwin Theatre', '2024-04-12', 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&q=80', 'Comedy', 25.00, 'USD', false, 4.2);


  -- Update existing events with new data
UPDATE public.events
SET 
    description = CASE 
        WHEN title = 'Camelot' THEN 'Experience the magic of Camelot in this stunning new production of Lerner & Loewe''s classic musical.'
        WHEN title = 'Hamilton' THEN 'The story of America then, told by America now. A revolutionary moment in theatre.'
        WHEN title = 'Comedy Night' THEN 'Join us for an evening of laughter with top comedians from around the country.'
    END,
    highlights = CASE 
        WHEN title = 'Camelot' THEN ARRAY['Award-winning cast', 'Stunning set design', 'Live orchestra']
        WHEN title = 'Hamilton' THEN ARRAY['Original Broadway cast', 'Grammy-winning music', 'Revolutionary choreography']
        WHEN title = 'Comedy Night' THEN ARRAY['Multiple performers', 'Interactive segments', 'Drink specials']
    END,
    venue_images = CASE 
        WHEN title = 'Camelot' THEN ARRAY['https://images.unsplash.com/photo-1514306191717-452ec28c7814', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7']
        WHEN title = 'Hamilton' THEN ARRAY['https://images.unsplash.com/photo-1583200786218-ccb420258601', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1']
        WHEN title = 'Comedy Night' THEN ARRAY['https://images.unsplash.com/photo-1507676184212-d03ab07a01bf', 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca']
    END,
    sales_deadline = CASE 
        WHEN title = 'Camelot' THEN '2024-04-27 23:59:59+00'::timestamp with time zone
        WHEN title = 'Hamilton' THEN '2024-04-22 23:59:59+00'::timestamp with time zone
        WHEN title = 'Comedy Night' THEN '2024-04-11 23:59:59+00'::timestamp with time zone
    END,
    available_tickets = CASE 
        WHEN title = 'Camelot' THEN 150
        WHEN title = 'Hamilton' THEN 75
        WHEN title = 'Comedy Night' THEN 200
    END;