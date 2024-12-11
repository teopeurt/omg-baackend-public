import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Lock } from 'lucide-react';
import { usePayments } from '../../hooks/usePayments';
import toast from 'react-hot-toast';

const paymentMethodSchema = z.object({
  cardNumber: z
    .string()
    .min(1, 'Card number is required')
    .regex(/^\d{16}$/, 'Invalid card number'),
  expiryMonth: z
    .string()
    .min(1, 'Expiry month is required')
    .regex(/^(0[1-9]|1[0-2])$/, 'Invalid month'),
  expiryYear: z
    .string()
    .min(1, 'Expiry year is required')
    .regex(/^\d{4}$/, 'Invalid year'),
  cvc: z
    .string()
    .min(1, 'CVC is required')
    .regex(/^\d{3,4}$/, 'Invalid CVC'),
  name: z.string().min(1, 'Name is required'),
  setAsDefault: z.boolean().optional(),
});

type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>;

interface PaymentMethodFormProps {
  onSuccess: () => void;
}

export function PaymentMethodForm({ onSuccess }: PaymentMethodFormProps) {
  const { addPaymentMethod } = usePayments();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentMethodFormData>({
    resolver: zodResolver(paymentMethodSchema),
  });

  const onSubmit = async (data: PaymentMethodFormData) => {
    setSubmitting(true);
    try {
      await addPaymentMethod({
        cardNumber: data.cardNumber,
        expiryMonth: data.expiryMonth,
        expiryYear: data.expiryYear,
        cvc: data.cvc,
        name: data.name,
        setAsDefault: data.setAsDefault,
      });
      toast.success('Payment method added successfully');
      onSuccess();
    } catch (error) {
      toast.error('Error adding payment method');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-semibold">Add Payment Method</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name on Card
            </label>
            <input
              type="text"
              id="name"
              {...register('name')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="col-span-2">
            <label
              htmlFor="cardNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Card Number
            </label>
            <input
              type="text"
              id="cardNumber"
              {...register('cardNumber')}
              placeholder="1234 5678 9012 3456"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.cardNumber && (
              <p className="mt-1 text-sm text-red-600">
                {errors.cardNumber.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Expiry Date
            </label>
            <div className="mt-1 flex gap-4">
              <div className="w-1/2">
                <input
                  type="text"
                  {...register('expiryMonth')}
                  placeholder="MM"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.expiryMonth && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.expiryMonth.message}
                  </p>
                )}
              </div>
              <div className="w-1/2">
                <input
                  type="text"
                  {...register('expiryYear')}
                  placeholder="YYYY"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.expiryYear && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.expiryYear.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="cvc"
              className="block text-sm font-medium text-gray-700"
            >
              CVC
            </label>
            <input
              type="text"
              id="cvc"
              {...register('cvc')}
              placeholder="123"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.cvc && (
              <p className="mt-1 text-sm text-red-600">{errors.cvc.message}</p>
            )}
          </div>

          <div className="col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('setAsDefault')}
                className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Set as default payment method
              </span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Lock className="w-4 h-4" />
            <span>Your payment info is secure</span>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {submitting ? 'Adding...' : 'Add Payment Method'}
          </button>
        </div>
      </div>
    </form>
  );
}