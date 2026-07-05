import React, { useMemo } from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

type Strength = { label: string; score: number; colorClass: string };

const evaluate = (password: string): Strength => {
  if (!password) return { label: '', score: 0, colorClass: 'bg-gray-200' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: 'Weak', score: 1, colorClass: 'bg-error-500' };
  if (score <= 2) return { label: 'Fair', score: 2, colorClass: 'bg-warning-500' };
  if (score <= 3) return { label: 'Good', score: 3, colorClass: 'bg-accent-500' };
  return { label: 'Strong', score: 4, colorClass: 'bg-success-500' };
};

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const strength = useMemo(() => evaluate(password), [password]);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < strength.score ? strength.colorClass : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Password strength: <span className="font-medium">{strength.label}</span>
      </p>
    </div>
  );
};
