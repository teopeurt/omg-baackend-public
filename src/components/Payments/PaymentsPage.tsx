import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
  Download,
  Star,
  Shield,
  Zap,
  Check,
} from 'lucide-react';
import { usePayments } from '../../hooks/usePayments';
import { PaymentMethodForm } from './PaymentMethodForm';
import { formatCurrency } from '../../utils/format';

const plans = [
  {
    name: 'Basic',
    price: 9.99,
    features: ['10 events per month', 'Basic analytics', 'Email support'],
    recommended: false,
  },
  {
    name: 'Pro',
    price: 29.99,
    features: [
      'Unlimited events',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
    ],
    recommended: true,
  },
  {
    name: 'Enterprise',
    price: 99.99,
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'API access',
      'Custom integrations',
    ],
    recommended: false,
  },
];

export function PaymentsPage() {
  const {
    transactions,
    currentPlan,
    loading,
    error,
    updateSubscription,
    downloadInvoice,
  } = usePayments();

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: 'date', direction: 'desc' });

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddCard, setShowAddCard] = useState(false);

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    });
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortConfig.key === 'date') {
      return sortConfig.direction === 'asc'
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortConfig.key === 'amount') {
      return sortConfig.direction === 'asc'
        ? a.amount - b.amount
        : b.amount - a.amount;
    }
    return 0;
  });

  const filteredTransactions = sortedTransactions.filter((transaction) => {
    if (filterStatus === 'all') return true;
    return transaction.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Error loading payment information
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Subscription Plans */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative bg-white rounded-lg shadow-sm p-6 ${
                plan.recommended
                  ? 'border-2 border-blue-500'
                  : 'border border-gray-200'
              }`}
            >
              {plan.recommended && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium rounded-bl-lg rounded-tr-lg">
                  Recommended
                </div>
              )}
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">
                  ${plan.price}
                </span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => updateSubscription(plan.name)}
                className={`w-full py-2 rounded-lg font-medium ${
                  currentPlan?.name === plan.name
                    ? 'bg-gray-100 text-gray-600 cursor-default'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                disabled={currentPlan?.name === plan.name}
              >
                {currentPlan?.name === plan.name ? 'Current Plan' : 'Upgrade'}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Payment Methods */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Payment Methods</h2>
          <button
            onClick={() => setShowAddCard(!showAddCard)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Add Payment Method
          </button>
        </div>

        {showAddCard && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <PaymentMethodForm onSuccess={() => setShowAddCard(false)} />
          </motion.div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
          {currentPlan?.paymentMethods.map((method) => (
            <div
              key={method.id}
              className="p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <CreditCard className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="font-medium">
                    •••• •••• •••• {method.last4}
                  </p>
                  <p className="text-sm text-gray-500">
                    Expires {method.expMonth}/{method.expYear}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {method.isDefault && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full">
                    Default
                  </span>
                )}
                <button className="text-red-500 hover:text-red-600 text-sm font-medium">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Transaction History */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Transaction History</h2>
          <div className="flex items-center gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      {sortConfig.key === 'date' && (
                        sortConfig.direction === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center gap-1">
                      Amount
                      {sortConfig.key === 'amount' && (
                        sortConfig.direction === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(transaction.amount, 'USD')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => downloadInvoice(transaction.id)}
                        className="text-blue-600 hover:text-blue-500"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}