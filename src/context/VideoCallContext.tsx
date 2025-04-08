'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

// Define the context type
interface VideoCallContextType {
  isInCall: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  roomId: string | null;
  isMuted: boolean;
  isVideoOff: boolean;
  isCallConnected: boolean;
  isCallEnded: boolean;
  startCall: () => Promise<string>;
  joinCall: (roomId: string) => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  copyRoomLink: () => void;
}

// Create the context
const VideoCallContext = createContext<VideoCallContextType | undefined>(undefined);

// Socket.io client
let socket: any = null;

// Provider component
export function VideoCallProvider({ children }: { children: ReactNode }) {
  const [isInCall, setIsInCall] = useState<boolean>(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
  const [isCallConnected, setIsCallConnected] = useState<boolean>(false);
  const [isCallEnded, setIsCallEnded] = useState<boolean>(false);
  const [peer, setPeer] = useState<RTCPeerConnection | null>(null);

  const { user } = useAuth();
  const router = useRouter();

  // Initialize socket connection
  useEffect(() => {
    if (!socket) {
      // Initialize socket connection
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || window.location.origin;
      socket = io(socketUrl, {
        path: '/api/socket',
      });

      socket.on('connect', () => {
        console.log('Connected to Socket.IO server');
      });

      socket.on('connect_error', (err: Error) => {
        console.error('Socket connection error:', err);
        toast.error('Failed to connect to call server');
      });
    }

    // Cleanup on unmount
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream]);

  // Handle call signaling
  useEffect(() => {
    if (!socket || !user) return;

    // Handle when another user connects to the room
    socket.on('user-connected', async (userId: string) => {
      console.log('User connected to room:', userId);
      toast.success('Your partner has joined the call');
      setIsCallConnected(true);

      // Initialize peer connection when another user joins
      if (localStream) {
        initializePeerConnection();
      }
    });

    // Handle when a user disconnects from the room
    socket.on('user-disconnected', (userId: string) => {
      console.log('User disconnected from room:', userId);
      toast.error('Your partner has left the call');
      setIsCallConnected(false);
      cleanupPeerConnection();
    });

    // Handle receiving an offer
    socket.on('offer', async (offer: RTCSessionDescriptionInit, userId: string) => {
      console.log('Received offer from:', userId);
      try {
        // Clean up any existing peer connection
        if (peer) {
          peer.close();
        }

        // Create a new peer connection
        const newPeer = await createPeerConnection();
        setPeer(newPeer);

        // Add local tracks to the peer connection if we have a local stream
        if (localStream) {
          localStream.getTracks().forEach(track => {
            newPeer.addTrack(track, localStream);
          });
        }

        // Set the remote description (the offer)
        await newPeer.setRemoteDescription(new RTCSessionDescription(offer));

        // Create an answer
        const answer = await newPeer.createAnswer();
        await newPeer.setLocalDescription(answer);

        // Send answer back
        socket.emit('answer', roomId, answer, user.uid);
        console.log('Answer sent to:', userId);
      } catch (error) {
        console.error('Error handling offer:', error);
        toast.error('Failed to establish connection');
      }
    });

    // Handle receiving an answer
    socket.on('answer', async (answer: RTCSessionDescriptionInit, userId: string) => {
      console.log('Received answer from:', userId);
      if (peer) {
        try {
          await peer.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (error) {
          console.error('Error handling answer:', error);
          toast.error('Failed to establish connection');
        }
      }
    });

    // Handle receiving ICE candidates
    socket.on('ice-candidate', async (candidate: RTCIceCandidateInit, userId: string) => {
      console.log('Received ICE candidate from:', userId);
      if (peer) {
        try {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      }
    });

    // Handle call ended by the other user
    socket.on('call-ended', (userId: string) => {
      console.log('Call ended by:', userId);
      toast.success('Call ended by your partner');
      handleEndCall();
    });

    // Cleanup event listeners on unmount
    return () => {
      socket?.off('user-connected');
      socket?.off('user-disconnected');
      socket?.off('offer');
      socket?.off('answer');
      socket?.off('ice-candidate');
      socket?.off('call-ended');
    };
  }, [user, roomId, peer, localStream]);

  // Initialize peer connection
  const initializePeerConnection = async () => {
    if (!user || !localStream || !socket) return;

    try {
      const newPeer = await createPeerConnection();
      setPeer(newPeer);

      // Add local tracks to the peer connection
      localStream.getTracks().forEach(track => {
        newPeer.addTrack(track, localStream);
      });

      // Create and send offer
      const offer = await newPeer.createOffer();
      await newPeer.setLocalDescription(offer);

      // Send offer to remote peer
      socket.emit('offer', roomId, offer, user.uid);
    } catch (error) {
      console.error('Error initializing peer connection:', error);
      toast.error('Failed to establish connection');
    }
  };

  // Create a new RTCPeerConnection
  const createPeerConnection = async () => {
    const newPeer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    // Handle ICE candidates
    newPeer.onicecandidate = (event) => {
      if (event.candidate && socket && user) {
        socket.emit('ice-candidate', roomId, event.candidate, user.uid);
      }
    };

    // Handle connection state changes
    newPeer.onconnectionstatechange = () => {
      console.log('Connection state:', newPeer.connectionState);
      if (newPeer.connectionState === 'connected') {
        setIsCallConnected(true);
        toast.success('Call connected successfully');
      } else if (newPeer.connectionState === 'disconnected' ||
                 newPeer.connectionState === 'failed' ||
                 newPeer.connectionState === 'closed') {
        setIsCallConnected(false);
      }
    };

    // Handle receiving remote tracks
    newPeer.ontrack = (event) => {
      console.log('Received remote track');
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    return newPeer;
  };

  // Cleanup peer connection
  const cleanupPeerConnection = () => {
    if (peer) {
      peer.close();
      setPeer(null);
    }
    setRemoteStream(null);
  };

  // Start a new call
  const startCall = async (): Promise<string> => {
    if (!user) {
      toast.error('You must be logged in to start a call');
      throw new Error('User not authenticated');
    }

    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      setLocalStream(stream);

      // Generate a unique room ID
      const newRoomId = uuidv4();
      setRoomId(newRoomId);
      setIsInCall(true);
      setIsCallEnded(false);

      // Join the room
      if (socket) {
        socket.emit('join-room', newRoomId, user.uid);
      }

      // Navigate to the call page
      router.push(`/video-call/${newRoomId}`);

      return newRoomId;
    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('Failed to access camera and microphone');
      throw error;
    }
  };

  // Join an existing call
  const joinCall = async (callRoomId: string): Promise<void> => {
    if (!user) {
      toast.error('You must be logged in to join a call');
      throw new Error('User not authenticated');
    }

    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      setLocalStream(stream);
      setRoomId(callRoomId);
      setIsInCall(true);
      setIsCallEnded(false);

      // Join the room
      if (socket) {
        socket.emit('join-room', callRoomId, user.uid);
      }
    } catch (error) {
      console.error('Error joining call:', error);
      toast.error('Failed to access camera and microphone');
      throw error;
    }
  };

  // End the current call
  const endCall = () => {
    if (socket && roomId && user) {
      socket.emit('end-call', roomId, user.uid);
    }
    handleEndCall();
  };

  // Handle ending the call
  const handleEndCall = () => {
    // Stop all tracks in the local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    // Clean up peer connection
    cleanupPeerConnection();

    // Reset state
    setLocalStream(null);
    setRemoteStream(null);
    setIsInCall(false);
    setIsCallConnected(false);
    setIsCallEnded(true);
    setRoomId(null);

    // Navigate back to home page
    router.push('/');
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  // Copy room link to clipboard
  const copyRoomLink = () => {
    if (roomId) {
      const url = `${window.location.origin}/video-call/${roomId}`;
      navigator.clipboard.writeText(url)
        .then(() => {
          toast.success('Call link copied to clipboard');
        })
        .catch((err) => {
          console.error('Failed to copy link:', err);
          toast.error('Failed to copy link');
        });
    }
  };

  // Context value
  const value = {
    isInCall,
    localStream,
    remoteStream,
    roomId,
    isMuted,
    isVideoOff,
    isCallConnected,
    isCallEnded,
    startCall,
    joinCall,
    endCall,
    toggleMute,
    toggleVideo,
    copyRoomLink,
  };

  return (
    <VideoCallContext.Provider value={value}>
      {children}
    </VideoCallContext.Provider>
  );
}

// Custom hook to use the video call context
export function useVideoCall() {
  const context = useContext(VideoCallContext);
  if (context === undefined) {
    throw new Error('useVideoCall must be used within a VideoCallProvider');
  }
  return context;
}
