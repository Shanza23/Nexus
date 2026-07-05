import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { WalletCard } from '../../components/payments/WalletCard';
import { FundDealPanel } from '../../components/payments/FundDealPanel';
import { TransactionHistoryTable } from '../../components/payments/TransactionHistoryTable';
import { useAuth } from '../../context/AuthContext';
import { entrepreneurs, investors } from '../../data/users';
import { getTransactionsForUser } from '../../data/payments';

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = () => setRefreshKey(k => k + 1);

  const transactions = useMemo(
    () => (user ? getTransactionsForUser(user.id) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, refreshKey]
  );

  if (!user) return null;

  const otherUsers = user.role === 'entrepreneur' ? investors : entrepreneurs;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600">Simulated wallet, transfers, and deal funding</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <WalletCard userId={user.id} otherUsers={otherUsers} onChange={bump} />
          {user.role === 'investor' && (
            <FundDealPanel investorId={user.id} entrepreneurs={entrepreneurs} onFunded={bump} />
          )}
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
            </CardHeader>
            <CardBody>
              <TransactionHistoryTable transactions={transactions} currentUserId={user.id} />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
