-- Add coordinates to profiles if not exists
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision,
ADD COLUMN IF NOT EXISTS last_seen timestamp with time zone DEFAULT CURRENT_TIMESTAMP;

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 double precision,
  lon1 double precision,
  lat2 double precision,
  lon2 double precision
)
RETURNS double precision AS $$
DECLARE
  R integer = 6371; -- Earth's radius in kilometers
  dlat double precision;
  dlon double precision;
  a double precision;
  c double precision;
BEGIN
  dlat = radians(lat2 - lat1);
  dlon = radians(lon2 - lon1);
  a = sin(dlat/2) * sin(dlat/2) +
      cos(radians(lat1)) * cos(radians(lat2)) *
      sin(dlon/2) * sin(dlon/2);
  c = 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN R * c;
END;
$$ LANGUAGE plpgsql;

-- Function to get nearby users
CREATE OR REPLACE FUNCTION get_nearby_users(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision
)
RETURNS TABLE (
  id uuid,
  username text,
  avatar_url text,
  distance double precision,
  latitude double precision,
  longitude double precision,
  last_seen timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.avatar_url,
    calculate_distance(user_lat, user_lng, p.latitude, p.longitude) as distance,
    p.latitude,
    p.longitude,
    p.last_seen
  FROM profiles p
  WHERE p.latitude IS NOT NULL
    AND p.longitude IS NOT NULL
    AND calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= radius_km
    AND p.id != auth.uid()
  ORDER BY distance;
END;
$$ LANGUAGE plpgsql;

-- Update existing profiles with random coordinates in NYC area
UPDATE profiles
SET
  latitude = 40.692532 + (random() * 0.02 - 0.01),
  longitude = -73.944158 + (random() * 0.02 - 0.01),
  last_seen = CURRENT_TIMESTAMP - (random() * interval '1 hour'),
  username = CASE 
    WHEN random() < 0.2 THEN 'alex_nyc'
    WHEN random() < 0.4 THEN 'sarah_brooklyn'
    WHEN random() < 0.6 THEN 'mike_queens'
    WHEN random() < 0.8 THEN 'emma_downtown'
    ELSE 'james_heights'
  END,
  avatar_url = 'https://i.pravatar.cc/150?u=' || floor(random() * 100)::text
WHERE latitude IS NULL OR longitude IS NULL;

-- Create an index to improve performance of distance calculations
CREATE INDEX IF NOT EXISTS idx_profiles_coordinates 
ON profiles (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
