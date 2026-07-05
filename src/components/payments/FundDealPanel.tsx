import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Entrepreneur } from '../../types';
import { fundDeal, getWalletBalance } from '../../data/payments';

interface FundDealPanelProps {
  investorId: string;
  entrepreneurs: Entrepreneur[];
  onFunded: () => void;
}

export const FundDealPanel: React.FC<FundDealPanelProps> = ({ investorId, entrepreneurs, onFunded }) => {
  const [entrepreneurId, setEntrepreneurId] = useState(entrepreneurs[0]?.id ?? '');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleFund = () => {
    const value = Number(amount);
    if (!entrepreneurId) {
      toast.error('Choose a startup to fund');
      return;
    }
    if (!value || value <= 0) {
      toast.error('Enter a valid funding amount');
      return;
    }
    if (value > getWalletBalance(investorId)) {
      toast.error('Insufficient wallet balance for this deal');
      return;
    }

    const startup = entrepreneurs.find(e => e.id === entrepreneurId);
    const result = fundDeal(investorId, entrepreneurId, value, note || `Funding for ${startup?.startupName}`);
    if (result) {
      toast.success(`Funded ${startup?.startupName} with $${value.toLocaleString()}`);
      setAmount('');
      setNote('');
      onFunded();
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        <TrendingUp size={18} className="text-accent-600" />
        <h2 className="text-lg font-medium text-gray-900">Fund a Deal</h2>
      </CardHeader>
      <CardBody className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Startup</label>
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            value={entrepreneurId}
            onChange={e => setEntrepreneurId(e.target.value)}
          >
            {entrepreneurs.map(e => (
              <option key={e.id} value={e.id}>
                {e.startupName} — {e.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Funding amount (USD)"
          type="number"
          min={1}
          value={amount}
          onChange={e => setAmount(e.target.value)}
          fullWidth
          startAdornment={<span>$</span>}
        />

        <Input
          label="Note (optional)"
          placeholder="e.g. Seed round, tranche 1"
          value={note}
          onChange={e => setNote(e.target.value)}
          fullWidth
        />

        <Button leftIcon={<TrendingUp size={16} />} onClick={handleFund} fullWidth>
          Send Funding
        </Button>
        <p className="text-xs text-gray-400">
          Simulation only — this moves balances between mock wallets so the funding flow can be demoed end to end.
        </p>
      </CardBody>
    </Card>
  );
};
