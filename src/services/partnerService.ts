import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  getDoc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PartnerInvitation, PartnerConnection } from "@/types/videoCall";
import { v4 as uuidv4 } from "uuid";

// Collection names
const INVITATIONS_COLLECTION = "partnerInvites";
const CONNECTIONS_COLLECTION = "partnerConnections";

/**
 * Send a partner invitation
 */
export const sendPartnerInvitation = async (
  senderId: string,
  senderEmail: string,
  senderName: string | null,
  recipientEmail: string
): Promise<string> => {
  try {
    // Check if an invitation already exists
    const existingInvitationQuery = query(
      collection(db, INVITATIONS_COLLECTION),
      where("senderId", "==", senderId),
      where("recipientEmail", "==", recipientEmail),
      where("status", "==", "pending")
    );

    const existingInvitationSnapshot = await getDocs(existingInvitationQuery);
    console.log("Existing Invitation", existingInvitationQuery);

    if (!existingInvitationSnapshot.empty) {
      return existingInvitationSnapshot.docs[0].id;
    }

    // Create a new invitation
    const invitationData = {
      senderId,
      senderEmail,
      senderName,
      recipientEmail,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, INVITATIONS_COLLECTION),
      invitationData
    );
    return docRef.id;
  } catch (error) {
    console.error("Error sending partner invitation:", error);
    throw new Error("Failed to send partner invitation");
  }
};

/**
 * Get received partner invitations
 */
export const getReceivedInvitations = async (
  userEmail: string
): Promise<PartnerInvitation[]> => {
  try {
    const invitationsQuery = query(
      collection(db, INVITATIONS_COLLECTION),
      where("recipientEmail", "==", userEmail),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(invitationsQuery);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        senderId: data.senderId,
        senderEmail: data.senderEmail,
        senderName: data.senderName,
        recipientEmail: data.recipientEmail,
        status: data.status,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error("Error getting received invitations:", error);
    throw new Error("Failed to get received invitations");
  }
};

/**
 * Get sent partner invitations
 */
export const getSentInvitations = async (
  userId: string
): Promise<PartnerInvitation[]> => {
  try {
    const invitationsQuery = query(
      collection(db, INVITATIONS_COLLECTION),
      where("senderId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(invitationsQuery);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        senderId: data.senderId,
        senderEmail: data.senderEmail,
        senderName: data.senderName,
        recipientEmail: data.recipientEmail,
        status: data.status,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error("Error getting sent invitations:", error);
    throw new Error("Failed to get sent invitations");
  }
};

/**
 * Accept a partner invitation
 */
export const acceptPartnerInvitation = async (
  invitationId: string,
  userId: string,
  userEmail: string,
  userName: string | null
): Promise<string> => {
  try {
    // Get the invitation
    const invitationRef = doc(db, INVITATIONS_COLLECTION, invitationId);
    const invitationSnapshot = await getDoc(invitationRef);

    if (!invitationSnapshot.exists()) {
      throw new Error("Invitation not found");
    }

    const invitationData = invitationSnapshot.data();

    // Update invitation status
    await updateDoc(invitationRef, {
      status: "accepted",
      updatedAt: serverTimestamp(),
    });

    // Generate a unique room ID
    const roomId = uuidv4();

    // Create connection for the sender
    await addDoc(collection(db, CONNECTIONS_COLLECTION), {
      userId: invitationData.senderId,
      partnerId: userId,
      partnerEmail: userEmail,
      partnerName: userName,
      roomId,
      createdAt: serverTimestamp(),
    });

    // Create connection for the recipient
    await addDoc(collection(db, CONNECTIONS_COLLECTION), {
      userId,
      partnerId: invitationData.senderId,
      partnerEmail: invitationData.senderEmail,
      partnerName: invitationData.senderName,
      roomId,
      createdAt: serverTimestamp(),
    });

    return roomId;
  } catch (error) {
    console.error("Error accepting partner invitation:", error);
    throw new Error("Failed to accept partner invitation");
  }
};

/**
 * Reject a partner invitation
 */
export const rejectPartnerInvitation = async (
  invitationId: string
): Promise<void> => {
  try {
    const invitationRef = doc(db, INVITATIONS_COLLECTION, invitationId);

    await updateDoc(invitationRef, {
      status: "rejected",
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error rejecting partner invitation:", error);
    throw new Error("Failed to reject partner invitation");
  }
};

/**
 * Get partner connection
 */
export const getPartnerConnection = async (
  userId: string
): Promise<PartnerConnection | null> => {
  try {
    const connectionsQuery = query(
      collection(db, CONNECTIONS_COLLECTION),
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(connectionsQuery);

    if (snapshot.empty) {
      return null;
    }

    const data = snapshot.docs[0].data();

    return {
      id: snapshot.docs[0].id,
      userId: data.userId,
      partnerId: data.partnerId,
      partnerEmail: data.partnerEmail,
      partnerName: data.partnerName,
      roomId: data.roomId,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error("Error getting partner connection:", error);
    throw new Error("Failed to get partner connection");
  }
};
