import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowRight, ArrowLeft } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { UserRole } from '../../types';

interface TourStep {
  title: string;
  description: string;
  path: string;
}

const stepsFor = (role: UserRole): TourStep[] => [
  {
    title: 'Your Dashboard',
    description:
      role === 'entrepreneur'
        ? 'Track investor interest, funding progress, and everything on your plate in one place.'
        : 'Track your portfolio, deal flow, and pending requests from founders in one place.',
    path: role === 'entrepreneur' ? '/dashboard/entrepreneur' : '/dashboard/investor',
  },
  {
    title: 'Meetings',
    description:
      'Set your availability, request or accept meetings, and join a video call once a meeting is confirmed.',
    path: '/meetings',
  },
  {
    title: 'Document Chamber',
    description: 'Upload contracts and pitch decks, track their status, and collect e-signatures.',
    path: '/documents',
  },
  {
    title: 'Payments',
    description:
      role === 'investor'
        ? 'Manage your wallet and fund deals directly with founders you want to back.'
        : 'Manage your wallet and see funds you receive from investors.',
    path: '/payments',
  },
  {
    title: 'Messages',
    description: 'Chat directly with the founders or investors you are connected with.',
    path: '/messages',
  },
];

interface OnboardingTourProps {
  role: UserRole;
  onClose: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ role, onClose }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const navigate = useNavigate();
  const steps = stepsFor(role);
  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  const goNext = () => {
    navigate(step.path);
    if (isLast) {
      onClose();
    } else {
      setStepIndex(i => i + 1);
    }
  };

  const goBack = () => setStepIndex(i => Math.max(0, i - 1));

  return (
    <Modal title="Take a quick tour" onClose={onClose}>
      <div className="flex items-center gap-2 mb-3">
        <Compass size={18} className="text-primary-600" />
        <h4 className="text-md font-semibold text-gray-900">{step.title}</h4>
      </div>
      <p className="text-sm text-gray-600">{step.description}</p>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-6 rounded-full ${i <= stepIndex ? 'bg-primary-600' : 'bg-gray-200'}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          {stepIndex > 0 && (
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={goBack}>
              Back
            </Button>
          )}
          <Button size="sm" onClick={goNext} leftIcon={!isLast ? <ArrowRight size={14} /> : undefined}>
            {isLast ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
