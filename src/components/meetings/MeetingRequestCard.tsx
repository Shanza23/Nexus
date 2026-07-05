import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, MessageCircle, Clock, Video } from 'lucide-react';
import { Meeting } from '../../types';
import { Card, CardBody, CardFooter } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { findUserById } from '../../data/users';
import { updateMeetingStatus } from '../../data/meetings';
import { format, parseISO } from 'date-fns';

interface MeetingRequestCardProps {
  meeting: Meeting;
  currentUserId: string;
  onStatusUpdate?: (meetingId: string, status: Meeting['status']) => void;
}

export const MeetingRequestCard: React.FC<MeetingRequestCardProps> = ({
  meeting,
  currentUserId,
  onStatusUpdate,
}) => {
  const navigate = useNavigate();

  // The "other person" is whoever isn't the current user
  const otherUserId = meeting.requesterId === currentUserId ? meeting.hostId : meeting.requesterId;
  const otherUser = findUserById(otherUserId);
  const isHost = meeting.hostId === currentUserId;

  if (!otherUser) return null;

  const handleAccept = () => {
    updateMeetingStatus(meeting.id, 'accepted');
    onStatusUpdate?.(meeting.id, 'accepted');
  };

  const handleDecline = () => {
    updateMeetingStatus(meeting.id, 'declined');
    onStatusUpdate?.(meeting.id, 'declined');
  };

  const handleCancel = () => {
    updateMeetingStatus(meeting.id, 'cancelled');
    onStatusUpdate?.(meeting.id, 'cancelled');
  };

  const handleMessage = () => {
    navigate(`/chat/${otherUser.id}`);
  };

  const getStatusBadge = () => {
    switch (meeting.status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'accepted':
        return <Badge variant="success">Confirmed</Badge>;
      case 'declined':
        return <Badge variant="error">Declined</Badge>;
      case 'cancelled':
        return <Badge variant="gray">Cancelled</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="transition-all duration-300">
      <CardBody>
        <div className="flex justify-between items-start">
          <div className="flex items-start">
            <Avatar
              src={otherUser.avatarUrl}
              alt={otherUser.name}
              size="md"
              status={otherUser.isOnline ? 'online' : 'offline'}
              className="mr-3"
            />
            <div>
              <h3 className="text-md font-semibold text-gray-900">{otherUser.name}</h3>
              <p className="text-sm text-gray-500 flex items-center mt-0.5">
                <Clock size={14} className="mr-1" />
                {format(parseISO(meeting.date), 'EEE, MMM d')} · {meeting.startTime}–{meeting.endTime}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600">{meeting.topic}</p>
        </div>
      </CardBody>

      <CardFooter className="border-t border-gray-100 bg-gray-50">
        {meeting.status === 'pending' && isHost && (
          <div className="flex justify-between w-full">
            <div className="space-x-2">
              <Button variant="outline" size="sm" leftIcon={<X size={16} />} onClick={handleDecline}>
                Decline
              </Button>
              <Button variant="success" size="sm" leftIcon={<Check size={16} />} onClick={handleAccept}>
                Accept
              </Button>
            </div>
            <Button variant="primary" size="sm" leftIcon={<MessageCircle size={16} />} onClick={handleMessage}>
              Message
            </Button>
          </div>
        )}

        {meeting.status === 'pending' && !isHost && (
          <div className="flex justify-between w-full items-center">
            <span className="text-xs text-gray-500">Waiting for {otherUser.name} to respond</span>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel Request
            </Button>
          </div>
        )}

        {(meeting.status === 'accepted' || meeting.status === 'declined' || meeting.status === 'cancelled') && (
          <div className="flex justify-between w-full">
            <Button variant="outline" size="sm" leftIcon={<MessageCircle size={16} />} onClick={handleMessage}>
              Message
            </Button>
            <div className="space-x-2">
              {meeting.status === 'accepted' && (
                <>
                  <Button variant="ghost" size="sm" className="text-error-500" onClick={handleCancel}>
                    Cancel Meeting
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Video size={16} />}
                    onClick={() => navigate(`/call/${meeting.id}`)}
                  >
                    Join Call
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
