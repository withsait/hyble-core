"use client";

import { useState, useRef, useEffect } from "react";
import { Card, Button, Input } from "@hyble/ui";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  User,
  Bot,
  Minimize2,
  Maximize2,
  RefreshCw,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  feedback?: boolean | null;
  sources?: { id: string; title: string }[];
  createdAt: Date;
}

const quickReplies = [
  { label: "Fiyatlar", message: "Fiyatlar hakkında bilgi almak istiyorum" },
  { label: "Kurulum", message: "Kurulum nasıl yapılır?" },
  { label: "Destek", message: "Teknik destek almak istiyorum" },
];

export function HylaWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Merhaba! Ben Hyla, Hyble'ın sanal asistanıyım. Size nasıl yardımcı olabilirim?",
      createdAt: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    // Simulate AI response (in real implementation, this would call tRPC)
    setTimeout(() => {
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: getSimulatedResponse(userMessage.content),
        createdAt: new Date(),
        sources: [{ id: "1", title: "Fiyatlandırma Rehberi" }],
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getSimulatedResponse = (userMsg: string): string => {
    const lowerMsg = userMsg.toLowerCase();
    if (lowerMsg.includes("fiyat")) {
      return "Hyble'da farklı ihtiyaçlara göre planlarımız mevcut:\n\n• **Free Plan**: Ücretsiz, 1 site, 10GB bandwidth\n• **Starter**: €5/ay, 3 site, 50GB bandwidth\n• **Business**: €15/ay, 10 site, 200GB bandwidth\n\nDetaylı bilgi için [fiyatlandırma sayfamızı](/pricing) ziyaret edebilirsiniz.";
    }
    if (lowerMsg.includes("kurulum")) {
      return "Kurulum oldukça basit! İşte adımlar:\n\n1. Dashboard'dan 'Yeni Site' butonuna tıklayın\n2. Framework'ünüzü seçin (Next.js, React, Vue...)\n3. Projenizin ZIP dosyasını yükleyin\n4. Birkaç dakika içinde siteniz yayında!\n\nDaha fazla yardıma ihtiyacınız varsa bana sorun.";
    }
    if (lowerMsg.includes("destek") || lowerMsg.includes("temsilci") || lowerMsg.includes("insan")) {
      return "Tabii ki! Size bir destek talebi oluşturmayı önerebilirim. Destek ekibimiz genellikle 24 saat içinde yanıt verir.\n\n[Destek Talebi Oluştur](/dashboard/support/new) linkine tıklayarak hemen başlayabilirsiniz.";
    }
    return "Anlıyorum. Bu konuda size yardımcı olmak istiyorum. Daha spesifik bir soru sorabilir misiniz? Ya da şu konularda bilgi alabilirim:\n\n• Fiyatlandırma\n• Kurulum ve ayarlar\n• Teknik destek";
  };

  const handleFeedback = (messageId: string, isPositive: boolean) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, feedback: isPositive } : m
      )
    );
    // In real implementation, send feedback to server
  };

  const handleQuickReply = (quickMessage: string) => {
    setMessage(quickMessage);
    handleSend();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Merhaba! Ben Hyla, Hyble'ın sanal asistanıyım. Size nasıl yardımcı olabilirim?",
        createdAt: new Date(),
      },
    ]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50 hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
          1
        </span>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all ${
        isMinimized ? "w-64" : "w-96"
      }`}
    >
      <Card className="shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Hyla</h3>
              <p className="text-xs opacity-80">Hyble Asistanı</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={resetChat}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              title="Sohbeti Sıfırla"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-muted/30">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] ${
                      msg.role === "user" ? "order-1" : "order-2"
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-background border rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    {/* Feedback for AI messages */}
                    {msg.role === "assistant" && msg.id !== "welcome" && (
                      <div className="flex items-center gap-2 mt-1 ml-1">
                        <button
                          onClick={() => handleFeedback(msg.id, true)}
                          className={`p-1 rounded transition-colors ${
                            msg.feedback === true
                              ? "text-green-600"
                              : "text-muted-foreground hover:text-green-600"
                          }`}
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, false)}
                          className={`p-1 rounded transition-colors ${
                            msg.feedback === false
                              ? "text-red-600"
                              : "text-muted-foreground hover:text-red-600"
                          }`}
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-background border rounded-2xl rounded-bl-sm px-4 py-2">
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
                      <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                      <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length === 1 && (
              <div className="px-4 py-2 border-t flex flex-wrap gap-2">
                {quickReplies.map((qr) => (
                  <button
                    key={qr.label}
                    onClick={() => {
                      setMessage(qr.message);
                      setTimeout(handleSend, 100);
                    }}
                    className="text-xs px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full transition-colors"
                  >
                    {qr.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  disabled={isTyping}
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!message.trim() || isTyping}
                >
                  {isTyping ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                Hyla yapay zeka destekli bir asistadır. Yanıtlar her zaman doğru olmayabilir.
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
