import { supabase } from './supabaseConfig';

export class MessagingService {
  constructor() {
    this.subscriptions = new Map();
    this.messageListeners = new Map();
  }

  // Send a message with real-time delivery
  async sendMessage(senderId, recipientId, message, messageType = 'text') {
    try {
      console.log('📤 Sending message:', { senderId, recipientId, message });
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          recipient_id: recipientId,
          message: message,
          message_type: messageType,
          status: 'sent'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error sending message:', error);
        throw error;
      }

      console.log('✅ Message sent successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      throw error;
    }
  }

  // Get conversation messages between two users
  async getConversationMessages(userId1, userId2, limit = 50) {
    try {
      console.log('💬 Loading conversation:', { userId1, userId2 });
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId1},recipient_id.eq.${userId2}),and(sender_id.eq.${userId2},recipient_id.eq.${userId1})`)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('❌ Error loading messages:', error);
        return [];
      }

      console.log('📨 Loaded messages:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Failed to load messages:', error);
      return [];
    }
  }

  // Get user's conversations list
  async getUserConversations(userId) {
    try {
      console.log('📋 Loading conversations for user:', userId);
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading conversations:', error);
        return [];
      }

      // Transform data to include other participant info
      const conversations = data?.map(conv => {
        const otherParticipantId = conv.participant_1 === userId 
          ? conv.participant_2 
          : conv.participant_1;
        
        return {
          ...conv,
          other_participant_id: otherParticipantId
        };
      }) || [];

      console.log('💬 Loaded conversations:', conversations.length);
      return conversations;
    } catch (error) {
      console.error('❌ Failed to load conversations:', error);
      return [];
    }
  }

  // Mark messages as read
  async markMessagesAsRead(userId, otherUserId) {
    try {
      console.log('👁️ Marking messages as read:', { userId, otherUserId });
      
      const { error } = await supabase
        .from('messages')
        .update({ 
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('sender_id', otherUserId)
        .eq('recipient_id', userId)
        .neq('status', 'read');

      if (error) {
        console.error('❌ Error marking messages as read:', error);
        return false;
      }

      console.log('✅ Messages marked as read');
      return true;
    } catch (error) {
      console.error('❌ Failed to mark messages as read:', error);
      return false;
    }
  }

  // Subscribe to real-time messages for a conversation
  subscribeToConversation(userId1, userId2, onMessage) {
    const conversationKey = `${userId1}-${userId2}`;
    
    console.log('🔔 Subscribing to conversation:', conversationKey);
    console.log('🔔 User IDs:', { userId1, userId2 });
    
    // Unsubscribe from existing subscription if any
    this.unsubscribeFromConversation(conversationKey);
    
    const subscription = supabase
      .channel(`conversation-${conversationKey}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('📨 Real-time INSERT received:', payload.new);
          
          // Check if this message belongs to our conversation
          const msg = payload.new;
          if ((msg.sender_id === userId1 && msg.recipient_id === userId2) ||
              (msg.sender_id === userId2 && msg.recipient_id === userId1)) {
            console.log('✅ Message belongs to our conversation');
            onMessage(msg, 'insert');
          } else {
            console.log('❌ Message not for our conversation');
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('📝 Real-time UPDATE received:', payload.new);
          
          // Check if this message belongs to our conversation
          const msg = payload.new;
          if ((msg.sender_id === userId1 && msg.recipient_id === userId2) ||
              (msg.sender_id === userId2 && msg.recipient_id === userId1)) {
            console.log('✅ Update belongs to our conversation');
            onMessage(msg, 'update');
          }
        }
      )
      .subscribe((status) => {
        console.log('🔔 Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to real-time messages');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time subscription error');
        }
      });

    this.subscriptions.set(conversationKey, subscription);
    this.messageListeners.set(conversationKey, onMessage);
    
    return conversationKey;
  }

  // Unsubscribe from conversation
  unsubscribeFromConversation(conversationKey) {
    const subscription = this.subscriptions.get(conversationKey);
    if (subscription) {
      console.log('🔕 Unsubscribing from conversation:', conversationKey);
      supabase.removeChannel(subscription);
      this.subscriptions.delete(conversationKey);
      this.messageListeners.delete(conversationKey);
    }
  }

  // Subscribe to user's conversations list
  subscribeToUserConversations(userId, onConversationUpdate) {
    console.log('🔔 Subscribing to user conversations:', userId);
    
    const subscription = supabase
      .channel(`user-conversations-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `or(participant_1.eq.${userId},participant_2.eq.${userId})`
        },
        (payload) => {
          console.log('💬 Conversation updated:', payload);
          onConversationUpdate(payload);
        }
      )
      .subscribe();

    return subscription;
  }

  // Clean up all subscriptions
  cleanup() {
    console.log('🧹 Cleaning up messaging subscriptions');
    
    this.subscriptions.forEach((subscription, key) => {
      supabase.removeChannel(subscription);
    });
    
    this.subscriptions.clear();
    this.messageListeners.clear();
  }

  // Get unread message count
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .neq('status', 'read');

      if (error) {
        console.error('❌ Error getting unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('❌ Failed to get unread count:', error);
      return 0;
    }
  }

  // Search messages
  async searchMessages(userId, query, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .ilike('message', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error searching messages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Failed to search messages:', error);
      return [];
    }
  }

  // Delete message
  async deleteMessage(messageId, userId) {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', userId);

      if (error) {
        console.error('❌ Error deleting message:', error);
        return false;
      }

      console.log('🗑️ Message deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to delete message:', error);
      return false;
    }
  }
}

// Export singleton instance
export const messagingService = new MessagingService();
