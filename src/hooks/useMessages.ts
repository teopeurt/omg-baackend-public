import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Thread {
  id: string;
  name: string | null;
  is_group: boolean;
  last_message: Message | null;
  unread_count: number;
  participants: Participant[];
  created_at: string;
}

interface Message {
  id: number;
  thread_id: string;
  user_id: string;
  content: string;
  status: 'sent' | 'delivered' | 'read';
  is_starred: boolean;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

interface Participant {
  user_id: string;
  role: string;
  last_read_at: string | null;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

export function useMessages() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchThreads = async () => {
      try {
        // Fetch threads with participants and last message
        const { data: threadData, error: threadError } = await supabase
          .from('message_threads')
          .select(`
            *,
            thread_participants!inner (
              user_id,
              role,
              last_read_at,
              profiles (
                username,
                avatar_url
              )
            ),
            messages (
              id,
              content,
              status,
              created_at,
              user_id,
              profiles (
                username,
                avatar_url
              )
            )
          `)
          .eq('thread_participants.user_id', user.id)
          .order('updated_at', { ascending: false });

        if (threadError) throw threadError;

        // Process threads with last message and unread count
        const processedThreads = threadData.map(thread => {
          const messages = thread.messages || [];
          const lastMessage = messages.length > 0 
            ? messages.sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              )[0]
            : null;

          const userParticipant = thread.thread_participants.find(
            p => p.user_id === user.id
          );

          const unreadCount = messages.filter(msg => 
            msg.user_id !== user.id &&
            msg.status !== 'read' &&
            new Date(msg.created_at) > new Date(userParticipant?.last_read_at || 0)
          ).length;

          return {
            ...thread,
            last_message: lastMessage,
            unread_count: unreadCount,
            participants: thread.thread_participants,
          };
        });

        setThreads(processedThreads);
      } catch (err) {
        console.error('Error fetching threads:', err);
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();

    // Set up real-time subscriptions
    const messageSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data: newMessage, error } = await supabase
              .from('messages')
              .select('*, profiles(username, avatar_url)')
              .eq('id', payload.new.id)
              .single();

            if (!error && newMessage) {
              setThreads(prev => prev.map(thread => {
                if (thread.id === newMessage.thread_id) {
                  return {
                    ...thread,
                    last_message: newMessage,
                    unread_count: newMessage.user_id !== user.id 
                      ? thread.unread_count + 1 
                      : thread.unread_count,
                  };
                }
                return thread;
              }));
            }
          }
        }
      )
      .subscribe();

    return () => {
      messageSubscription.unsubscribe();
    };
  }, [user?.id]);

  const sendMessage = async (threadId: string, content: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('messages').insert({
        thread_id: threadId,
        user_id: user.id,
        content,
        status: 'sent',
      });

      if (error) throw error;

      // Update thread's updated_at timestamp
      await supabase
        .from('message_threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', threadId);

    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Error sending message');
      throw err;
    }
  };

  const markThreadAsRead = async (threadId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('thread_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('thread_id', threadId)
        .eq('user_id', user.id);

      if (error) throw error;

      setThreads(prev => prev.map(thread => 
        thread.id === threadId ? { ...thread, unread_count: 0 } : thread
      ));
    } catch (err) {
      console.error('Error marking thread as read:', err);
    }
  };

  const toggleMessageStar = async (messageId: number, isStarred: boolean) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_starred: !isStarred })
        .eq('id', messageId);

      if (error) throw error;
    } catch (err) {
      console.error('Error toggling message star:', err);
      toast.error('Error updating message');
      throw err;
    }
  };

  return {
    threads,
    loading,
    error,
    sendMessage,
    markThreadAsRead,
    toggleMessageStar,
  };
}