import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp, MonitorX, Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { findUserById } from '../../data/users';
import { meetings } from '../../data/meetings';

/**
 * Frontend-only video call mock.
 *
 * There is no signaling server / backend in this project, so this screen
 * cannot establish a real peer-to-peer WebRTC connection to another browser.
 * What it DOES do, using real WebRTC device APIs, is:
 *  - request the local camera/mic via getUserMedia and show a live local preview
 *  - toggle the local audio/video tracks on and off
 *  - start/stop a real screen-share stream via getDisplayMedia
 *  - track call duration
 * The "remote" tile is a placeholder representing the other participant,
 * which is exactly what the task asks for ("video call UI (frontend mock)").
 */
export const VideoCallPage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const [callActive, setCallActive] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [sharingScreen, setSharingScreen] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const meeting = meetings.find(m => m.id === meetingId);
  const otherUserId = meeting
    ? (meeting.requesterId === user?.id ? meeting.hostId : meeting.requesterId)
    : undefined;
  const otherUser = otherUserId ? findUserById(otherUserId) : undefined;

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (callActive) {
      timer = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callActive]);

  useEffect(() => {
    // Clean up media on unmount
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setCallActive(true);
      setPermissionError(null);
      toast.success('Call started');
    } catch {
      setPermissionError(
        'Could not access camera/microphone. Please grant permission in your browser and try again.'
      );
      toast.error('Camera/microphone permission denied');
    }
  };

  const endCall = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    screenStreamRef.current = null;
    setCallActive(false);
    setSharingScreen(false);
    setSeconds(0);
    toast('Call ended', { icon: '📞' });
    navigate('/meetings');
  };

  const toggleMic = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  };

  const toggleCam = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCamOn(track.enabled);
    }
  };

  const toggleScreenShare = async () => {
    if (!sharingScreen) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setSharingScreen(true);
        // Stop sharing automatically if the user ends it from the browser UI
        screenStream.getVideoTracks()[0].onended = () => stopScreenShare();
        toast.success('Screen sharing started');
      } catch {
        toast.error('Screen share permission denied');
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current = null;
    if (localVideoRef.current && streamRef.current) {
      localVideoRef.current.srcObject = streamRef.current;
    }
    setSharingScreen(false);
  };

  const formatDuration = (total: number) => {
    const m = Math.floor(total / 60).toString().padStart(2, '0');
    const s = (total % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Video Call{otherUser ? ` with ${otherUser.name}` : ''}
          </h1>
          {meeting && <p className="text-gray-600">{meeting.topic}</p>}
        </div>
        {callActive && (
          <div className="flex items-center text-sm text-gray-500">
            <Clock size={16} className="mr-1" />
            {formatDuration(seconds)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Remote participant placeholder */}
        <div className="relative bg-gray-900 rounded-lg aspect-video flex items-center justify-center overflow-hidden">
          {otherUser ? (
            <div className="flex flex-col items-center text-white">
              <Avatar src={otherUser.avatarUrl} alt={otherUser.name} size="xl" />
              <p className="mt-3 text-sm text-gray-300">
                {callActive ? `Waiting for ${otherUser.name} to join…` : otherUser.name}
              </p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No participant found for this meeting</p>
          )}
          <span className="absolute top-3 left-3 text-xs bg-black/50 text-white px-2 py-0.5 rounded">
            Remote
          </span>
        </div>

        {/* Local preview */}
        <div className="relative bg-gray-900 rounded-lg aspect-video overflow-hidden flex items-center justify-center">
          {callActive ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${camOn || sharingScreen ? '' : 'hidden'}`}
            />
          ) : (
            <p className="text-gray-400 text-sm text-center px-4">
              {permissionError ?? 'Your camera preview will appear here once you start the call'}
            </p>
          )}
          {callActive && !camOn && !sharingScreen && (
            <div className="absolute inset-0 flex items-center justify-center">
              {user && <Avatar src={user.avatarUrl} alt={user.name} size="xl" />}
            </div>
          )}
          <span className="absolute top-3 left-3 text-xs bg-black/50 text-white px-2 py-0.5 rounded">
            You {sharingScreen ? '(sharing screen)' : ''}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 py-4">
        {!callActive ? (
          <Button leftIcon={<Video size={18} />} onClick={startCall}>
            Start Call
          </Button>
        ) : (
          <>
            <Button
              variant={micOn ? 'outline' : 'error'}
              onClick={toggleMic}
              leftIcon={micOn ? <Mic size={18} /> : <MicOff size={18} />}
            >
              {micOn ? 'Mute' : 'Unmute'}
            </Button>
            <Button
              variant={camOn ? 'outline' : 'error'}
              onClick={toggleCam}
              leftIcon={camOn ? <Video size={18} /> : <VideoOff size={18} />}
              disabled={sharingScreen}
            >
              {camOn ? 'Stop Video' : 'Start Video'}
            </Button>
            <Button
              variant={sharingScreen ? 'accent' : 'outline'}
              onClick={toggleScreenShare}
              leftIcon={sharingScreen ? <MonitorX size={18} /> : <MonitorUp size={18} />}
            >
              {sharingScreen ? 'Stop Sharing' : 'Share Screen'}
            </Button>
            <Button variant="error" onClick={endCall} leftIcon={<PhoneOff size={18} />}>
              End Call
            </Button>
          </>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        This is a frontend-only demo: your own camera/mic/screen-share are real, but there is
        no backend signaling server, so the other participant's video is a placeholder.
      </p>
    </div>
  );
};
