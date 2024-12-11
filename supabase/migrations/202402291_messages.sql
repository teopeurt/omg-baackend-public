-- Modify messages table
ALTER TABLE public.messages
ADD COLUMN is_starred boolean DEFAULT false;

-- Seed data for testing
INSERT INTO public.message_threads (id, name, is_group)
VALUES 
    ('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Event Planning', false),
    ('d290f1ee-6c54-4b01-90e6-d701748f0852', 'Tech Meetup', true);

-- Add some test messages (update user_ids as needed)
INSERT INTO public.messages (thread_id, user_id, content, status)
SELECT
    thread_id,
    user_id,
    'Hey! Looking forward to the event!',
    'delivered'
FROM public.thread_participants
WHERE thread_id = 'd290f1ee-6c54-4b01-90e6-d701748f0851'
LIMIT 1;