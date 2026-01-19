import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  campaign_id: string | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
  other_participant?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  campaign?: {
    id: string;
    title: string;
  };
  last_message?: string;
  unread_count?: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  status: 'sent' | 'delivered' | 'read';
  created_at: string;
}

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setConversations([]);
        return;
      }

      setCurrentUserId(user.id);

      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (convError) throw convError;

      // Fetch participant profiles and last messages
      const enrichedConversations = await Promise.all(
        (convData || []).map(async (conv) => {
          const otherUserId = conv.participant_1 === user.id 
            ? conv.participant_2 
            : conv.participant_1;

          // Get other participant profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url')
            .eq('user_id', otherUserId)
            .maybeSingle();

          // Get campaign info if exists
          let campaign = null;
          if (conv.campaign_id) {
            const { data: campaignData } = await supabase
              .from('campaigns')
              .select('id, title')
              .eq('id', conv.campaign_id)
              .maybeSingle();
            campaign = campaignData;
          }

          // Get last message
          const { data: msgData } = await supabase
            .from('messages')
            .select('content')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Count unread messages
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id)
            .neq('status', 'read');

          return {
            ...conv,
            other_participant: profileData || { id: otherUserId, display_name: null, avatar_url: null },
            campaign,
            last_message: msgData?.content,
            unread_count: count || 0,
          };
        })
      );

      setConversations(enrichedConversations);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      toast({
        title: "Erro ao carregar conversas",
        description: "Não foi possível carregar suas mensagens.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (otherUserId: string, campaignId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${user.id})`)
        .eq('campaign_id', campaignId || null)
        .maybeSingle();

      if (existing) return existing;

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          participant_1: user.id,
          participant_2: otherUserId,
          campaign_id: campaignId || null,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchConversations();
      return data;
    } catch (err) {
      console.error('Error creating conversation:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchConversations();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchConversations();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  return {
    conversations,
    loading,
    currentUserId,
    createConversation,
    refetch: fetchConversations,
  };
};

export const useMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const typedMessages: Message[] = (data || []).map(msg => ({
        ...msg,
        status: msg.status as 'sent' | 'delivered' | 'read',
      }));
      setMessages(typedMessages);

      // Mark messages as read
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('messages')
          .update({ status: 'read' })
          .eq('conversation_id', conversationId)
          .neq('sender_id', user.id)
          .neq('status', 'read');
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!conversationId || !content.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          status: 'sent',
        })
        .select()
        .single();

      if (error) throw error;

      const typedMessage: Message = {
        ...data,
        status: data.status as 'sent' | 'delivered' | 'read',
      };
      setMessages(prev => [...prev, typedMessage]);
      return typedMessage;
    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar sua mensagem.",
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  // Real-time subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => {
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return {
    messages,
    loading,
    sendMessage,
    refetch: fetchMessages,
  };
};
