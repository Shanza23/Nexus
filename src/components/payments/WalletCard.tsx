import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Wallet, ArrowDownCircle, ArrowUpCircle, Send } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { deposit, withdraw, transfer, getWalletBalance } from '../../data/payments';
import { User } from '../../types';

interface WalletCardProps {
  userId: string;
  otherUsers: User[];
  onChange: () => void;
}

type ActiveModal = 'deposit' | 'withdraw' | 'transfer' | null;

export const WalletCard: React.FC<WalletCardProps> = ({ userId, otherUsers, onChange }) => {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [amount, setAmount] = useState('');
  const [recipientId, setRecipientId] = useState(otherUsers[0]?.id ?? '');

  const balance = getWalletBalance(userId);

  const closeModal = () => {
    setActiveModal(null);
    setAmount('');
  };

  const handleConfirm = () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    if (activeModal === 'deposit') {
      deposit(userId, value, 'Simulated deposit');
      toast.success(`Deposited $${value.toLocaleString()}`);
    } else if (activeModal === 'withdraw') {
      const result = withdraw(userId, value, 'Simulated withdrawal');
      if (!result) {
        toast.error('Insufficient balance');
        return;
      }
      toast.success(`Withdrew $${value.toLocaleString()}`);
    } else if (activeModal === 'transfer') {
      if (!recipientId) {
        toast.error('Choose a recipient');
        return;
      }
      const result = transfer(userId, recipientId, value, 'Simulated transfer');
      if (!result) {
        toast.error('Insufficient balance');
        return;
      }
      toast.success(`Transferred $${value.toLocaleString()}`);
    }

    closeModal();
    onChange();
  };

  return (
    <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
      <CardHeader className="border-b-0 flex items-center gap-2">
        <Wallet size={18} />
        <h2 className="text-lg font-medium">Wallet</h2>
      </CardHeader>
      <CardBody>
        <p className="text-sm text-primary-100">Available Balance</p>
        <h3 className="text-3xl font-bold mt-1">${balance.toLocaleString()}</h3>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<ArrowDownCircle size={16} />}
            onClick={() => setActiveModal('deposit')}
          >
            Deposit
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="!text-white !border-white/40 hover:!bg-white/10"
            leftIcon={<ArrowUpCircle size={16} />}
            onClick={() => setActiveModal('withdraw')}
          >
            Withdraw
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="!text-white !border-white/40 hover:!bg-white/10"
            leftIcon={<Send size={16} />}
            onClick={() => setActiveModal('transfer')}
          >
            Transfer
          </Button>
        </div>
      </CardBody>

      {activeModal && (
        <Modal
          title={activeModal === 'deposit' ? 'Deposit Funds' : activeModal === 'withdraw' ? 'Withdraw Funds' : 'Transfer Funds'}
          onClose={closeModal}
        >
          <div className="space-y-4">
            {activeModal === 'transfer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={recipientId}
                  onChange={e => setRecipientId(e.target.value)}
                >
                  {otherUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <Input
              label="Amount (USD)"
              type="number"
              min={1}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              fullWidth
              startAdornment={<span>$</span>}
            />
            <p className="text-xs text-gray-400">
              This is a simulated payment — no real money moves. It's for demonstrating the UI/UX flow only.
            </p>
            <Button fullWidth onClick={handleConfirm}>
              Confirm {activeModal === 'deposit' ? 'Deposit' : activeModal === 'withdraw' ? 'Withdrawal' : 'Transfer'}
            </Button>
          </div>
        </Modal>
      )}
    </Card>
  );
};
