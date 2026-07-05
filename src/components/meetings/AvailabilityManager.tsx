import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AvailabilitySlot } from '../../types';
import { addAvailabilitySlot, removeAvailabilitySlot } from '../../data/meetings';

interface AvailabilityManagerProps {
  userId: string;
  slots: AvailabilitySlot[];
  onSlotsChange: () => void;
}

export const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({
  userId,
  slots,
  onSlotsChange,
}) => {
  const todayIso = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayIso);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:30');

  const handleAddSlot = () => {
    if (!date || !startTime || !endTime) {
      toast.error('Please fill in date, start time and end time');
      return;
    }
    if (endTime <= startTime) {
      toast.error('End time must be after start time');
      return;
    }

    addAvailabilitySlot(userId, date, startTime, endTime);
    toast.success('Availability slot added');
    onSlotsChange();
  };

  const handleRemoveSlot = (slotId: string) => {
    removeAvailabilitySlot(slotId);
    toast.success('Slot removed');
    onSlotsChange();
  };

  const upcomingSlots = slots
    .filter(slot => slot.date >= todayIso)
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-medium text-gray-900">My Availability</h2>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <Input
            type="date"
            label="Date"
            min={todayIso}
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <Input
            type="time"
            label="Start time"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
          />
          <Input
            type="time"
            label="End time"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
          />
        </div>

        <Button leftIcon={<Plus size={16} />} onClick={handleAddSlot} size="sm">
          Add Slot
        </Button>

        <div className="mt-5 space-y-2">
          {upcomingSlots.length === 0 && (
            <p className="text-sm text-gray-500">No upcoming availability yet. Add a slot above.</p>
          )}
          {upcomingSlots.map(slot => (
            <div
              key={slot.id}
              className="flex items-center justify-between px-3 py-2 rounded-md border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-800">
                  {format(parseISO(slot.date), 'EEE, MMM d')}
                </span>
                <span className="text-sm text-gray-500">
                  {slot.startTime}–{slot.endTime}
                </span>
                {slot.isBooked ? (
                  <Badge variant="success" size="sm">Booked</Badge>
                ) : (
                  <Badge variant="gray" size="sm">Open</Badge>
                )}
              </div>
              {!slot.isBooked && (
                <button
                  onClick={() => handleRemoveSlot(slot.id)}
                  className="text-gray-400 hover:text-error-500 transition-colors"
                  aria-label="Remove slot"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
