import { Transaction, TransactionType } from '../types';
import { users } from './users';

const WALLETS_KEY = 'business_nexus_wallets';
const TRANSACTIONS_KEY = 'business_nexus_transactions';

// ---- Seed data ----

const seedWallets = (): Record<string, number> => {
  const wallets: Record<string, number> = {};
  users.forEach(u => {
    // Investors start with a larger simulated balance than entrepreneurs
    wallets[u.id] = u.role === 'investor' ? 250000 : 15000;
  });
  return wallets;
};

const seedTransactions = (): Transaction[] => [
  {
    id: 'txn1',
    type: 'deposit',
    amount: 15000,
    receiverId: 'e1',
    status: 'completed',
    note: 'Initial wallet funding',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'txn2',
    type: 'deposit',
    amount: 250000,
    receiverId: 'i1',
    status: 'completed',
    note: 'Initial wallet funding',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
];

// ---- Persistence ----

const loadWallets = (): Record<string, number> => {
  const stored = localStorage.getItem(WALLETS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fall through
    }
  }
  const seeded = seedWallets();
  localStorage.setItem(WALLETS_KEY, JSON.stringify(seeded));
  return seeded;
};

const loadTransactions = (): Transaction[] => {
  const stored = localStorage.getItem(TRANSACTIONS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as Transaction[];
    } catch {
      // fall through
    }
  }
  const seeded = seedTransactions();
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(seeded));
  return seeded;
};

const saveWallets = (wallets: Record<string, number>) => {
  localStorage.setItem(WALLETS_KEY, JSON.stringify(wallets));
};

const saveTransactions = (transactions: Transaction[]) => {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

export let wallets: Record<string, number> = loadWallets();
export let transactions: Transaction[] = loadTransactions();

// ---- Helpers ----

export const getWalletBalance = (userId: string): number => wallets[userId] ?? 0;

export const getTransactionsForUser = (userId: string): Transaction[] => {
  return transactions
    .filter(t => t.senderId === userId || t.receiverId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const recordTransaction = (
  type: TransactionType,
  amount: number,
  senderId: string | undefined,
  receiverId: string | undefined,
  note?: string
): Transaction => {
  const txn: Transaction = {
    id: `txn${transactions.length + 1}_${Date.now()}`,
    type,
    amount,
    senderId,
    receiverId,
    status: 'completed',
    note,
    createdAt: new Date().toISOString(),
  };
  transactions = [txn, ...transactions];
  saveTransactions(transactions);
  return txn;
};

export const deposit = (userId: string, amount: number, note?: string): Transaction => {
  wallets = { ...wallets, [userId]: getWalletBalance(userId) + amount };
  saveWallets(wallets);
  return recordTransaction('deposit', amount, undefined, userId, note);
};

export const withdraw = (userId: string, amount: number, note?: string): Transaction | null => {
  if (getWalletBalance(userId) < amount) return null;
  wallets = { ...wallets, [userId]: getWalletBalance(userId) - amount };
  saveWallets(wallets);
  return recordTransaction('withdraw', amount, userId, undefined, note);
};

export const transfer = (
  fromUserId: string,
  toUserId: string,
  amount: number,
  note?: string
): Transaction | null => {
  if (getWalletBalance(fromUserId) < amount) return null;
  wallets = {
    ...wallets,
    [fromUserId]: getWalletBalance(fromUserId) - amount,
    [toUserId]: getWalletBalance(toUserId) + amount,
  };
  saveWallets(wallets);
  return recordTransaction('transfer', amount, fromUserId, toUserId, note);
};

// Investor -> Entrepreneur funding deal mock flow (same mechanics as transfer,
// tagged as 'funding' so it's distinguishable in the transaction history table)
export const fundDeal = (
  investorId: string,
  entrepreneurId: string,
  amount: number,
  dealNote: string
): Transaction | null => {
  if (getWalletBalance(investorId) < amount) return null;
  wallets = {
    ...wallets,
    [investorId]: getWalletBalance(investorId) - amount,
    [entrepreneurId]: getWalletBalance(entrepreneurId) + amount,
  };
  saveWallets(wallets);
  return recordTransaction('funding', amount, investorId, entrepreneurId, dealNote);
};
