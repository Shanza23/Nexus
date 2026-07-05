import React, { useMemo, useState } from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { CalendarDays, Inbox, Send as SendIcon } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { MeetingRequestCard } from '../../components/meetings/MeetingRequestCard';
import { AvailabilityManager } from '../../components/meetings/AvailabilityManager';
import { RequestMeetingPanel } from '../../components/meetings/RequestMeetingPanel';
import { useAuth } from '../../context/AuthContext';
import { entrepreneurs, investors } from '../../data/users';
import {
  availabilitySlots as allSlots,
  getMeetingsForUser,
  getSlotsForUser,
} from '../../data/meetings';
import 'react-calendar/dist/Calendar.css';

export const MeetingsPage: React.FC = () => {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const bump = () => setRefreshKey(k => k + 1);

  const myMeetings = useMemo(
    () => (user ? getMeetingsForUser(user.id) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, refreshKey]
  );
  const mySlots = useMemo(
    () => (user ? getSlotsForUser(user.id) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, refreshKey]
  );

  if (!user) return null;

  const counterparts = user.role === 'entrepreneur' ? investors : entrepreneurs;

  const pendingForMe = myMeetings.filter(m => m.status === 'pending' && m.hostId === user.id);
  const myOutgoingRequests = myMeetings.filter(m => m.status === 'pending' && m.requesterId === user.id);
  const confirmedMeetings = myMeetings.filter(m => m.status === 'accepted');

  const confirmedDates = new Set(confirmedMeetings.map(m => m.date));
  const selectedIso = format(selectedDate, 'yyyy-MM-dd');
  const meetingsOnSelectedDate = confirmedMeetings.filter(m => m.date === selectedIso);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
        <p className="text-gray-600">Manage your availability and schedule meetings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="flex items-center gap-2">
              <CalendarDays size={18} className="text-primary-600" />
              <h2 className="text-lg font-medium text-gray-900">Calendar</h2>
            </CardHeader>
            <CardBody>
              <Calendar
                value={selectedDate}
                onChange={value => setSelectedDate(value as Date)}
                tileClassName={({ date }) => {
                  const iso = format(date, 'yyyy-MM-dd');
                  return confirmedDates.has(iso) ? 'nexus-has-meeting' : null;
                }}
                className="nexus-calendar"
              />
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  {format(selectedDate, 'EEEE, MMMM d')}
                </h3>
                {meetingsOnSelectedDate.length === 0 ? (
                  <p className="text-sm text-gray-500">No confirmed meetings this day.</p>
                ) : (
                  <ul className="space-y-1">
                    {meetingsOnSelectedDate.map(m => (
                      <li key={m.id} className="text-sm text-gray-700">
                        {m.startTime}–{m.endTime} · {m.topic}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardBody>
          </Card>

          <AvailabilityManager userId={user.id} slots={mySlots} onSlotsChange={bump} />
        </div>

        {/* Requests & scheduling */}
        <div className="lg:col-span-2 space-y-6">
          <RequestMeetingPanel
            currentUserId={user.id}
            counterparts={counterparts}
            slots={allSlots}
            onRequested={bump}
          />

          <Card>
            <CardHeader className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Inbox size={18} className="text-primary-600" />
                <h2 className="text-lg font-medium text-gray-900">Requests Awaiting Your Response</h2>
              </div>
              <Badge variant="warning">{pendingForMe.length} pending</Badge>
            </CardHeader>
            <CardBody className="space-y-4">
              {pendingForMe.length === 0 ? (
                <p className="text-sm text-gray-500">No meeting requests waiting on you.</p>
              ) : (
                pendingForMe.map(meeting => (
                  <MeetingRequestCard
                    key={meeting.id}
                    meeting={meeting}
                    currentUserId={user.id}
                    onStatusUpdate={bump}
                  />
                ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <SendIcon size={18} className="text-primary-600" />
                <h2 className="text-lg font-medium text-gray-900">Your Sent Requests</h2>
              </div>
              <Badge variant="primary">{myOutgoingRequests.length} pending</Badge>
            </CardHeader>
            <CardBody className="space-y-4">
              {myOutgoingRequests.length === 0 ? (
                <p className="text-sm text-gray-500">You haven't requested any meetings yet.</p>
              ) : (
                myOutgoingRequests.map(meeting => (
                  <MeetingRequestCard
                    key={meeting.id}
                    meeting={meeting}
                    currentUserId={user.id}
                    onStatusUpdate={bump}
                  />
                ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Upcoming Confirmed Meetings</h2>
              <Badge variant="success">{confirmedMeetings.length}</Badge>
            </CardHeader>
            <CardBody className="space-y-4">
              {confirmedMeetings.length === 0 ? (
                <p className="text-sm text-gray-500">Nothing confirmed yet.</p>
              ) : (
                confirmedMeetings.map(meeting => (
                  <MeetingRequestCard
                    key={meeting.id}
                    meeting={meeting}
                    currentUserId={user.id}
                    onStatusUpdate={bump}
                  />
                ))
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
