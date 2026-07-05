import { AvailabilitySlot, Meeting, MeetingStatus } from '../types';

const SLOTS_KEY = 'business_nexus_slots';
const MEETINGS_KEY = 'business_nexus_meetings';

// ---- Seed data (used only the first time the app runs) ----

const seedSlots = (): AvailabilitySlot[] => {
  const today = new Date();
  const iso = (daysAhead: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  };

  return [
    { id: 'slot1', userId: 'i1', date: iso(1), startTime: '09:00', endTime: '09:30', isBooked: false },
    { id: 'slot2', userId: 'i1', date: iso(1), startTime: '10:00', endTime: '10:30', isBooked: true },
    { id: 'slot3', userId: 'i1', date: iso(2), startTime: '14:00', endTime: '14:30', isBooked: false },
    { id: 'slot4', userId: 'e1', date: iso(1), startTime: '10:00', endTime: '10:30', isBooked: true },
    { id: 'slot5', userId: 'e1', date: iso(3), startTime: '11:00', endTime: '11:30', isBooked: false },
    { id: 'slot6', userId: 'i2', date: iso(4), startTime: '15:00', endTime: '15:30', isBooked: false },
  ];
};

const seedMeetings = (): Meeting[] => {
  const today = new Date();
  const iso = (daysAhead: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'meet1',
      slotId: 'slot2',
      requesterId: 'e1',
      hostId: 'i1',
      date: iso(1),
      startTime: '10:00',
      endTime: '10:30',
      topic: 'Series A discussion for TechWave AI',
      status: 'accepted',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'meet2',
      slotId: 'slot4',
      requesterId: 'i2',
      hostId: 'e1',
      date: iso(1),
      startTime: '10:00',
      endTime: '10:30',
      topic: 'Follow-up on sustainability roadmap',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
  ];
};

// ---- Persistence helpers ----

const load = <T,>(key: string, seed: () => T[]): T[] => {
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored) as T[];
    } catch {
      // fall through to reseed on corrupt data
    }
  }
  const seeded = seed();
  localStorage.setItem(key, JSON.stringify(seeded));
  return seeded;
};

const save = <T,>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export let availabilitySlots: AvailabilitySlot[] = load(SLOTS_KEY, seedSlots);
export let meetings: Meeting[] = load(MEETINGS_KEY, seedMeetings);

// ---- Availability slot operations ----

export const getSlotsForUser = (userId: string): AvailabilitySlot[] => {
  return availabilitySlots
    .filter(slot => slot.userId === userId)
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
};

export const addAvailabilitySlot = (
  userId: string,
  date: string,
  startTime: string,
  endTime: string
): AvailabilitySlot => {
  const newSlot: AvailabilitySlot = {
    id: `slot${availabilitySlots.length + 1}_${Date.now()}`,
    userId,
    date,
    startTime,
    endTime,
    isBooked: false,
  };
  availabilitySlots = [...availabilitySlots, newSlot];
  save(SLOTS_KEY, availabilitySlots);
  return newSlot;
};

export const removeAvailabilitySlot = (slotId: string): void => {
  availabilitySlots = availabilitySlots.filter(slot => slot.id !== slotId);
  save(SLOTS_KEY, availabilitySlots);
};

// ---- Meeting operations ----

export const getMeetingsForUser = (userId: string): Meeting[] => {
  return meetings
    .filter(m => m.requesterId === userId || m.hostId === userId)
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
};

export const getUpcomingConfirmedMeetings = (userId: string): Meeting[] => {
  const todayIso = new Date().toISOString().split('T')[0];
  return getMeetingsForUser(userId).filter(
    m => m.status === 'accepted' && m.date >= todayIso
  );
};

export const getPendingMeetingRequestsForHost = (hostId: string): Meeting[] => {
  return meetings.filter(m => m.hostId === hostId && m.status === 'pending');
};

export const requestMeeting = (
  slotId: string,
  requesterId: string,
  topic: string
): Meeting | null => {
  const slot = availabilitySlots.find(s => s.id === slotId);
  if (!slot || slot.isBooked) return null;

  const newMeeting: Meeting = {
    id: `meet${meetings.length + 1}_${Date.now()}`,
    slotId: slot.id,
    requesterId,
    hostId: slot.userId,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    topic,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  meetings = [...meetings, newMeeting];
  save(MEETINGS_KEY, meetings);
  return newMeeting;
};

export const updateMeetingStatus = (
  meetingId: string,
  status: MeetingStatus
): Meeting | null => {
  const index = meetings.findIndex(m => m.id === meetingId);
  if (index === -1) return null;

  meetings = meetings.map((m, i) => (i === index ? { ...m, status } : m));
  save(MEETINGS_KEY, meetings);

  // Mark the underlying slot as booked/free based on the new status
  const meeting = meetings[index];
  availabilitySlots = availabilitySlots.map(slot =>
    slot.id === meeting.slotId
      ? { ...slot, isBooked: status === 'accepted' }
      : slot
  );
  save(SLOTS_KEY, availabilitySlots);

  return meeting;
};
