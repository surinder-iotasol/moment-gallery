'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useVideoCall } from '@/context/VideoCallContext';
import { PartnerInvitation as PartnerInvitationType } from '@/types/videoCall';
import { motion } from 'framer-motion';
import { FaHeart, FaEnvelope, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function PartnerInvitation() {
  const { user } = useAuth();
  const { 
    sendPartnerInvitation, 
    getReceivedInvitations, 
    getSentInvitations,
    acceptPartnerInvitation,
    rejectPartnerInvitation,
    partnerConnection
  } = useVideoCall();
  
  const [recipientEmail, setRecipientEmail] = useState('');
  const [receivedInvitations, setReceivedInvitations] = useState<PartnerInvitationType[]>([]);
  const [sentInvitations, setSentInvitations] = useState<PartnerInvitationType[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch invitations
  const fetchInvitations = async () => {
    try {
      const [received, sent] = await Promise.all([
        getReceivedInvitations(),
        getSentInvitations()
      ]);
      
      setReceivedInvitations(received);
      setSentInvitations(sent);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast.error('Failed to fetch invitations');
    }
  };
  
  // Fetch invitations on mount
  useEffect(() => {
    if (user) {
      fetchInvitations();
    }
  }, [user]);
  
  // Handle invitation send
  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipientEmail) {
      toast.error('Please enter an email address');
      return;
    }
    
    if (recipientEmail === user?.email) {
      toast.error('You cannot invite yourself');
      return;
    }
    
    setLoading(true);
    
    try {
      await sendPartnerInvitation(recipientEmail);
      toast.success('Invitation sent successfully');
      setRecipientEmail('');
      fetchInvitations();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle invitation accept
  const handleAcceptInvitation = async (invitationId: string) => {
    setLoading(true);
    
    try {
      await acceptPartnerInvitation(invitationId);
      toast.success('Invitation accepted');
      fetchInvitations();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Failed to accept invitation');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle invitation reject
  const handleRejectInvitation = async (invitationId: string) => {
    setLoading(true);
    
    try {
      await rejectPartnerInvitation(invitationId);
      toast.success('Invitation rejected');
      fetchInvitations();
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      toast.error('Failed to reject invitation');
    } finally {
      setLoading(false);
    }
  };
  
  // If partner connection exists, show connected status
  if (partnerConnection) {
    return (
      <div className="bg-card p-6 rounded-lg shadow-md">
        <div className="text-center">
          <FaHeart className="text-primary text-4xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Connected with Partner</h3>
          <p className="text-foreground/70 mb-4">
            You are connected with {partnerConnection.partnerName || partnerConnection.partnerEmail}
          </p>
          <p className="text-sm text-foreground/50">
            Room ID: {partnerConnection.roomId}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-card p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <FaHeart className="text-primary mr-2" />
        Connect with Your Partner
      </h3>
      
      {/* Send invitation form */}
      <form onSubmit={handleSendInvitation} className="mb-6">
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <label htmlFor="recipientEmail" className="sr-only">
              Partner's Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-foreground/50" />
              </div>
              <input
                type="email"
                id="recipientEmail"
                placeholder="Enter your partner's email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-foreground/20 rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded-md flex items-center"
            disabled={loading}
          >
            <FaHeart className="mr-2" />
            Send Invitation
          </motion.button>
        </div>
      </form>
      
      {/* Received invitations */}
      {receivedInvitations.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-2">Received Invitations</h4>
          <div className="space-y-3">
            {receivedInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-3 border border-foreground/10 rounded-md bg-background/50"
              >
                <div>
                  <p className="font-medium">{invitation.senderName || 'Someone'}</p>
                  <p className="text-sm text-foreground/70">{invitation.senderEmail}</p>
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleAcceptInvitation(invitation.id)}
                    className="bg-green-500 text-white p-2 rounded-full"
                    disabled={loading}
                  >
                    <FaCheck />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRejectInvitation(invitation.id)}
                    className="bg-red-500 text-white p-2 rounded-full"
                    disabled={loading}
                  >
                    <FaTimes />
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Sent invitations */}
      {sentInvitations.length > 0 && (
        <div>
          <h4 className="text-lg font-medium mb-2">Sent Invitations</h4>
          <div className="space-y-3">
            {sentInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="p-3 border border-foreground/10 rounded-md bg-background/50"
              >
                <p className="font-medium">To: {invitation.recipientEmail}</p>
                <p className="text-sm text-foreground/70">
                  Status: <span className="capitalize">{invitation.status}</span>
                </p>
                <p className="text-xs text-foreground/50">
                  Sent: {invitation.createdAt.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* No invitations message */}
      {receivedInvitations.length === 0 && sentInvitations.length === 0 && (
        <div className="text-center py-4 text-foreground/70">
          <p>No invitations yet. Send an invitation to connect with your partner.</p>
        </div>
      )}
    </div>
  );
}
