import React from 'react';
import { format } from 'date-fns';
import { ArrowDownCircle, ArrowUpCircle, Send, TrendingUp } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Transaction } from '../../types';
import { findUserById } from '../../data/users';

interface TransactionHistoryTableProps {
  transactions: Transaction[];
  currentUserId: string;
}

const typeIcon = (type: Transaction['type']) => {
  switch (type) {
    case 'deposit':
      return <ArrowDownCircle size={16} className="text-success-500" />;
    case 'withdraw':
      return <ArrowUpCircle size={16} className="text-error-500" />;
    case 'transfer':
      return <Send size={16} className="text-primary-500" />;
    case 'funding':
      return <TrendingUp size={16} className="text-accent-500" />;
  }
};

const statusBadge = (status: Transaction['status']) => {
  switch (status) {
    case 'completed':
      return <Badge variant="success" size="sm">Completed</Badge>;
    case 'pending':
      return <Badge variant="warning" size="sm">Pending</Badge>;
    case 'failed':
      return <Badge variant="error" size="sm">Failed</Badge>;
  }
};

const nameFor = (userId?: string, fallback = 'External') => {
  if (!userId) return fallback;
  return findUserById(userId)?.name ?? userId;
};

export const TransactionHistoryTable: React.FC<TransactionHistoryTableProps> = ({
  transactions,
  currentUserId,
}) => {
  if (transactions.length === 0) {
    return <p className="text-sm text-gray-500 py-6 text-center">No transactions yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <th className="py-2 pr-4">Type</th>
            <th className="py-2 pr-4">Amount</th>
            <th className="py-2 pr-4">Sender</th>
            <th className="py-2 pr-4">Receiver</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {transactions.map(txn => {
            const isOutgoing = txn.senderId === currentUserId;
            return (
              <tr key={txn.id} className="text-sm text-gray-700">
                <td className="py-3 pr-4 flex items-center gap-2 capitalize">
                  {typeIcon(txn.type)}
                  {txn.type}
                </td>
                <td className={`py-3 pr-4 font-medium ${isOutgoing ? 'text-error-600' : 'text-success-600'}`}>
                  {isOutgoing ? '-' : '+'}${txn.amount.toLocaleString()}
                </td>
                <td className="py-3 pr-4">{nameFor(txn.senderId, 'External')}</td>
                <td className="py-3 pr-4">{nameFor(txn.receiverId, 'External')}</td>
                <td className="py-3 pr-4">{statusBadge(txn.status)}</td>
                <td className="py-3 pr-4 text-gray-500">{format(new Date(txn.createdAt), 'MMM d, yyyy')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
