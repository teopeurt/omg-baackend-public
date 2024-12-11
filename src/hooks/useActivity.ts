import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Activity {
  id: number;
  user_id: string;
  type: 'post' | 'event_rsvp' | 'review' | 'follow' | 'like' | 'comment';
  data: Record<string, any>;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

export function useActivity() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchActivities = async () => {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select(`
            *,
            profiles (username, avatar_url)
          `)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setActivities(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    // Set up real-time subscription
    const subscription = supabase
      .channel('activities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities',
        },
        async (payload) => {
          const { data: newActivity, error } = await supabase
            .from('activities')
            .select('*, profiles(username, avatar_url)')
            .eq('id', payload.new.id)
            .single();

          if (!error && newActivity) {
            setActivities((prev) => [newActivity, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  const getActivityContent = (activity: Activity) => {
    const username = activity.profiles.username;

    switch (activity.type) {
      case 'post':
        return `${username} shared a post`;
      case 'event_rsvp':
        return `${username} is attending an event`;
      case 'review':
        return `${username} wrote a review`;
      case 'follow':
        return `${username} started following ${activity.data.target_username}`;
      case 'like':
        return `${username} liked a post`;
      case 'comment':
        return `${username} commented on a post`;
      default:
        return '';
    }
  };

  return {
    activities,
    loading,
    error,
    getActivityContent,
  };
}