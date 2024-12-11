import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Event = Database['public']['Tables']['events']['Row'];
type Review = Database['public']['Tables']['reviews']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'];
};

interface EventDetails extends Event {
  reviews: Review[];
  average_ratings: {
    overall: number;
    venue: number;
    organizer: number;
  };
}

export function useEvent(eventId: number) {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (eventError) throw eventError;

        // Fetch reviews with user profiles
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            *,
            profiles (*)
          `)
          .eq('event_id', eventId)
          .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;

        // Calculate average ratings
        const averageRatings = reviewsData.reduce(
          (acc, review) => {
            acc.overall += review.rating;
            acc.venue += review.venue_rating;
            acc.organizer += review.organizer_rating;
            return acc;
          },
          { overall: 0, venue: 0, organizer: 0 }
        );

        const reviewCount = reviewsData.length;
        const normalizedRatings = {
          overall: reviewCount ? averageRatings.overall / reviewCount : 0,
          venue: reviewCount ? averageRatings.venue / reviewCount : 0,
          organizer: reviewCount ? averageRatings.organizer / reviewCount : 0,
        };

        setEvent({
          ...eventData,
          reviews: reviewsData,
          average_ratings: normalizedRatings,
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const addReview = async (reviewData: Omit<Review, 'id' | 'created_at' | 'profiles'>) => {
    try {
      const { error } = await supabase.from('reviews').insert(reviewData);
      if (error) throw error;
      
      // Refetch event data to update reviews
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);
    } catch (err) {
      throw err instanceof Error ? err : new Error('An error occurred');
    }
  };

  return { event, loading, error, addReview };
}