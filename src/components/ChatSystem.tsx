import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  Send, 
  MessageSquare, 
  Search, 
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Circle
} from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  campaignTitle?: string;
}

interface ChatSystemProps {
  userId?: string;
  onClose?: () => void;
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    participantName: "Maria Beauty",
    lastMessage: "Olá! Vi que você está interessado na campanha",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
    unreadCount: 2,
    isOnline: true,
    campaignTitle: "Produto de Beleza Natural"
  },
  {
    id: "2",
    participantName: "Fitness Ana",
    lastMessage: "Perfeito, vou preparar o conteúdo!",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
    unreadCount: 0,
    isOnline: false,
    campaignTitle: "App de Fitness"
  },
  {
    id: "3",
    participantName: "Tech João",
    lastMessage: "Quando podemos agendar a gravação?",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unreadCount: 1,
    isOnline: true,
    campaignTitle: "Curso Online"
  },
];

const mockMessages: Message[] = [
  {
    id: "1",
    senderId: "other",
    content: "Olá! Vi que você está interessado na campanha de beleza.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: 'read'
  },
  {
    id: "2",
    senderId: "me",
    content: "Sim! Adorei a proposta. Qual seria o prazo de entrega?",
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    status: 'read'
  },
  {
    id: "3",
    senderId: "other",
    content: "O prazo é de 5 dias úteis após a aprovação do briefing.",
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
    status: 'read'
  },
  {
    id: "4",
    senderId: "me",
    content: "Ótimo! Podemos começar quando?",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    status: 'delivered'
  },
  {
    id: "5",
    senderId: "other",
    content: "Podemos começar agora mesmo! Vou enviar o briefing detalhado.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    status: 'read'
  },
];

export const ChatSystem = ({ userId, onClose }: ChatSystemProps) => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: "me",
      content: newMessage,
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const MessageStatus = ({ status }: { status: Message['status'] }) => {
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-primary" />;
    }
  };

  const filteredConversations = mockConversations.filter(c =>
    c.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.campaignTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[600px] rounded-lg border bg-card overflow-hidden">
      {/* Conversations List */}
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold mb-3">Mensagens</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedConversation?.id === conversation.id ? 'bg-muted' : ''
              }`}
              onClick={() => setSelectedConversation(conversation)}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conversation.participantAvatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {conversation.participantName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.isOnline && (
                    <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-success text-success" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-medium truncate">{conversation.participantName}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(conversation.lastMessageTime)}
                    </span>
                  </div>
                  {conversation.campaignTitle && (
                    <Badge variant="secondary" className="text-xs mt-1 mb-1">
                      {conversation.campaignTitle}
                    </Badge>
                  )}
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <Badge className="bg-primary text-white text-xs">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex justify-between items-center bg-muted/30">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedConversation.participantAvatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedConversation.participantName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedConversation.participantName}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        message.senderId === 'me'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${
                        message.senderId === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        <span className="text-xs">{formatTime(message.timestamp)}</span>
                        {message.senderId === 'me' && <MessageStatus status={message.status} />}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button variant="ghost" size="icon">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Suas Mensagens</h3>
              <p className="text-muted-foreground">
                Selecione uma conversa para começar a trocar mensagens
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Chat Button Component
export const ChatButton = ({ conversation, onClick }: { conversation?: Conversation; onClick: () => void }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" onClick={onClick}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Chat
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[900px] max-w-full p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Chat</SheetTitle>
        </SheetHeader>
        <ChatSystem />
      </SheetContent>
    </Sheet>
  );
};
