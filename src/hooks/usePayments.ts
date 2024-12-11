import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface PaymentMethod {
  id: string;
  last4: string;
  expMonth: string;
  expYear: string;
  isDefault: boolean;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
}

interface Plan {
  name: string;
  price: number;
  paymentMethods: PaymentMethod[];
}

interface NewPaymentMethod {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  name: string;
  setAsDefault?: boolean;
}

export function usePayments() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchPaymentData = async () => {
      try {
        // Fetch transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (transactionsError) throw transactionsError;

        // Fetch current plan and payment methods
        const { data: planData, error: planError } = await supabase
          .from('subscriptions')
          .select(`
            *,
            payment_methods (*)
          `)
          .eq('user_id', user.id)
          .maybeSingle();

        if (planError) throw planError;

        setTransactions(transactionsData);
        setCurrentPlan(planData || null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [user?.id]);

  const updateSubscription = async (planName: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('subscriptions').upsert({
        user_id: user.id,
        plan_name: planName,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      toast.success('Subscription updated successfully');
    } catch (err) {
      toast.error('Error updating subscription');
      throw err;
    }
  };

  const addPaymentMethod = async (paymentMethod: NewPaymentMethod) => {
    if (!user) return;

    try {
      // In a real app, you would use Stripe.js to tokenize the card details
      const { error } = await supabase.from('payment_methods').insert({
        user_id: user.id,
        last4: paymentMethod.cardNumber.slice(-4),
        exp_month: paymentMethod.expiryMonth,
        exp_year: paymentMethod.expiryYear,
        is_default: paymentMethod.setAsDefault,
      });

      if (error) throw error;
    } catch (err) {
      throw err instanceof Error ? err : new Error('An error occurred');
    }
  };

  const downloadInvoice = async (transactionId: string) => {
    try {
      // In a real app, you would generate and download a PDF invoice
      toast.success('Invoice downloaded successfully');
    } catch (err) {
      toast.error('Error downloading invoice');
      throw err;
    }
  };

  return {
    transactions,
    currentPlan,
    loading,
    error,
    updateSubscription,
    addPaymentMethod,
    downloadInvoice,
  };
}