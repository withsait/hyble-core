"use client";

import { useState, useRef, useEffect } from "react";
import { Card, Button, Input } from "@hyble/ui";
import {
  Send,
  Paperclip,
  Loader2,
  User,
  Headphones,
  FileText,
  Download,
  Image,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface TicketConversationProps {
  ticketId: string;
}

interface Message {
  id: string;
  senderId: string;
  senderType: "customer" | "agent";
  message: string;
  attachments?: { id: string; fileName: string; fileUrl: string; mimeType: string }[];
  createdAt: Date;
}

// Mock data - will be replaced with tRPC query when support router is implemented
const mockMessages: Message[] = [
  {
    id: "1",
    senderId: "user-1",
    senderType: "customer",
    message: "Sunucuya SSH ile bağlanamıyorum. Yardımcı olabilir misiniz?",
    createdAt: new Date("2024-12-15T10:30:00"),
  },
  {
    id: "2",
    senderId: "agent-1",
    senderType: "agent",
    message: "Merhaba, talebinizi aldık. SSH erişim sorununuzu inceliyoruz. Lütfen hangi IP adresinden bağlanmaya çalıştığınızı paylaşır mısınız?",
    createdAt: new Date("2024-12-15T11:00:00"),
  },
  {
    id: "3",
    senderId: "user-1",
    senderType: "customer",
    message: "IP adresim 85.123.45.67. Port 22 üzerinden bağlanmaya çalışıyorum.",
    createdAt: new Date("2024-12-15T11:30:00"),
  },
];

const mockCurrentUserId = "user-1";

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  const isImage = (mimeType: string) => mimeType.startsWith("image/");

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex items-end gap-2 max-w-[80%] ${isOwn ? "flex-row-reverse" : ""}`}>
        {/* Avatar */}
        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}>
          {isOwn ? (
            <User className="h-4 w-4" />
          ) : (
            <Headphones className="h-4 w-4" />
          )}
        </div>

        {/* Content */}
        <div className={`space-y-2 ${isOwn ? "items-end" : "items-start"}`}>
          <div className={`rounded-2xl px-4 py-2 ${
            isOwn
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted rounded-bl-sm"
          }`}>
            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
          </div>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="space-y-2">
              {message.attachments.map((file) => (
                <div key={file.id}>
                  {isImage(file.mimeType) ? (
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={file.fileUrl}
                        alt={file.fileName}
                        className="max-w-xs rounded-lg border"
                      />
                    </a>
                  ) : (
                    <a
                      href={file.fileUrl}
                      download
                      className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg text-sm hover:bg-muted transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="truncate">{file.fileName}</span>
                      <Download className="h-4 w-4 ml-auto" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Time */}
          <p className={`text-xs text-muted-foreground ${isOwn ? "text-right" : ""}`}>
            {format(new Date(message.createdAt), "HH:mm", { locale: tr })}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TicketConversation({ ticketId }: TicketConversationProps) {
  const [newMessage, setNewMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [localMessages, setLocalMessages] = useState<Message[]>(mockMessages);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TODO: Replace with tRPC query when support router is ready
  // const { data, isLoading, refetch } = trpc.support.tickets.getMessages.useQuery({ ticketId });
  const isLoading = false;
  const messages = localMessages;
  const currentUserId = mockCurrentUserId;

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    // TODO: Replace with tRPC mutation when support router is ready
    setIsSending(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const newMsg: Message = {
      id: String(messages.length + 1),
      senderId: currentUserId,
      senderType: "customer",
      message: newMessage,
      createdAt: new Date(),
    };

    setLocalMessages(prev => [...prev, newMsg]);
    setNewMessage("");
    setSelectedFiles([]);
    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((f) => f.size <= 10 * 1024 * 1024); // 10MB max
    setSelectedFiles((prev) => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <Card className="h-[500px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[500px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p>Henüz mesaj yok</p>
          </div>
        ) : (
          <>
            {messages.map((message: Message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUserId}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="px-4 py-2 border-t bg-muted/30">
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-2 py-1 bg-background rounded text-xs"
              >
                {file.type.startsWith("image/") ? (
                  <Image className="h-3 w-3" />
                ) : (
                  <FileText className="h-3 w-3" />
                )}
                <span className="max-w-[100px] truncate">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={selectedFiles.length >= 5}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Mesajınızı yazın..."
              className="w-full px-4 py-2 border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              rows={1}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={(!newMessage.trim() && selectedFiles.length === 0) || isSending}
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Shift+Enter ile satır atlayabilirsiniz
        </p>
      </div>
    </Card>
  );
}
