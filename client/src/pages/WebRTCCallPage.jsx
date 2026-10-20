import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  PhoneOff,
  ShieldCheck,
  AlertCircle,
  Lock,
  UserCheck,
  MonitorUp,
  MonitorOff,
  Maximize2,
  Minimize2,
  PictureInPicture2,
  Clock,
  ArrowLeft,
  Settings,
  Users,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const WebRTCCallPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Video Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const socketRef = useRef(null);
  const containerRef = useRef(null);

  // Authorization & Meeting Metadata
  const [meetingDetails, setMeetingDetails] = useState(null);
  const [authError, setAuthError] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Device & Permission States
  const [hasPermissions, setHasPermissions] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const [availableDevices, setAvailableDevices] = useState({ videoInputs: [], audioInputs: [], audioOutputs: [] });
  const [selectedVideoDevice, setSelectedVideoDevice] = useState('');
  const [selectedAudioInputDevice, setSelectedAudioInputDevice] = useState('');
  const [selectedAudioOutputDevice, setSelectedAudioOutputDevice] = useState('');
  const [isDeviceMenuOpen, setIsDeviceMenuOpen] = useState(false);

  // Media Controls States
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionState, setConnectionState] = useState('initializing'); // initializing | connecting | waiting_for_peer | connected | disconnected | reconnecting
  const [remotePeerName, setRemotePeerName] = useState('Remote Participant');
  const [remotePeerRole, setRemotePeerRole] = useState('');

  // Call Duration Counter
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);

  // Early ICE Candidates Buffer
  const earlyCandidatesQueue = useRef([]);

  // 1. Authorize Room with Backend (Verify Winner / Seller Only)
  useEffect(() => {
    let isMounted = true;
    const authorizeRoom = async () => {
      try {
        const res = await fetch(`/api/v1/meetings/room-token/${roomId}`, {
          credentials: 'include'
        });
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};

        if (!res.ok) {
          throw new Error(data.error || 'You are not authorized to join this private call.');
        }

        if (isMounted) {
          setMeetingDetails(data.meeting);
          setIsAuthorized(true);
        }
      } catch (err) {
        if (isMounted) {
          setAuthError(err.message);
          setConnectionState('disconnected');
        }
      }
    };

    authorizeRoom();
    return () => {
      isMounted = false;
    };
  }, [roomId]);

  // 2. Call Duration Timer
  useEffect(() => {
    let timer = null;
    if (connectionState === 'connected') {
      timer = setInterval(() => {
        setCallDurationSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [connectionState]);

  const formatDuration = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 3. Enumerate Connected Devices
  const updateDeviceList = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      const audioInputs = devices.filter((d) => d.kind === 'audioinput');
      const audioOutputs = devices.filter((d) => d.kind === 'audiooutput');

      setAvailableDevices({ videoInputs, audioInputs, audioOutputs });

      if (videoInputs.length && !selectedVideoDevice) setSelectedVideoDevice(videoInputs[0].deviceId);
      if (audioInputs.length && !selectedAudioInputDevice) setSelectedAudioInputDevice(audioInputs[0].deviceId);
      if (audioOutputs.length && !selectedAudioOutputDevice) setSelectedAudioOutputDevice(audioOutputs[0].deviceId);
    } catch (err) {
      console.warn('[WebRTC] Device enumeration notice:', err.message);
    }
  };

  // 4. Initialize WebRTC Media and Socket.IO Signaling
  useEffect(() => {
    if (!isAuthorized) return;

    let isMounted = true;
    const socket = io('/', { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    async function initMediaAndConnection() {
      try {
        setConnectionState('initializing');
        setPermissionError('');

        // Request Local Media
        const constraints = {
          video: selectedVideoDevice ? { deviceId: { exact: selectedVideoDevice } } : true,
          audio: selectedAudioInputDevice ? { deviceId: { exact: selectedAudioInputDevice } } : true
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isMounted) return;

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        setHasPermissions(true);
        await updateDeviceList();

        // Setup RTCPeerConnection with Google STUN
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        });
        peerConnectionRef.current = pc;

        // Add Local Tracks to PC
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // Handle Remote Tracks
        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setConnectionState('connected');
          }
        };

        // Handle ICE Candidates generated locally
        pc.onicecandidate = (event) => {
          if (event.candidate && socketRef.current) {
            socketRef.current.emit('webrtc:ice-candidate', {
              roomId,
              candidate: event.candidate
            });
          }
        };

        // Connection State Changes
        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'connected') {
            setConnectionState('connected');
          } else if (pc.connectionState === 'connecting') {
            setConnectionState('connecting');
          } else if (pc.connectionState === 'disconnected') {
            setConnectionState('reconnecting');
          } else if (pc.connectionState === 'failed') {
            setConnectionState('disconnected');
          }
        };

        // Join Authorized Room
        socket.emit('webrtc:join-room', {
          roomId,
          userId: user?.id || 'USR-ANON',
          role: user?.role || 'buyer'
        });

        // Peer Joined: Send Offer if We Are the Initiator
        socket.on('webrtc:peer-joined', async ({ userId, role, userName }) => {
          setRemotePeerName(userName || 'Peer Participant');
          setRemotePeerRole(role);
          setConnectionState('connecting');

          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('webrtc:offer', { roomId, sdp: offer });
          } catch (err) {
            console.error('[WebRTC] Offer creation error:', err);
          }
        });

        // Receive Offer
        socket.on('webrtc:offer', async ({ sdp }) => {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            // Drain any queued candidates
            while (earlyCandidatesQueue.current.length) {
              const cand = earlyCandidatesQueue.current.shift();
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            }

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('webrtc:answer', { roomId, sdp: answer });
          } catch (err) {
            console.error('[WebRTC] Offer handling error:', err);
          }
        });

        // Receive Answer
        socket.on('webrtc:answer', async ({ sdp }) => {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            while (earlyCandidatesQueue.current.length) {
              const cand = earlyCandidatesQueue.current.shift();
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            }
          } catch (err) {
            console.error('[WebRTC] Answer handling error:', err);
          }
        });

        // Receive Remote ICE Candidate
        socket.on('webrtc:ice-candidate', async ({ candidate }) => {
          try {
            if (pc.remoteDescription && pc.remoteDescription.type) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
              earlyCandidatesQueue.current.push(candidate);
            }
          } catch (err) {
            console.warn('[WebRTC] Candidate error:', err.message);
          }
        });

        // Peer Disconnect / Call Ended
        socket.on('webrtc:call-ended', () => {
          setConnectionState('disconnected');
        });

        socket.on('webrtc:peer-left', () => {
          setConnectionState('waiting_for_peer');
        });

        socket.on('webrtc:error', ({ error }) => {
          setAuthError(error);
          setConnectionState('disconnected');
        });

        setConnectionState('waiting_for_peer');
      } catch (err) {
        if (!isMounted) return;
        setPermissionError(
          err.name === 'NotAllowedError'
            ? 'Camera and microphone access was declined. Please permit browser media access in your browser address bar and refresh.'
            : `Media initialization issue: ${err.message}`
        );
        setConnectionState('disconnected');
      }
    }

    initMediaAndConnection();

    return () => {
      isMounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isAuthorized, selectedVideoDevice, selectedAudioInputDevice]);

  // CONTROL 1: Camera on/off
  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
      setIsVideoDisabled(!isVideoDisabled);
    }
  };

  // CONTROL 2: Microphone mute/unmute
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
      setIsAudioMuted(!isAudioMuted);
    }
  };

  // CONTROL 3: Speaker / Audio Output Switcher
  const handleAudioOutputChange = async (deviceId) => {
    setSelectedAudioOutputDevice(deviceId);
    if (remoteVideoRef.current && typeof remoteVideoRef.current.setSinkId === 'function') {
      try {
        await remoteVideoRef.current.setSinkId(deviceId);
      } catch (err) {
        console.warn('[WebRTC] setSinkId notice:', err.message);
      }
    }
  };

  // CONTROL 6: Screen Sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Revert to camera track
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (localStreamRef.current && peerConnectionRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === 'video');
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      }
      setIsScreenSharing(false);
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = displayStream;
        const screenTrack = displayStream.getVideoTracks()[0];

        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        }

        screenTrack.onended = () => {
          toggleScreenShare();
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.warn('[WebRTC] Screen sharing cancelled or denied:', err.message);
      }
    }
  };

  // CONTROL 10: Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // CONTROL 11: Picture in Picture
  const togglePiP = async () => {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture().catch(() => {});
    } else if (remoteVideoRef.current && document.pictureInPictureEnabled) {
      await remoteVideoRef.current.requestPictureInPicture().catch(() => {});
    }
  };

  // CONTROL 12: End Call
  const handleEndCall = () => {
    if (window.confirm('Are you sure you want to conclude this private inspection call?')) {
      if (socketRef.current) {
        socketRef.current.emit('webrtc:end-call', { roomId });
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      navigate('/live-auctions');
    }
  };

  // Unauthorized Screen
  if (authError) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 max-w-lg mx-auto p-4 py-16 flex items-center justify-center">
          <div className="card p-8 bg-white border border-[#E5E5E5] rounded space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-[#B91C1C] flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-[#171717]">Private Meeting Access Restricted</h2>
            <p className="text-xs text-[#666666] leading-relaxed">{authError}</p>
            <div className="pt-2 flex gap-3 justify-center">
              <button onClick={() => navigate('/live-auctions')} className="btn-primary text-xs py-2 px-4">
                Return to Live Auctions
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between" ref={containerRef}>
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* CONTROL 9: Meeting details & CONTROL 15: Return to auction link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
          <div className="space-y-1">
            <Link
              to="/live-auctions"
              className="inline-flex items-center gap-1.5 text-xs text-[#666666] hover:text-[#171717] font-semibold mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Auction Catalogue</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${connectionState === 'connected' ? 'bg-[#15803D]' : 'bg-[#B45309] animate-pulse'}`}></span>
              <h1 className="text-xl font-extrabold text-[#171717]">
                Post-Auction Video Inspection: {meetingDetails?.productTitle || 'Verified Lot'}
              </h1>
            </div>
            <p className="text-xs text-[#666666] font-mono">
              Room: {roomId} • Scheduled: {meetingDetails?.proposedTime ? new Date(meetingDetails.proposedTime).toLocaleString('en-IN') : 'Immediate'}
            </p>
          </div>

          {/* CONTROL 8: Connection Quality / Status & CONTROL 13: Elapsed Call Duration */}
          <div className="flex items-center gap-3">
            {connectionState === 'connected' && (
              <div className="px-3 py-1.5 rounded bg-[#FAFAFA] border border-[#E5E5E5] text-xs font-mono font-bold text-[#171717] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#15803D]" />
                <span>{formatDuration(callDurationSeconds)}</span>
              </div>
            )}

            <span className="px-3 py-1.5 rounded bg-[#FAFAFA] border border-[#E5E5E5] text-xs font-semibold text-[#171717] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#15803D]" />
              <span className="capitalize">
                {connectionState === 'connected'
                  ? 'Connected (Peer-to-Peer)'
                  : connectionState === 'waiting_for_peer'
                  ? 'Awaiting Other Participant'
                  : connectionState === 'connecting'
                  ? 'Establishing Negotiation...'
                  : 'Ready'}
              </span>
            </span>
          </div>
        </div>

        {/* CONTROL 14: Device permission / error panel */}
        {permissionError && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded text-xs text-[#B45309] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold">Media Permission Required</p>
                <p className="mt-0.5">{permissionError}</p>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 bg-[#B45309] text-white rounded font-bold shrink-0 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Permissions</span>
            </button>
          </div>
        )}

        {/* Video Screens Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Main Remote Screen (Larger) */}
          <div className="md:col-span-8 aspect-video bg-[#151515] rounded border border-[#E5E5E5] overflow-hidden relative flex items-center justify-center shadow-sm">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {connectionState !== 'connected' && (
              <div className="text-center p-6 space-y-2 text-white">
                <div className="w-12 h-12 rounded-full bg-[#222222] border border-[#383838] flex items-center justify-center mx-auto text-[#CCCCCC]">
                  <UserCheck className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold">Waiting for the other participant to join...</p>
                <p className="text-[11px] text-[#999999] max-w-sm mx-auto">
                  Only the verified seller and winning bidder with matching cryptographic session tokens may enter this room.
                </p>
              </div>
            )}

            <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/70 backdrop-blur-sm text-white text-xs rounded font-mono flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${connectionState === 'connected' ? 'bg-[#15803D]' : 'bg-amber-500'}`}></span>
              <span>{meetingDetails?.buyerName && meetingDetails?.sellerName ? (user?.role === 'seller' ? `Winner: ${meetingDetails.buyerName}` : `Seller: ${meetingDetails.sellerName}`) : 'Authorized Peer'}</span>
            </div>
          </div>

          {/* Right Column: Local Preview & CONTROL 7: Participants List */}
          <div className="md:col-span-4 space-y-4">
            {/* Local Preview */}
            <div className="aspect-video bg-[#151515] rounded border border-[#E5E5E5] overflow-hidden relative flex items-center justify-center shadow-sm">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {isVideoDisabled && (
                <div className="absolute inset-0 bg-[#151515] flex flex-col items-center justify-center text-[#CCCCCC] text-xs font-semibold gap-1">
                  <VideoOff className="w-6 h-6 text-[#666666]" />
                  <span>Your Camera is Off</span>
                </div>
              )}
              <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-black/70 text-white text-[10px] rounded font-mono">
                You ({user?.name || 'Local Participant'}) {isAudioMuted ? '• Muted' : ''}
              </div>
            </div>

            {/* CONTROL 7: Participants List */}
            <div className="p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#171717] border-b border-[#E5E5E5] pb-2">
                <Users className="w-4 h-4 text-[#171717]" />
                <span>Authorized Participants (2 max)</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#171717]">
                    {meetingDetails?.sellerName || 'Verified Seller'} (Seller)
                  </span>
                  <span className="text-[10px] text-[#15803D] font-bold">Authorized</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#171717]">
                    {meetingDetails?.buyerName || 'Winning Bidder'} (Winner)
                  </span>
                  <span className="text-[10px] text-[#15803D] font-bold">Authorized</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COMPLETE CONTROL TOOLBAR (All 15 Controls Accommodated) */}
        <div className="p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded flex flex-wrap items-center justify-center gap-3">
          {/* CONTROL 1: Camera on/off */}
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

          {/* CONTROL 2: Microphone mute/unmute */}
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

          {/* CONTROL 6: Screen Sharing */}
          <button
            onClick={toggleScreenShare}
            className={`p-3 rounded-full border transition-colors ${
              isScreenSharing
                ? 'bg-[#15803D] text-white border-[#15803D]'
                : 'bg-white text-[#171717] border-[#E5E5E5] hover:bg-[#F5F5F5]'
            }`}
            title={isScreenSharing ? 'Stop screen sharing' : 'Share screen'}
          >
            {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <MonitorUp className="w-4 h-4" />}
          </button>

          {/* CONTROLS 3, 4, 5: Device Selector Toggle */}
          <div className="relative">
            <button
              onClick={() => setIsDeviceMenuOpen(!isDeviceMenuOpen)}
              className="p-3 rounded-full bg-white text-[#171717] border border-[#E5E5E5] hover:bg-[#F5F5F5] transition-colors"
              title="Camera, microphone & speaker settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {isDeviceMenuOpen && (
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-72 bg-white border border-[#E5E5E5] rounded shadow-xl p-4 z-50 space-y-3 text-xs">
                <h4 className="font-bold text-[#171717] border-b border-[#E5E5E5] pb-1">Media Device Settings</h4>

                {/* CONTROL 4: Camera Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-[#666666] mb-1">Camera</label>
                  <select
                    value={selectedVideoDevice}
                    onChange={(e) => setSelectedVideoDevice(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-[#E5E5E5] p-1.5 rounded text-xs"
                  >
                    {availableDevices.videoInputs.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 4)}`}</option>
                    ))}
                  </select>
                </div>

                {/* CONTROL 5: Microphone Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-[#666666] mb-1">Microphone</label>
                  <select
                    value={selectedAudioInputDevice}
                    onChange={(e) => setSelectedAudioInputDevice(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-[#E5E5E5] p-1.5 rounded text-xs"
                  >
                    {availableDevices.audioInputs.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${d.deviceId.slice(0, 4)}`}</option>
                    ))}
                  </select>
                </div>

                {/* CONTROL 3: Speaker Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-[#666666] mb-1">Speaker / Audio Output</label>
                  <select
                    value={selectedAudioOutputDevice}
                    onChange={(e) => handleAudioOutputChange(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-[#E5E5E5] p-1.5 rounded text-xs"
                  >
                    {availableDevices.audioOutputs.length ? (
                      availableDevices.audioOutputs.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>{d.label || `Speaker ${d.deviceId.slice(0, 4)}`}</option>
                      ))
                    ) : (
                      <option value="">Default System Speaker (Browser controlled)</option>
                    )}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* CONTROL 10: Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-full bg-white text-[#171717] border border-[#E5E5E5] hover:bg-[#F5F5F5] transition-colors"
            title={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* CONTROL 11: Picture in Picture */}
          {document.pictureInPictureEnabled && (
            <button
              onClick={togglePiP}
              className="p-3 rounded-full bg-white text-[#171717] border border-[#E5E5E5] hover:bg-[#F5F5F5] transition-colors"
              title="Picture in picture view"
            >
              <PictureInPicture2 className="w-4 h-4" />
            </button>
          )}

          {/* CONTROL 12: End Call */}
          <button
            onClick={handleEndCall}
            className="px-5 py-3 rounded-full bg-[#B91C1C] hover:bg-[#991B1B] text-white font-semibold text-xs flex items-center gap-2"
            title="Conclude call"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Call</span>
          </button>
        </div>

        {/* Privacy Note */}
        <div className="p-3 bg-white border border-[#E5E5E5] rounded text-[11px] text-[#666666] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#15803D] shrink-0" />
          <span>
            This post-auction call is authorized exclusively between the verified seller and the confirmed winning bidder for item inspection.
          </span>
        </div>
      </main>

      <Footer />
    </div>
  );
};
