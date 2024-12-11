-- Add coordinates columns to events table
ALTER TABLE public.events
ADD COLUMN latitude numeric NOT NULL DEFAULT 40.68,
ADD COLUMN longitude numeric NOT NULL DEFAULT -73.94;

-- Update existing events with coordinates
UPDATE public.events
SET 
  latitude = CASE 
    WHEN title = 'Camelot' THEN 40.6825
    WHEN title = 'Hamilton' THEN 40.6784
    WHEN title = 'Comedy Night' THEN 40.6752
  END,
  longitude = CASE 
    WHEN title = 'Camelot' THEN -73.9412
    WHEN title = 'Hamilton' THEN -73.9878
    WHEN title = 'Comedy Night' THEN -73.9846
  END;