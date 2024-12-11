-- Add new columns to events table
ALTER TABLE public.events
ADD COLUMN description text,
ADD COLUMN highlights text[],
ADD COLUMN venue_images text[],
ADD COLUMN organizer_id uuid REFERENCES public.profiles(id),
ADD COLUMN sales_deadline timestamp with time zone,
ADD COLUMN available_tickets integer;

-- Create reviews table
CREATE TABLE public.reviews (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    event_id bigint REFERENCES public.events(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating numeric NOT NULL CHECK (rating >= 0 AND rating <= 5),
    venue_rating numeric NOT NULL CHECK (venue_rating >= 0 AND venue_rating <= 5),
    organizer_rating numeric NOT NULL CHECK (organizer_rating >= 0 AND organizer_rating <= 5),
    comment text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Update existing events with new data
-- UPDATE public.events
-- SET 
--     description = CASE 
--         WHEN title = 'Camelot' THEN 'Experience the magic of Camelot in this stunning new production of Lerner & Loewe''s classic musical.'
--         WHEN title = 'Hamilton' THEN 'The story of America then, told by America now. A revolutionary moment in theatre.'
--         WHEN title = 'Comedy Night' THEN 'Join us for an evening of laughter with top comedians from around the country.'
--     END,
--     highlights = CASE 
--         WHEN title = 'Camelot' THEN ARRAY['Award-winning cast', 'Stunning set design', 'Live orchestra']
--         WHEN title = 'Hamilton' THEN ARRAY['Original Broadway cast', 'Grammy-winning music', 'Revolutionary choreography']
--         WHEN title = 'Comedy Night' THEN ARRAY['Multiple performers', 'Interactive segments', 'Drink specials']
--     END,
--     venue_images = CASE 
--         WHEN title = 'Camelot' THEN ARRAY['https://images.unsplash.com/photo-1514306191717-452ec28c7814', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7']
--         WHEN title = 'Hamilton' THEN ARRAY['https://images.unsplash.com/photo-1583200786218-ccb420258601', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1']
--         WHEN title = 'Comedy Night' THEN ARRAY['https://images.unsplash.com/photo-1507676184212-d03ab07a01bf', 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca']
--     END,
--     sales_deadline = CASE 
--         WHEN title = 'Camelot' THEN '2024-04-27 23:59:59+00'
--         WHEN title = 'Hamilton' THEN '2024-04-22 23:59:59+00'
--         WHEN title = 'Comedy Night' THEN '2024-04-11 23:59:59+00'
--     END,
--     available_tickets = CASE 
--         WHEN title = 'Camelot' THEN 150
--         WHEN title = 'Hamilton' THEN 75
--         WHEN title = 'Comedy Night' THEN 200
--     END;