"use client";

import { useEffect, useRef } from "react";
import { useVideoCall } from "@/context/VideoCallContext";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  FaPhone,
  FaPhoneSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";

export default function VideoCallUI() {
  const {
    videoCallState,
    partnerConnection,
    initiateCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    socketRef,
    user,
  } = useVideoCall();

  // Debug log for partner connection status
  console.log("VideoCallUI - Current state:", {
    partnerSocketId: videoCallState.partnerSocketId,
    socketId: videoCallState.socketId,
    partnerConnection,
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Set up video streams
  useEffect(() => {
    if (videoCallState.localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = videoCallState.localStream;
    }

    if (videoCallState.remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = videoCallState.remoteStream;
    }
  }, [videoCallState.localStream, videoCallState.remoteStream]);

  // Handle call initiation
  const handleStartCall = async () => {
    try {
      await initiateCall();
    } catch (error) {
      console.error("Failed to start call:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Video call container */}
      <div className="flex-1 relative bg-gray-900 rounded-lg overflow-hidden">
        {/* Remote video (full size) */}
        {videoCallState.callAccepted && videoCallState.remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white">
              {videoCallState.isCalling ? (
                <div>
                  <div className="animate-pulse text-2xl mb-4">Calling...</div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <FaPhone className="text-5xl text-primary mx-auto" />
                  </motion.div>
                </div>
              ) : videoCallState.isReceivingCall ? (
                <div>
                  <div className="text-2xl mb-4">
                    {videoCallState.callerName || "Someone"} is calling...
                  </div>
                  <div className="flex space-x-4 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-green-500 text-white p-4 rounded-full"
                      onClick={answerCall}
                    >
                      <FaPhone className="text-2xl" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-red-500 text-white p-4 rounded-full"
                      onClick={rejectCall}
                    >
                      <FaPhoneSlash className="text-2xl" />
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-2xl mb-4">
                    Start a video call with your partner
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-4 rounded-full ${
                      !videoCallState.socketConnected ||
                      (!videoCallState.partnerSocketId &&
                        !videoCallState.isSelfCallMode)
                        ? "bg-gray-500 cursor-not-allowed"
                        : videoCallState.isSelfCallMode
                        ? "bg-blue-500"
                        : "bg-primary"
                    } text-white`}
                    onClick={handleStartCall}
                    disabled={
                      !videoCallState.socketConnected ||
                      (!videoCallState.partnerSocketId &&
                        !videoCallState.isSelfCallMode)
                    }
                    title={
                      !videoCallState.socketConnected
                        ? "Socket not connected"
                        : !videoCallState.partnerSocketId &&
                          !videoCallState.isSelfCallMode
                        ? "Partner not connected"
                        : videoCallState.isSelfCallMode
                        ? "Test call (to yourself)"
                        : "Start call with partner"
                    }
                  >
                    <FaPhone className="text-2xl" />
                  </motion.button>

                  {!videoCallState.socketConnected && (
                    <div className="mt-4 text-sm text-red-400">
                      Socket connection error. Please check your connection and
                      refresh the page.
                    </div>
                  )}

                  {videoCallState.socketConnected &&
                    videoCallState.isSelfCallMode && (
                      <div className="mt-4 text-sm text-blue-400">
                        <strong>Self-Call Testing Mode:</strong> You can call
                        yourself to test the video call functionality. Your
                        partner is not currently online.
                      </div>
                    )}

                  {videoCallState.socketConnected &&
                    !videoCallState.partnerSocketId &&
                    !videoCallState.isSelfCallMode && (
                      <div className="mt-4 text-sm text-yellow-300">
                        Your partner needs to be on the video call page to
                        receive your call.
                      </div>
                    )}

                  {/* Connection status debug info */}
                  <div className="mt-4 text-xs text-gray-400 bg-gray-800 p-2 rounded">
                    <div className="font-bold mb-1">Connection Status:</div>
                    <div
                      className={
                        videoCallState.socketConnected
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      Socket Connection:{" "}
                      {videoCallState.socketConnected
                        ? "Connected"
                        : videoCallState.socketError || "Disconnected"}
                    </div>
                    <div
                      className={
                        videoCallState.socketId
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      Your Socket ID:{" "}
                      {videoCallState.socketId || "Not connected"}
                    </div>
                    <div
                      className={
                        videoCallState.partnerSocketId &&
                        !videoCallState.isSelfCallMode
                          ? "text-green-400"
                          : videoCallState.isSelfCallMode
                          ? "text-blue-400"
                          : "text-red-400"
                      }
                    >
                      Partner Socket ID:{" "}
                      {videoCallState.partnerSocketId
                        ? videoCallState.isSelfCallMode
                          ? `${videoCallState.partnerSocketId} (Self-Call Mode)`
                          : videoCallState.partnerSocketId
                        : "Not connected"}
                    </div>
                    <div
                      className={
                        partnerConnection ? "text-green-400" : "text-red-400"
                      }
                    >
                      Partner Connection:{" "}
                      {partnerConnection ? "Established" : "Not established"}
                    </div>
                    {videoCallState.isSelfCallMode && (
                      <div className="text-blue-400 font-bold">
                        Self-Call Testing Mode: Enabled (Your partner is not
                        online)
                      </div>
                    )}
                    {partnerConnection && (
                      <div>Room ID: {partnerConnection.roomId}</div>
                    )}
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                      >
                        Refresh Page
                      </button>
                      <button
                        onClick={() => {
                          if (partnerConnection && socketRef.current) {
                            // Re-authenticate with the socket server
                            socketRef.current.emit("authenticate", {
                              userId: user?.uid,
                              userEmail: user?.email,
                            });

                            // Re-emit the connectToPartner event
                            socketRef.current.emit("connectToPartner", {
                              userId: user?.uid,
                              partnerId: partnerConnection.partnerId,
                              roomId: partnerConnection.roomId,
                            });

                            toast.success("Reconnecting to partner...");
                          }
                        }}
                        className="bg-purple-500 text-white px-2 py-1 rounded text-xs"
                        disabled={!partnerConnection || !socketRef.current}
                      >
                        Reconnect to Partner
                      </button>
                      <button
                        onClick={() => {
                          if (socketRef.current) {
                            // Enable self-call testing mode
                            setVideoCallState((prev) => ({
                              ...prev,
                              partnerSocketId: prev.socketId,
                              isSelfCallMode: true,
                            }));
                            toast.success("Self-call testing mode enabled");
                          }
                        }}
                        className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                        disabled={!socketRef.current}
                      >
                        Enable Self-Call
                      </button>
                      <a
                        href="http://localhost:5000"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 text-white px-2 py-1 rounded text-xs"
                      >
                        Check Server
                      </a>
                    </div>
                  </div>

                  {videoCallState.callError && (
                    <div className="mt-4 text-sm text-red-400">
                      {videoCallState.callError}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Local video (picture-in-picture) */}
        {videoCallState.localStream && (
          <div className="absolute bottom-4 right-4 w-1/4 h-1/4 rounded-lg overflow-hidden border-2 border-white shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Call controls */}
      {(videoCallState.isCallActive || videoCallState.callAccepted) && (
        <div className="mt-4 flex justify-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-4 rounded-full ${
              videoCallState.isMuted ? "bg-red-500" : "bg-gray-700"
            } text-white`}
            onClick={toggleMute}
          >
            {videoCallState.isMuted ? (
              <FaMicrophoneSlash className="text-xl" />
            ) : (
              <FaMicrophone className="text-xl" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-red-500 text-white p-4 rounded-full"
            onClick={endCall}
          >
            <FaPhoneSlash className="text-xl" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-4 rounded-full ${
              videoCallState.isVideoOff ? "bg-red-500" : "bg-gray-700"
            } text-white`}
            onClick={toggleVideo}
          >
            {videoCallState.isVideoOff ? (
              <FaVideoSlash className="text-xl" />
            ) : (
              <FaVideo className="text-xl" />
            )}
          </motion.button>
        </div>
      )}
    </div>
  );
}
