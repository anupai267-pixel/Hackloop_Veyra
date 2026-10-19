import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  ShieldCheck,
  AlertCircle,
  Lock,
  UserCheck
} from 'lucide-react';

export const WebRTCCallPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const [hasPermissions, setHasPermissions] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [connectionState, setConnectionState] = useState('initializing'); // initializing | waiting_for_peer | connected | disconnected

  // STUN ICE Servers
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Request Local Media Stream
  useEffect(() => {
    let isMounted = true;

    async function startMedia() {
      try {
        setConnectionState('initializing');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        if (!isMounted) return;
        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        setHasPermissions(true);
        setConnectionState('waiting_for_peer');

        // Setup RTCPeerConnection
        const pc = new RTCPeerConnection(iceServers);
        peerConnectionRef.current = pc;

        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // Handle remote stream
        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setConnectionState('connected');
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'connected') {
            setConnectionState('connected');
          } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
            setConnectionState('disconnected');
          }
        };
      } catch (err) {
        console.warn('[WebRTC] Camera/Mic access prompt:', err.message);
        if (isMounted) {
          setPermissionError(
            err.name === 'NotAllowedError'
              ? 'Camera and Microphone access was declined. Please permit browser media access to join the post-auction verification room.'
              : `Media initialization: ${err.message}`
          );
          setConnectionState('disconnected');
        }
      }
    }

    startMedia();

    return () => {
      isMounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [roomId]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoDisabled(!isVideoDisabled);
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    navigate('/seller/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]"></span>
              <h1 className="text-xl font-extrabold text-[#171717]">
                Private Post-Auction Verification Call
              </h1>
            </div>
            <p className="text-xs text-[#666666] mt-0.5 font-mono">
              Room ID: {roomId || 'DEMO-CONCIERGE-ROOM'} • Encrypted Peer Connection
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-[#FAFAFA] border border-[#E5E5E5] text-xs font-semibold text-[#171717] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#15803D]" />
              <span>
                {connectionState === 'connected'
                  ? 'Peer Connection Active'
                  : connectionState === 'waiting_for_peer'
                  ? 'Awaiting Participant'
                  : 'Initializing Media'}
              </span>
            </span>
          </div>
        </div>

        {permissionError && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded text-xs text-[#B45309] flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold">Media Permission Required</p>
              <p className="mt-0.5">{permissionError}</p>
            </div>
          </div>
        )}

        {/* Video Screens Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Remote Peer Screen */}
          <div className="aspect-video bg-[#151515] rounded border border-[#E5E5E5] overflow-hidden relative flex items-center justify-center">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {connectionState !== 'connected' && (
              <div className="text-center p-6 space-y-2 text-white">
                <div className="w-10 h-10 rounded-full bg-[#222222] border border-[#383838] flex items-center justify-center mx-auto text-[#CCCCCC]">
                  <UserCheck className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold">Waiting for the other participant...</p>
                <p className="text-[11px] text-[#999999] max-w-xs">
                  Only the verified seller and winning bidder with matching cryptographic session tokens may enter this room.
                </p>
              </div>
            )}
            <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/70 text-white text-[10px] rounded font-mono">
              Remote Peer (Buyer / Seller)
            </span>
          </div>

          {/* Local User Screen */}
          <div className="aspect-video bg-[#151515] rounded border border-[#E5E5E5] overflow-hidden relative flex items-center justify-center">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {isVideoDisabled && (
              <div className="absolute inset-0 bg-[#151515] flex items-center justify-center text-[#CCCCCC] text-xs font-semibold">
                Your camera is turned off
              </div>
            )}
            <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/70 text-white text-[10px] rounded font-mono">
              You ({user?.name || 'Local Participant'})
            </span>
          </div>
        </div>

        {/* Control Toolbar */}
        <div className="card p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded flex items-center justify-center gap-4">
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full border transition-colors ${
              isAudioMuted
                ? 'bg-[#B91C1C] text-white border-[#B91C1C]'
                : 'bg-white text-[#171717] border-[#E5E5E5] hover:bg-[#F5F5F5]'
            }`}
            title={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full border transition-colors ${
              isVideoDisabled
                ? 'bg-[#B91C1C] text-white border-[#B91C1C]'
                : 'bg-white text-[#171717] border-[#E5E5E5] hover:bg-[#F5F5F5]'
            }`}
            title={isVideoDisabled ? 'Turn camera on' : 'Turn camera off'}
          >
            {isVideoDisabled ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </button>

          <button
            onClick={endCall}
            className="px-5 py-3 rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-semibold text-xs flex items-center gap-2"
            title="Leave & end verification call"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Call</span>
          </button>
        </div>

        {/* Privacy notice */}
        <div className="p-3 bg-white border border-[#E5E5E5] rounded text-[11px] text-[#666666] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#15803D] shrink-0" />
          <span>
            Per platform policy, this peer connection is end-to-end encrypted. Recording without explicit, informed mutual consent is prohibited.
          </span>
        </div>
      </main>

      <Footer />
    </div>
  );
};
