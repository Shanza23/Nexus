import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { Send } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { User, AvailabilitySlot } from '../../types';
import { requestMeeting } from '../../data/meetings';

interface RequestMeetingPanelProps {
  currentUserId: string;
  counterparts: User[]; // the opposite role's users the current user can request meetings with
  slots: AvailabilitySlot[]; // all availability slots in the system
  onRequested: () => void;
}

export const RequestMeetingPanel: React.FC<RequestMeetingPanelProps> = ({
  currentUserId,
  counterparts,
  slots,
  onRequested,
}) => {
  const todayIso = new Date().toISOString().split('T')[0];
  const [selectedUserId, setSelectedUserId] = useState(counterparts[0]?.id ?? '');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [topic, setTopic] = useState('');

  const openSlots = useMemo(
    () =>
      slots
        .filter(slot => slot.userId === selectedUserId && !slot.isBooked && slot.date >= todayIso)
        .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime)),
    [slots, selectedUserId, todayIso]
  );

  const handleSubmit = () => {
    if (!selectedSlotId) {
      toast.error('Please choose an available time slot');
      return;
    }
    if (!topic.trim()) {
      toast.error('Please add a short topic for the meeting');
      return;
    }

    const meeting = requestMeeting(selectedSlotId, currentUserId, topic.trim());
    if (meeting) {
      toast.success('Meeting request sent!');
      setTopic('');
      setSelectedSlotId('');
      onRequested();
    } else {
      toast.error('That slot is no longer available');
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-medium text-gray-900">Request a Meeting</h2>
      </CardHeader>
      <CardBody className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Who do you want to meet?</label>
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            value={selectedUserId}
            onChange={e => {
              setSelectedUserId(e.target.value);
              setSelectedSlotId('');
            }}
          >
            {counterparts.map(person => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Available time slots</label>
          {openSlots.length === 0 ? (
            <p className="text-sm text-gray-500">This person has no open slots right now.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {openSlots.map(slot => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlotId(slot.id)}
                  className={`text-sm rounded-md border px-3 py-2 text-left transition-colors ${
                    selectedSlotId === slot.id
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="font-medium">{format(parseISO(slot.date), 'EEE, MMM d')}</div>
                  <div className="text-gray-500">{slot.startTime}–{slot.endTime}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <Input
          label="Meeting topic"
          placeholder="e.g. Discuss Series A funding round"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          fullWidth
        />

        <Button leftIcon={<Send size={16} />} onClick={handleSubmit} disabled={openSlots.length === 0}>
          Send Meeting Request
        </Button>
      </CardBody>
    </Card>
  );
};
