import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface NearbyUser {
  id: string;
  username: string;
  avatar_url: string | null;
  distance: number;
  latitude: number;
  longitude: number;
  last_seen: string;
}

// Default NYC coordinates if user location is not available
const DEFAULT_LATITUDE = 40.692532;
const DEFAULT_LONGITUDE = -73.944158;

export function useNearbyUsers(radius: number = 5) {
  const [users, setUsers] = useState<NearbyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchNearbyUsers = async () => {
      if (!user) return;

      try {
        // First ensure current user has coordinates
        const { data: currentUser, error: userError } = await supabase
          .from('profiles')
          .select('latitude, longitude')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;

        // If user doesn't have coordinates, set default ones
        if (!currentUser?.latitude || !currentUser?.longitude) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              latitude: DEFAULT_LATITUDE,
              longitude: DEFAULT_LONGITUDE,
              last_seen: new Date().toISOString()
            })
            .eq('id', user.id);

          if (updateError) throw updateError;
        }

        // Fetch nearby users using either user's coordinates or defaults
        const { data, error } = await supabase
          .rpc('get_nearby_users', {
            user_lat: currentUser?.latitude || DEFAULT_LATITUDE,
            user_lng: currentUser?.longitude || DEFAULT_LONGITUDE,
            radius_km: radius
          });

        if (error) throw error;

        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching nearby users:', error);
        // If there's an error, try to fetch with default coordinates
        try {
          const { data } = await supabase
            .rpc('get_nearby_users', {
              user_lat: DEFAULT_LATITUDE,
              user_lng: DEFAULT_LONGITUDE,
              radius_km: radius
            });
          setUsers(data || []);
        } catch (fallbackError) {
          console.error('Error fetching with default coordinates:', fallbackError);
          setUsers([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyUsers();
    
    // Set up real-time subscription for updates
    const subscription = supabase
      .channel('nearby-users')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, () => {
        fetchNearbyUsers();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, radius]);

  return { users, loading };
}
