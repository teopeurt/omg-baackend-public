import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Post {
  id: number;
  user_id: string;
  content: string;
  media_urls: string[];
  visibility: 'public' | 'friends' | 'private';
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
  reactions: {
    type: string;
    count: number;
    user_reacted: boolean;
  }[];
  comments_count: number;
  shares_count: number;
}

export function useSocial() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            profiles (username, avatar_url),
            reactions (type),
            comments (count),
            shares (count)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Process and format the data
        const formattedPosts = data.map((post) => ({
          ...post,
          reactions: processReactions(post.reactions),
          comments_count: post.comments?.[0]?.count || 0,
          shares_count: post.shares?.[0]?.count || 0,
        }));

        setPosts(formattedPosts);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();

    // Set up real-time subscription
    const subscription = supabase
      .channel('posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data: newPost, error } = await supabase
              .from('posts')
              .select(`
                *,
                profiles (username, avatar_url),
                reactions (type),
                comments (count),
                shares (count)
              `)
              .eq('id', payload.new.id)
              .single();

            if (!error && newPost) {
              setPosts((prev) => [
                {
                  ...newPost,
                  reactions: processReactions(newPost.reactions),
                  comments_count: newPost.comments?.[0]?.count || 0,
                  shares_count: newPost.shares?.[0]?.count || 0,
                },
                ...prev,
              ]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  const createPost = async (content: string, mediaUrls: string[] = [], visibility: Post['visibility'] = 'public') => {
    if (!user) return;

    try {
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content,
        media_urls: mediaUrls,
        visibility,
      });

      if (error) throw error;
      toast.success('Post created successfully');
    } catch (err) {
      toast.error('Error creating post');
      throw err;
    }
  };

  const reactToPost = async (postId: number, type: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('reactions').upsert(
        {
          user_id: user.id,
          post_id: postId,
          type,
        },
        { onConflict: 'user_id, post_id' }
      );

      if (error) throw error;
    } catch (err) {
      toast.error('Error reacting to post');
      throw err;
    }
  };

  const sharePost = async (postId: number, content?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('shares').insert({
        user_id: user.id,
        post_id: postId,
        content,
      });

      if (error) throw error;
      toast.success('Post shared successfully');
    } catch (err) {
      toast.error('Error sharing post');
      throw err;
    }
  };

  return {
    posts,
    loading,
    error,
    createPost,
    reactToPost,
    sharePost,
  };
}

function processReactions(reactions: any[]) {
  const reactionTypes = ['like', 'love', 'laugh', 'wow', 'sad', 'angry'];
  return reactionTypes.map((type) => ({
    type,
    count: reactions.filter((r) => r.type === type).length,
    user_reacted: reactions.some((r) => r.type === type),
  }));
}