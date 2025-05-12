"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import { Socket } from "socket.io-client";
import io from "socket.io-client";
import Peer from "simple-peer";
import { toast } from "react-hot-toast";
import {
  VideoCallContextType,
  VideoCallState,
  PartnerConnection,
  PartnerInvitation,
  SignalData,
} from "@/types/videoCall";
import {
  sendPartnerInvitation as sendInvitation,
  getReceivedInvitations as getReceived,
  getSentInvitations as getSent,
  acceptPartnerInvitation as acceptInvitation,
  rejectPartnerInvitation as rejectInvitation,
  getPartnerConnection as getConnection,
} from "@/services/partnerService";

// Create context
const VideoCallContext = createContext<VideoCallContextType | undefined>(
  undefined
);

// Initial state
const initialVideoCallState: VideoCallState = {
  isCallActive: false,
  isCalling: false,
  isReceivingCall: false,
  callerId: null,
  callerName: null,
  callAccepted: false,
  callRejected: false,
  localStream: null,
  remoteStream: null,
  callError: null,
  socketId: null,
  partnerSocketId: null,
  isMuted: false,
  isVideoOff: false,
  socketConnected: false,
  socketError: null,
  isSelfCallMode: false,
};

// Provider component
export function VideoCallProvider({ children }: { children: ReactNode }) {
  // State
  const [videoCallState, setVideoCallState] = useState<VideoCallState>(
    initialVideoCallState
  );
  const [partnerConnection, setPartnerConnection] =
    useState<PartnerConnection | null>(null);

  // Refs
  const socketRef = useRef<typeof Socket | null>(null);
  const peerRef = useRef<any>(null);
  // const localVideoRef = useRef<HTMLVideoElement | null>(null);
  // const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Get user from auth context
  const { user } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    // Use the environment variable or fallback to localhost for development
    const socketServerUrl ='https://video-call-server-se8m.onrender.com';
    console.log("Connecting to socket server at:", socketServerUrl);

    // Connect to socket server with explicit CORS settings
    try {
      // Close any existing connection first
      if (socketRef.current) {
        console.log("Closing existing socket connection");
        socketRef.current.disconnect();
      }

      socketRef.current = io(socketServerUrl, {
        auth: {
          token: user.uid
        },
        transports: ["websocket", "polling"],
        transportOptions: {
          polling: {
            extraHeaders: {
              "my-custom-header": "abcd",
            },
          },
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      // Handle connection events
      socketRef.current.on("connect", () => {
        console.log("Socket connected successfully");
        setVideoCallState((prev) => ({
          ...prev,
          socketConnected: true,
          socketError: null,
        }));

        // Authenticate with socket server immediately after connection
        if (user) {
          console.log(
            "Authenticating with socket server:",
            user.uid,
            user.email
          );
          socketRef.current?.emit("authenticate", {
            userId: user.uid,
            userEmail: user.email,
          });
        }
      });

      socketRef.current.on("connect_error", (err: any) => {
        console.error("Socket connection error:", err);
        setVideoCallState((prev) => ({
          ...prev,
          socketConnected: false,
          socketError: `Connection error: ${err.message}`,
        }));
      });

      socketRef.current.on("reconnect_attempt", (attemptNumber: number) => {
        console.log(`Socket reconnection attempt #${attemptNumber}`);
      });

      socketRef.current.on("reconnect", () => {
        console.log("Socket reconnected successfully");
        setVideoCallState((prev) => ({
          ...prev,
          socketConnected: true,
          socketError: null,
        }));

        // Re-authenticate after reconnection
        if (user) {
          console.log("Re-authenticating after reconnection");
          socketRef.current?.emit("authenticate", {
            userId: user.uid,
            userEmail: user.email,
          });
        }
      });

      // Handle user online events
      socketRef.current.on(
        "userOnline",
        (data: { userId: string; socketId: string }) => {
          console.log("User online:", data);

          // If this is our partner, update the partner socket ID
          if (
            partnerConnection &&
            data.userId === partnerConnection.partnerId
          ) {
            console.log("Partner is online:", data);
            setVideoCallState((prev) => ({
              ...prev,
              partnerSocketId: data.socketId,
              isSelfCallMode: false,
            }));

            // Notify the user
            toast.success("Your partner is now online!");
          }
        }
      );

      // Handle user offline events
      socketRef.current.on(
        "userOffline",
        (data: { userId: string; socketId: string }) => {
          console.log("User offline:", data);

          // If this is our partner, clear the partner socket ID
          if (
            partnerConnection &&
            data.userId === partnerConnection.partnerId
          ) {
            console.log("Partner went offline:", data);
            setVideoCallState((prev) => ({
              ...prev,
              partnerSocketId: prev.socketId, // Set to self for testing mode
              isSelfCallMode: true,
            }));

            // Notify the user
            toast.error("Your partner went offline. Self-call mode enabled.");
          }
        }
      );
    } catch (error) {
      console.error("Error creating socket connection:", error);
      setVideoCallState((prev) => ({
        ...prev,
        socketConnected: false,
        socketError: `Connection error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      }));
    }
    if(socketRef.current) {
    // Set up socket event listeners
    socketRef.current.on("me", (socketId: string) => {
      console.log("Received socket ID:", socketId);
      setVideoCallState((prev) => ({
        ...prev,
        socketId,
        socketConnected: true,
      }));

      // Authenticate with socket server
      socketRef.current?.emit("authenticate", {
        userId: user.uid,
        userEmail: user.email,
      });
    });

    // Listen for partner connection events
    socketRef.current.on(
      "partnerConnected",
      (data: { socketId: string; userId: string }) => {
        console.log("Partner connected:", data);
        console.log("Current socket ID:", videoCallState.socketId);
        console.log("Current partner connection:", partnerConnection);

        // Set partner socket ID in state
        setVideoCallState((prev) => {
          console.log(
            "Updating partnerSocketId from",
            prev.partnerSocketId,
            "to",
            data.socketId
          );
          return {
            ...prev,
            partnerSocketId: data.socketId,
            isSelfCallMode: false,
          };
        });

        // Notify the user
        toast.success("Partner connected successfully!");
      }
    );

    socketRef.current.on(
      "callUser",
      (data: { signal: SignalData; from: string; name: string }) => {
        console.log("Received call from:", data.from, "name:", data.name);
        console.log("Received signal data:", data.signal);

        // Store the signal data for later use BEFORE updating state
        // This ensures the signal is available when the user clicks answer
        peerRef.current = {
          ...peerRef.current,
          incomingSignal: data.signal,
        };

        console.log("Updated peerRef with incoming signal:", peerRef.current);

        // Now update the state to show incoming call UI
        setVideoCallState((prev) => ({
          ...prev,
          isReceivingCall: true,
          callerId: data.from,
          callerName: data.name,
        }));

        // Notify the user
        toast.success(`Incoming call from ${data.name || "your partner"}`);

        // Pre-fetch media to speed up answer process
        if (!videoCallState.localStream) {
          console.log("Pre-fetching media for faster call answering");
          navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
              console.log("Pre-fetched media successfully");
              setVideoCallState((prev) => ({
                ...prev,
                localStream: stream,
              }));
            })
            .catch((err) => {
              console.error("Failed to pre-fetch media:", err);
              // Don't show error yet, will show when user tries to answer
            });
        }
      }
    );

    socketRef.current.on("callAccepted", (signal: SignalData) => {
      console.log("Call accepted, received signal:", signal);
      setVideoCallState((prev) => ({
        ...prev,
        callAccepted: true,
        isCalling: false,
      }));

      // Signal the peer connection
      if (peerRef.current?.peer) {
        console.log("Signaling peer with accepted call data");
        peerRef.current.peer.signal(signal);
      } else {
        console.error("Peer reference not found when call was accepted");
      }

      // Notify the user
      toast.success("Call connected!");
    });

    socketRef.current.on("callRejected", () => {
      console.log("Call rejected");
      setVideoCallState((prev) => ({
        ...prev,
        callRejected: true,
        isCalling: false,
      }));

      // Clean up
      endCall();

      // Notify the user
      toast.error("Call was rejected");
    });

    socketRef.current.on("callEnded", () => {
      console.log("Call ended by remote user");
      endCall();

      // Notify the user
      toast.success("Call ended");
    });

    // Handle partner disconnection
    socketRef.current.on(
      "partnerDisconnected",
      (data: { socketId: string; userId?: string }) => {
        console.log("Partner disconnected:", data);

        // If this is our partner's socket ID, clear it
        if (data.socketId === videoCallState.partnerSocketId) {
          console.log("Clearing partner socket ID");
          setVideoCallState((prev) => ({
            ...prev,
            partnerSocketId: prev.socketId, // Set to self for testing mode
            isSelfCallMode: true,
          }));

          // Notify the user
          toast.error("Partner disconnected. Self-call mode enabled.");
        }
      }
    );
  }

    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        // Remove all event listeners
        socketRef.current.off("me");
        socketRef.current.off("partnerConnected");
        socketRef.current.off("partnerDisconnected");
        socketRef.current.off("callUser");
        socketRef.current.off("callAccepted");
        socketRef.current.off("callRejected");
        socketRef.current.off("callEnded");
        socketRef.current.off("connect");
        socketRef.current.off("connect_error");
        socketRef.current.off("reconnect");
        socketRef.current.off("reconnect_attempt");
        socketRef.current.off("userOnline");
        socketRef.current.off("userOffline");

        // Disconnect socket
        socketRef.current.disconnect();
      }

      // Stop media streams
      if (videoCallState.localStream) {
        videoCallState.localStream.getTracks().forEach((track) => {
          track.stop();
        });
      }

      console.log("VideoCallContext cleanup complete");
    };
  }, [user]);

  // Fetch partner connection
  useEffect(() => {
    if (!user || !videoCallState.socketConnected || !videoCallState.socketId)
      return;

    // Add a small delay to ensure socket is fully connected
    const connectionTimeout = setTimeout(() => {
      const fetchPartnerConnection = async () => {
        try {
          console.log("Fetching partner connection for user:", user.uid);
          const connection = await getConnection(user.uid);
          console.log("Fetched partner connection:", connection);
          setPartnerConnection(connection);

          if (connection) {
            console.log(
              "Partner connection established, setting up for video call"
            );

            // Register for partner connections
            if (socketRef.current && socketRef.current.connected) {
              console.log(
                "Socket is connected, setting up partner event listeners"
              );

              // Set up partner connection event listeners
              // Listen for partner found event
              socketRef.current.on(
                "partnerFound",
                (data: { partnerId: string; partnerSocketId: string }) => {
                  console.log("Partner found:", data);
                  setVideoCallState((prev) => ({
                    ...prev,
                    partnerSocketId: data.partnerSocketId,
                    isSelfCallMode: false,
                  }));

                  toast.success("Partner connected!");
                }
              );

              // Listen for partner not found event
              socketRef.current.on(
                "partnerNotFound",
                (data: { partnerId: string }) => {
                  console.log("Partner not found:", data);
                  // Enable self-call testing mode
                  setVideoCallState((prev) => ({
                    ...prev,
                    partnerSocketId: prev.socketId,
                    isSelfCallMode: true,
                  }));

                  toast.success(
                    "Partner is not online. Self-call testing mode enabled."
                  );
                }
              );

              // Listen for partner disconnected event
              socketRef.current.on(
                "partnerDisconnected",
                (data: { partnerId: string; socketId: string }) => {
                  console.log("Partner disconnected:", data);
                  if (data.partnerId === connection.partnerId) {
                    // Enable self-call testing mode when partner disconnects
                    setVideoCallState((prev) => ({
                      ...prev,
                      partnerSocketId: prev.socketId,
                      isSelfCallMode: true,
                    }));

                    toast.success(
                      "Partner disconnected. Self-call testing mode enabled."
                    );
                  }
                }
              );

              // Connect directly to partner
              console.log("Connecting to partner:", connection.partnerId);
              socketRef.current.emit("connectToPartner", {
                userId: user.uid,
                partnerId: connection.partnerId,
                roomId: connection.roomId,
              });

              // Add a retry mechanism if partner is not found initially
              const retryTimeout = setTimeout(() => {
                if (
                  !videoCallState.partnerSocketId ||
                  videoCallState.isSelfCallMode
                ) {
                  console.log("Retrying partner connection...");
                  socketRef.current?.emit("connectToPartner", {
                    userId: user.uid,
                    partnerId: connection.partnerId,
                    roomId: connection.roomId,
                  });
                }
              }, 3000);

              // Clear the retry timeout on cleanup
              return () => clearTimeout(retryTimeout);
            } else {
              console.error(
                "Socket not connected when trying to set up partner connection"
              );
              toast.error("Socket connection issue. Please refresh the page.");

              // Enable self-call testing mode
              setVideoCallState((prev) => ({
                ...prev,
                partnerSocketId: prev.socketId,
                isSelfCallMode: true,
              }));
            }
          } else {
            console.log("No partner connection found");
            // Enable self-call testing mode
            setVideoCallState((prev) => ({
              ...prev,
              partnerSocketId: prev.socketId,
              isSelfCallMode: true,
            }));

            toast.success(
              "No partner connection found. Self-call testing mode enabled."
            );
          }
        } catch (error) {
          console.error("Error fetching partner connection:", error);
          // Enable self-call testing mode on error
          setVideoCallState((prev) => ({
            ...prev,
            partnerSocketId: prev.socketId,
            isSelfCallMode: true,
          }));

          toast.error(
            "Error connecting to partner. Self-call testing mode enabled."
          );
        }
      };

      fetchPartnerConnection();
    }, 1000); // 1 second delay to ensure socket is ready

    // Clean up event listeners and timeouts
    return () => {
      clearTimeout(connectionTimeout);

      if (socketRef.current) {
        socketRef.current.off("partnerFound");
        socketRef.current.off("partnerNotFound");
        socketRef.current.off("partnerDisconnected");
      }
    };
  }, [user, videoCallState.socketId, videoCallState.socketConnected]);

  // Partner invitation actions
  const sendPartnerInvitation = async (
    recipientEmail: string
  ): Promise<void> => {
    if (!user) throw new Error("User not authenticated");

    await sendInvitation(
      user.uid,
      user.email || "",
      user.displayName,
      recipientEmail
    );
  };

  const getReceivedInvitations = async (): Promise<PartnerInvitation[]> => {
    if (!user) return [];

    return await getReceived(user.email || "");
  };

  const getSentInvitations = async (): Promise<PartnerInvitation[]> => {
    if (!user) return [];

    return await getSent(user.uid);
  };

  const acceptPartnerInvitation = async (
    invitationId: string
  ): Promise<void> => {
    if (!user) throw new Error("User not authenticated");

    await acceptInvitation(
      invitationId,
      user.uid,
      user.email || "",
      user.displayName
    );

    // Refresh partner connection
    const connection = await getConnection(user.uid);
    setPartnerConnection(connection);

    // Connect to the room if we have a socket
    if (connection && socketRef.current && videoCallState.socketId) {
      socketRef.current.emit("connectToPartner", {
        userId: user.uid,
        partnerId: connection.partnerId,
        roomId: connection.roomId,
      });
    }
  };

  const rejectPartnerInvitation = async (
    invitationId: string
  ): Promise<void> => {
    await rejectInvitation(invitationId);
  };

  // Call actions
  const initiateCall = async (): Promise<void> => {
    if (!videoCallState.socketId) {
      console.error("Your socket ID not found");
      toast.error("You are not connected to the socket server");
      throw new Error("You are not connected to the socket server");
    }

    if (!videoCallState.partnerSocketId && !videoCallState.isSelfCallMode) {
      console.error("Partner socket ID not found");
      toast.error(
        "Partner is not online. They need to be on the video call page to receive your call."
      );
      throw new Error(
        "Partner is not online. They need to be on the video call page to receive your call."
      );
    }

    try {
      console.log("Initiating call to:", videoCallState.partnerSocketId);
      toast.success("Initiating call...");

      // Get user media with error handling
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch (mediaError) {
        console.error("Media access error:", mediaError);
        toast.error(
          "Could not access camera or microphone. Please check your device permissions."
        );
        setVideoCallState((prev) => ({
          ...prev,
          callError:
            "Failed to access camera or microphone. Please check your device permissions.",
          isCalling: false,
        }));
        return;
      }

      // Set local stream
      setVideoCallState((prev) => ({
        ...prev,
        localStream: stream,
        isCalling: true,
      }));

      // Create peer connection with ICE server configuration for better connectivity
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
            { urls: "stun:stun3.l.google.com:19302" },
            { urls: "stun:stun4.l.google.com:19302" },
          ],
        },
      });

      // Handle peer events
      peer.on("signal", (data: SignalData) => {
        console.log("Signaling to partner:", {
          userToCall: videoCallState.partnerSocketId,
          from: videoCallState.socketId,
          name: user?.displayName || "Partner",
        });

        // Send signal to partner
        if (socketRef.current?.connected) {
          socketRef.current.emit("callUser", {
            userToCall: videoCallState.partnerSocketId,
            signalData: data,
            from: videoCallState.socketId,
            name: user?.displayName || "Partner",
          });
        } else {
          console.error("Socket not connected when trying to call user");
          toast.error("Connection to server lost. Please refresh the page.");

          // Clean up
          stream.getTracks().forEach((track) => track.stop());
          setVideoCallState((prev) => ({
            ...prev,
            localStream: null,
            isCalling: false,
            callError: "Connection to server lost. Please refresh the page.",
          }));
        }
      });

      peer.on("stream", (remoteStream: MediaStream) => {
        console.log("Received remote stream");
        setVideoCallState((prev) => ({
          ...prev,
          remoteStream,
          isCallActive: true,
        }));
        toast.success("Call connected!");
      });

      peer.on("error", (err) => {
        console.error("Peer connection error:", err);
        toast.error("Connection error: " + err.message);
        setVideoCallState((prev) => ({
          ...prev,
          callError: "Connection error: " + err.message,
          isCalling: false,
        }));
      });

      // Add connection state change handler
      peer.on("connect", () => {
        console.log("Peer connection established");
        toast.success("Peer connection established");
      });

      peer.on("close", () => {
        console.log("Peer connection closed");
        // Only show toast if call was active
        if (videoCallState.isCallActive) {
          toast.success("Call ended");
        }
      });

      // Store peer connection
      peerRef.current = {
        ...peerRef.current,
        peer,
      };

      // For testing: If we're in self-call mode, simulate receiving a call
      if (videoCallState.isSelfCallMode) {
        console.log("Self-call detected, simulating incoming call");
        toast.success(
          "Self-call mode: You will receive a call from yourself in a moment"
        );

        // Capture signal data for self-call
        let selfSignalData: SignalData | null = null;

        // Use a one-time signal handler to avoid duplicate events
        const handleSignal = (signalData: SignalData) => {
          console.log("Got signal data for self-call:", signalData);

          // Only process once
          if (!selfSignalData) {
            selfSignalData = signalData;

            // Remove the handler to prevent multiple calls
            peer.off("signal", handleSignal);

            console.log("Simulating incoming call with signal data");

            // Simulate receiving a call after a short delay
            setTimeout(() => {
              console.log("Creating self-call now");

              // Store the signal data for later use BEFORE updating state
              peerRef.current = {
                ...peerRef.current,
                incomingSignal: selfSignalData,
                selfCallMode: true,
              };

              console.log("Updated peerRef for self-call:", peerRef.current);

              // Simulate receiving a call
              setVideoCallState((prev) => ({
                ...prev,
                isReceivingCall: true,
                callerId: prev.socketId,
                callerName: user?.displayName || "You (Self-Call Mode)",
              }));

              toast.success("Incoming call from yourself (Self-Call Mode)");
            }, 1000);
          }
        };

        // Add the signal handler
        peer.on("signal", handleSignal);
      }

      // Set a timeout to handle call not being answered
      const callTimeoutId = setTimeout(() => {
        if (videoCallState.isCalling && !videoCallState.callAccepted) {
          console.log("Call not answered within timeout period");
          toast.error("Call not answered. Please try again later.");

          // Clean up
          if (peer) {
            peer.destroy();
          }

          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
          }

          setVideoCallState((prev) => ({
            ...prev,
            isCalling: false,
            localStream: null,
            callError: "Call not answered. Please try again later.",
          }));
        }
      }, 30000); // 30 seconds timeout

      // Store the timeout ID for cleanup
      peerRef.current = {
        ...peerRef.current,
        callTimeoutId,
      };
    } catch (error) {
      console.error("Error initiating call:", error);
      toast.error(
        "Failed to start call: " +
          (error instanceof Error ? error.message : String(error))
      );
      setVideoCallState((prev) => ({
        ...prev,
        callError:
          "Failed to start call: " +
          (error instanceof Error ? error.message : String(error)),
        isCalling: false,
      }));
    }
  };

  const answerCall = (): void => {
    console.log("Answer call function called");
    console.log("Current state:", {
      localStream: !!videoCallState.localStream,
      incomingSignal: !!peerRef.current?.incomingSignal,
      callerId: videoCallState.callerId,
      isReceivingCall: videoCallState.isReceivingCall,
      peerRef: peerRef.current,
    });

    if (!videoCallState.localStream || !peerRef.current?.incomingSignal) {
      console.log("Missing required data for answering call");

      // Try to get user media if not already available
      if (!videoCallState.localStream) {
        console.log("No local stream, requesting media access");
        toast.success("Accessing camera and microphone...");

        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
            console.log("Successfully accessed media devices");
            setVideoCallState((prev) => ({
              ...prev,
              localStream: stream,
            }));

            // Call answerCall again after getting the stream
            toast.success("Media access granted, connecting call...");
            console.log("Will retry answerCall in 500ms");
            setTimeout(() => {
              console.log("Retrying answerCall after getting media");
              answerCall();
            }, 500);
          })
          .catch((error) => {
            console.error("Error accessing media devices:", error);
            setVideoCallState((prev) => ({
              ...prev,
              callError:
                "Failed to access camera or microphone. Please check your device permissions.",
              isReceivingCall: false,
            }));
            toast.error(
              "Could not access camera or microphone. Please check your device permissions."
            );

            // Reject the call since we can't answer it
            if (videoCallState.callerId) {
              console.log("Rejecting call due to media access error");
              socketRef.current?.emit("rejectCall", {
                to: videoCallState.callerId,
              });
            }
          });
      } else if (!peerRef.current?.incomingSignal) {
        console.error("No incoming signal found in peerRef:", peerRef.current);
        toast.error("Call connection data not found. Please try again.");
        setVideoCallState((prev) => ({
          ...prev,
          callError: "Call connection data not found",
          isReceivingCall: false,
        }));
      }
      return;
    }

    console.log("Answering call from:", videoCallState.callerId);
    toast.success("Answering call...");

    setVideoCallState((prev) => ({
      ...prev,
      callAccepted: true,
      isReceivingCall: false,
      isCallActive: true,
    }));

    // Create peer connection with ICE server configuration for better connectivity
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: videoCallState.localStream,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:19302" },
        ],
      },
    });

    // Handle peer events
    peer.on("signal", (data: SignalData) => {
      console.log("Sending answer signal to:", videoCallState.callerId);

      if (socketRef.current?.connected && videoCallState.callerId) {
        socketRef.current.emit("answerCall", {
          signal: data,
          to: videoCallState.callerId,
        });
      } else {
        console.error(
          "Socket not connected or caller ID missing when trying to answer call"
        );
        toast.error("Connection to server lost. Please refresh the page.");

        // Clean up
        if (videoCallState.localStream) {
          videoCallState.localStream
            .getTracks()
            .forEach((track) => track.stop());
        }

        setVideoCallState((prev) => ({
          ...prev,
          callAccepted: false,
          isCallActive: false,
          localStream: null,
          callError: "Connection to server lost. Please refresh the page.",
        }));
      }
    });

    peer.on("stream", (remoteStream: MediaStream) => {
      console.log("Received remote stream from caller");
      setVideoCallState((prev) => ({
        ...prev,
        remoteStream,
      }));
      toast.success("Call connected!");
    });

    peer.on("error", (err) => {
      console.error("Peer connection error:", err);
      toast.error("Connection error: " + err.message);
      setVideoCallState((prev) => ({
        ...prev,
        callError: "Connection error: " + err.message,
      }));
    });

    // Add connection state change handler
    peer.on("connect", () => {
      console.log("Peer connection established");
      toast.success("Peer connection established");
    });

    peer.on("close", () => {
      console.log("Peer connection closed");
      // Only show toast if call was active
      if (videoCallState.isCallActive) {
        toast.success("Call ended");
      }
    });

    // Signal the peer with the incoming signal
    try {
      console.log("Signaling peer with incoming signal");
      peer.signal(peerRef.current.incomingSignal);
    } catch (error) {
      console.error("Error signaling peer:", error);
      toast.error(
        "Failed to establish connection: " +
          (error instanceof Error ? error.message : String(error))
      );

      setVideoCallState((prev) => ({
        ...prev,
        callError:
          "Failed to establish connection: " +
          (error instanceof Error ? error.message : String(error)),
        callAccepted: false,
        isCallActive: false,
      }));

      return;
    }

    // Store peer connection
    peerRef.current = {
      ...peerRef.current,
      peer,
    };

    // Clear any existing call timeout
    if (peerRef.current.callTimeoutId) {
      clearTimeout(peerRef.current.callTimeoutId);
    }
  };

  const rejectCall = (): void => {
    socketRef.current?.emit("rejectCall", {
      to: videoCallState.callerId,
    });

    setVideoCallState((prev) => ({
      ...prev,
      isReceivingCall: false,
      callerId: null,
      callerName: null,
    }));
  };

  const endCall = (): void => {
    console.log("Ending call");

    // Check if we're in self-call mode
    const isSelfCall =
      peerRef.current?.selfCallMode || videoCallState.isSelfCallMode;
    console.log("Is self call mode:", isSelfCall);

    // Notify the other party if we're in an active call (and not in self-call mode)
    if (
      !isSelfCall &&
      videoCallState.callAccepted &&
      videoCallState.callerId &&
      socketRef.current?.connected
    ) {
      console.log("Notifying caller that call has ended");
      socketRef.current.emit("callEnded", {
        to: videoCallState.callerId,
      });
    }

    // Clear any call timeout
    if (peerRef.current?.callTimeoutId) {
      console.log("Clearing call timeout");
      clearTimeout(peerRef.current.callTimeoutId);
    }

    // Stop peer connection
    if (peerRef.current?.peer) {
      console.log("Destroying peer connection");
      try {
        peerRef.current.peer.destroy();
      } catch (error) {
        console.error("Error destroying peer:", error);
      }
    }

    // Stop local stream
    if (videoCallState.localStream) {
      console.log("Stopping local media tracks");
      try {
        videoCallState.localStream.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (error) {
        console.error("Error stopping media tracks:", error);
      }
    }

    // Reset state
    console.log("Resetting video call state");
    setVideoCallState((prev) => {
      // Keep socket connection info but reset call-related state
      return {
        ...prev,
        isCallActive: false,
        isCalling: false,
        isReceivingCall: false,
        callAccepted: false,
        callRejected: false,
        callerId: null,
        callerName: null,
        localStream: null,
        remoteStream: null,
        callError: null,
        // Keep self-call mode if it was enabled
        isSelfCallMode: prev.isSelfCallMode,
        // Keep partner socket ID if in self-call mode
        partnerSocketId: prev.isSelfCallMode
          ? prev.socketId
          : prev.partnerSocketId,
      };
    });

    // Clear peer ref but keep any socket-related info and self-call mode
    const socketInfo = peerRef.current?.socketInfo;
    const selfCallMode = peerRef.current?.selfCallMode;
    peerRef.current = {
      socketInfo,
      selfCallMode,
    };

    console.log("Call ended successfully");
    toast.success("Call ended");
  };

  // Media controls
  const toggleMute = (): void => {
    if (!videoCallState.localStream) return;

    const audioTracks = videoCallState.localStream.getAudioTracks();

    audioTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });

    setVideoCallState((prev) => ({
      ...prev,
      isMuted: !prev.isMuted,
    }));
  };

  const toggleVideo = (): void => {
    if (!videoCallState.localStream) return;

    const videoTracks = videoCallState.localStream.getVideoTracks();

    videoTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });

    setVideoCallState((prev) => ({
      ...prev,
      isVideoOff: !prev.isVideoOff,
    }));
  };

  // Context value
  const value: VideoCallContextType = {
    videoCallState,
    partnerConnection,
    socketRef,
    user,
    setVideoCallState,
    sendPartnerInvitation,
    acceptPartnerInvitation,
    rejectPartnerInvitation,
    getReceivedInvitations,
    getSentInvitations,
    initiateCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  };

  return (
    <VideoCallContext.Provider value={value}>
      {children}
    </VideoCallContext.Provider>
  );
}

// Hook for using the context
export function useVideoCall() {
  const context = useContext(VideoCallContext);

  if (context === undefined) {
    throw new Error("useVideoCall must be used within a VideoCallProvider");
  }

  return context;
}
