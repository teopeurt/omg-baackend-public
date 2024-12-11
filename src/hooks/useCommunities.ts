import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Community {
  id: number;
  name: string;
  description: string;
  image_url: string;
  location: string;
  latitude: number;
  longitude: number;
  member_count: number;
  activity_rate: number;
  created_at: string;
  is_member?: boolean;
}

export function useCommunities() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        // Fetch communities with member status for current user
        const { data, error } = await supabase
          .from('communities')
          .select(`
            *,
            community_members!inner (
              user_id
            )
          `)
          .order('member_count', { ascending: false });

        if (error) throw error;

        // Add is_member flag
        const communitiesWithMembership = data.map(community => ({
          ...community,
          is_member: community.community_members.some(
            (member: any) => member.user_id === user?.id
          ),
        }));

        setCommunities(communitiesWithMembership);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();

    // Set up real-time subscription
    const subscription = supabase
      .channel('communities')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'communities',
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setCommunities(prev =>
              prev.map(community =>
                community.id === payload.new.id
                  ? { ...community, ...payload.new }
                  : community
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  const joinCommunity = async (communityId: number) => {
    if (!user) {
      toast.error('Please sign in to join communities');
      return;
    }

    try {
      const { error } = await supabase
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: user.id,
        });

      if (error) throw error;

      // Update local state
      setCommunities(prev =>
        prev.map(community =>
          community.id === communityId
            ? {
                ...community,
                member_count: community.member_count + 1,
                is_member: true,
              }
            : community
        )
      );

      toast.success('Successfully joined community');
    } catch (err) {
      toast.error('Error joining community');
      throw err;
    }
  };

  const leaveCommunity = async (communityId: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setCommunities(prev =>
        prev.map(community =>
          community.id === communityId
            ? {
                ...community,
                member_count: community.member_count - 1,
                is_member: false,
              }
            : community
        )
      );

      toast.success('Successfully left community');
    } catch (err) {
      toast.error('Error leaving community');
      throw err;
    }
  };

  return {
    communities,
    loading,
    error,
    joinCommunity,
    leaveCommunity,
  };
}