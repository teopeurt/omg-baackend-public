-- Create payment_methods table first
CREATE TABLE public.payment_methods (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    type text DEFAULT 'card',
    last4 text NOT NULL,
    exp_month text NOT NULL,
    exp_year text NOT NULL,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Then create subscriptions table
CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_name text NOT NULL,
    status text CHECK (status IN ('active', 'canceled', 'past_due')) DEFAULT 'active',
    current_period_start timestamp with time zone NOT NULL,
    current_period_end timestamp with time zone NOT NULL,
    cancel_at_period_end boolean DEFAULT false,
    payment_method_id uuid REFERENCES public.payment_methods(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id)
);

CREATE TABLE public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount numeric NOT NULL,
    currency text DEFAULT 'USD',
    status text CHECK (status IN ('completed', 'pending', 'failed')) DEFAULT 'pending',
    description text,
    payment_method_id uuid REFERENCES public.payment_methods(id),
    date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata jsonb
);

-- Add RLS policies
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Payment methods policies
CREATE POLICY "Users can view their own payment methods" ON public.payment_methods
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods" ON public.payment_methods
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods" ON public.payment_methods
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods" ON public.payment_methods
    FOR DELETE USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date DESC);

-- Function to handle subscription updates
CREATE OR REPLACE FUNCTION public.handle_subscription_update()
RETURNS trigger AS $$
BEGIN
    -- Create a transaction record for subscription changes
    INSERT INTO public.transactions (
        user_id,
        amount,
        description,
        status,
        metadata
    )
    VALUES (
        NEW.user_id,
        CASE
            WHEN NEW.plan_name = 'Basic' THEN 9.99
            WHEN NEW.plan_name = 'Pro' THEN 29.99
            WHEN NEW.plan_name = 'Enterprise' THEN 99.99
            ELSE 0
        END,
        'Subscription to ' || NEW.plan_name || ' plan',
        'completed',
        jsonb_build_object(
            'plan_name', NEW.plan_name,
            'subscription_id', NEW.id
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_subscription_update
    AFTER INSERT OR UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_subscription_update();

-- Seed some test data
INSERT INTO public.subscriptions (
    user_id,
    plan_name,
    current_period_start,
    current_period_end,
    payment_method_id
)
SELECT
    profiles.id as user_id,
    'Basic',
    NOW(),
    NOW() + INTERVAL '1 month',
    payment_methods.id
FROM public.profiles
JOIN public.payment_methods ON payment_methods.user_id = profiles.id
LIMIT 1;

-- Add some test payment methods
INSERT INTO public.payment_methods (
    user_id,
    last4,
    exp_month,
    exp_year,
    is_default
)
SELECT
    id as user_id,
    '4242',
    '12',
    '2025',
    true
FROM public.profiles
LIMIT 1;

-- Add some test transactions
INSERT INTO public.transactions (
    user_id,
    amount,
    description,
    status,
    date
)
SELECT
    id as user_id,
    9.99,
    'Monthly subscription payment',
    'completed',
    NOW() - (n || ' days')::INTERVAL
FROM public.profiles
CROSS JOIN generate_series(0, 5) n
LIMIT 6;