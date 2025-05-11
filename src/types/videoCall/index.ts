// Video Call Types
import React from "react";

// Partner invitation types
export interface PartnerInvitation {
  id: string;
  senderId: string;
  senderEmail: string;
  senderName: string | null;
  recipientEmail: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

// Partner connection types
export interface PartnerConnection {
  id: string;
  userId: string;
  partnerId: string;
  partnerEmail: string;
  partnerName: string | null;
  roomId: string;
  createdAt: Date;
}

// Room user type for socket.io rooms
export interface RoomUser {
  userId: string;
  socketId: string;
}

// Video call state types
export interface VideoCallState {
  isCallActive: boolean;
  isCalling: boolean;
  isReceivingCall: boolean;
  callerId: string | null;
  callerName: string | null;
  callAccepted: boolean;
  callRejected: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callError: string | null;
  socketId: string | null;
  partnerSocketId: string | null;
  isMuted: boolean;
  isVideoOff: boolean;
  socketConnected: boolean;
  socketError: string | null;
  isSelfCallMode: boolean;
}

// Signal data type for WebRTC
export interface SignalData {
  type?: string;
  sdp?: string;
  candidate?: RTCIceCandidate;
}

// Socket event types
export interface CallUserData {
  userToCall: string;
  signalData: SignalData;
  from: string;
  name: string;
}

export interface AnswerCallData {
  signal: SignalData;
  to: string;
}

// Video call context types
export interface VideoCallContextType {
  // State
  videoCallState: VideoCallState;
  partnerConnection: PartnerConnection | null;
  socketRef: React.MutableRefObject<any>;
  user: any;
  setVideoCallState: React.Dispatch<React.SetStateAction<VideoCallState>>;

  // Partner invitation actions
  sendPartnerInvitation: (recipientEmail: string) => Promise<void>;
  acceptPartnerInvitation: (invitationId: string) => Promise<void>;
  rejectPartnerInvitation: (invitationId: string) => Promise<void>;
  getReceivedInvitations: () => Promise<PartnerInvitation[]>;
  getSentInvitations: () => Promise<PartnerInvitation[]>;

  // Call actions
  initiateCall: () => Promise<void>;
  answerCall: () => void;
  rejectCall: () => void;
  endCall: () => void;

  // Media controls
  toggleMute: () => void;
  toggleVideo: () => void;
}
