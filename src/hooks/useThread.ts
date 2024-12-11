import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Thread {
  id: string;
  name: string;
  is_group: boolean;
  created_at: string;
  updated_at: string;
  participants: {
    user_id: string;
    role: string;
    profiles: {
      username: string;
      avatar_url: string;
    };
  }[];
}

interface Message {
  id: number;
  thread_id: string;
  user_id: string;
  content: string;
  media_urls: string[];
  status: 'sent' | 'delivered' | 'read';
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

export function useThread(threadId: string) {
  const { user } = useAuth();
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user || !threadId) return;

    const fetchThread = async () => {
      try {
        console.log('Fetching thread:', threadId);
        const { data: threadData, error: threadError } = await supabase
          .from('message_threads')
          .select(`
            id,
            name,
            is_group,
            created_at,
            updated_at,
            thread_participants!inner (
              user_id,
              role,
              profiles (
                username,
                avatar_url
              )
            )
          `)
          .eq('id', threadId)
          .single();

        if (threadError) throw threadError;
        console.log('Thread data received:', threadData);

        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select(`
            id,
            thread_id,
            user_id,
            content,
            media_urls,
            status,
            created_at,
            profiles (
              username,
              avatar_url
            )
          `)
          .eq('thread_id', threadId)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;
        console.log('Messages data received:', messagesData);

        setThread(threadData);
        setMessages(messagesData || []);

        // Mark messages as read
        await supabase
          .from('thread_participants')
          .update({ last_read_at: new Date().toISOString() })
          .eq('thread_id', threadId)
          .eq('user_id', user.id);

      } catch (err) {
        console.error('Error in fetchThread:', err);
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchThread();

    // Set up real-time subscription for messages
    console.log('Setting up real-time subscription for thread:', threadId);
    const subscription = supabase
      .channel(`thread:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`,
        },
        async (payload) => {
          console.log('Received real-time message update:', payload);
          if (payload.eventType === 'INSERT') {
            const { data: newMessage, error } = await supabase
              .from('messages')
              .select('*, profiles(username, avatar_url)')
              .eq('id', payload.new.id)
              .single();

            if (!error && newMessage) {
              setMessages((prev) => [...prev, newMessage]);
              
              // Mark message as delivered if recipient
              if (newMessage.user_id !== user.id) {
                await supabase
                  .from('messages')
                  .update({ status: 'delivered' })
                  .eq('id', newMessage.id);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up subscription for thread:', threadId);
      subscription.unsubscribe();
    };
  }, [threadId, user?.id]);

  const sendMessage = async (content: string, mediaUrls: string[] = []) => {
    if (!user || !threadId) return;

    try {
      console.log('Sending message:', { content, mediaUrls });
      const { error } = await supabase.from('messages').insert({
        thread_id: threadId,
        user_id: user.id,
        content,
        media_urls: mediaUrls,
        status: 'sent',
      });

      if (error) throw error;
      console.log('Message sent successfully');
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Error sending message');
      throw err;
    }
  };

  const updateMessageStatus = async (messageId: number, status: Message['status']) => {
    try {
      console.log('Updating message status:', { messageId, status });
      const { error } = await supabase
        .from('messages')
        .update({ status })
        .eq('id', messageId);

      if (error) throw error;
      console.log('Message status updated successfully');
    } catch (err) {
      console.error('Error updating message status:', err);
    }
  };

  return {
    thread,
    messages,
    loading,
    error,
    sendMessage,
    updateMessageStatus,
  };
}