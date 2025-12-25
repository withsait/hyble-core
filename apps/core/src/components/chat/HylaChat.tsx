"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Plus,
  Settings,
  Trash2,
  Edit2,
  Check,
  X,
  Bot,
  User,
  Sparkles,
  Paperclip,
  Image,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RotateCcw,
  ChevronDown,
  Loader2,
  Zap,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: { type: string; url: string }[];
  createdAt: Date;
}

interface Conversation {
  id: string;
  title: string;
  provider: "claude" | "gemini";
  model: string;
  createdAt: Date;
  updatedAt: Date;
  _count: { messages: number };
}

interface ModelOption {
  id: string;
  name: string;
  description: string;
}

const providerIcons = {
  claude: "🟣",
  gemini: "🔵",
};

export function HylaChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [provider, setProvider] = useState<"claude" | "gemini">("claude");
  const [model, setModel] = useState("claude-sonnet-4-20250514");
  const [models, setModels] = useState<{ claude: ModelOption[]; gemini: ModelOption[] }>({
    claude: [],
    gemini: [],
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchConversations();
    fetchModels();
  }, []);

  useEffect(() => {
    if (currentConversation) {
      fetchMessages(currentConversation.id);
    }
  }, [currentConversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/trpc/hyla.listConversations");
      const data = await response.json();
      if (data.result?.data) {
        setConversations(data.result.data.conversations);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/trpc/hyla.getConversation?input=${encodeURIComponent(JSON.stringify({ json: { conversationId } }))}`);
      const data = await response.json();
      if (data.result?.data) {
        setMessages(data.result.data.messages);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await fetch("/api/trpc/hyla.getModels");
      const data = await response.json();
      if (data.result?.data) {
        setModels(data.result.data);
      }
    } catch (error) {
      console.error("Failed to fetch models:", error);
    }
  };

  const createConversation = async () => {
    try {
      const response = await fetch("/api/trpc/hyla.createConversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json: {
            title: "Yeni Konuşma",
            provider,
            model,
          },
        }),
      });
      const data = await response.json();
      if (data.result?.data) {
        const newConversation = data.result.data;
        setConversations(prev => [newConversation, ...prev]);
        setCurrentConversation(newConversation);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !currentConversation || sending) return;

    const content = inputValue.trim();
    setInputValue("");
    setSending(true);

    // Optimistically add user message
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      const response = await fetch("/api/trpc/hyla.sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json: {
            conversationId: currentConversation.id,
            content,
          },
        }),
      });
      const data = await response.json();
      if (data.result?.data) {
        const { userMessage, assistantMessage } = data.result.data;
        setMessages(prev => [
          ...prev.filter(m => m.id !== tempUserMessage.id),
          userMessage,
          assistantMessage,
        ]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
    } finally {
      setSending(false);
    }
  };

  const updateTitle = async (conversationId: string) => {
    if (!newTitle.trim()) return;

    try {
      await fetch("/api/trpc/hyla.updateConversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json: { conversationId, title: newTitle },
        }),
      });
      setConversations(prev =>
        prev.map(c => c.id === conversationId ? { ...c, title: newTitle } : c)
      );
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(prev => prev ? { ...prev, title: newTitle } : null);
      }
    } catch (error) {
      console.error("Failed to update title:", error);
    } finally {
      setEditingTitle(null);
      setNewTitle("");
    }
  };

  const deleteConversation = async (conversationId: string) => {
    if (!confirm("Bu konuşmayı silmek istediğinizden emin misiniz?")) return;

    try {
      await fetch("/api/trpc/hyla.deleteConversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { conversationId } }),
      });
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const submitFeedback = async (messageId: string, rating: number) => {
    try {
      await fetch("/api/trpc/hyla.submitFeedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json: { messageId, rating },
        }),
      });
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] bg-slate-50 dark:bg-[#0a0a0f] rounded-2xl overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 bg-white dark:bg-[#12121a] border-r border-slate-200 dark:border-slate-800 flex flex-col">
        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={createConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all"
          >
            <Plus className="w-5 h-5" />
            Yeni Sohbet
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                currentConversation?.id === conv.id
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
              onClick={() => setCurrentConversation(conv)}
            >
              <span className="text-lg">{providerIcons[conv.provider]}</span>
              {editingTitle === conv.id ? (
                <div className="flex-1 flex items-center gap-1">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button onClick={() => updateTitle(conv.id)} className="p-1 text-green-600">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingTitle(null)} className="p-1 text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-sm truncate">{conv.title}</span>
                  <div className="hidden group-hover:flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTitle(conv.id);
                        setNewTitle(conv.title);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className="p-1 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Ayarlar
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${showSettings ? "rotate-180" : ""}`} />
          </button>
          {showSettings && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">AI Sağlayıcı</label>
                <select
                  value={provider}
                  onChange={(e) => {
                    setProvider(e.target.value as any);
                    setModel(models[e.target.value as keyof typeof models]?.[0]?.id || "");
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f]"
                >
                  <option value="claude">Claude (Anthropic)</option>
                  <option value="gemini">Gemini (Google)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f]"
                >
                  {models[provider]?.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12121a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {currentConversation.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {providerIcons[currentConversation.provider]} {currentConversation.model}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Hyla ile Sohbet
                  </h3>
                  <p className="text-slate-500 max-w-md">
                    Merhaba! Ben Hyla, Hyble&apos;ın AI asistanıyım. Size nasıl yardımcı olabilirim?
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      message.role === "user"
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : "bg-gradient-to-br from-blue-500 to-purple-600"
                    }`}>
                      {message.role === "user" ? (
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`max-w-[70%] ${message.role === "user" ? "text-right" : ""}`}>
                      <div
                        className={`inline-block px-4 py-3 rounded-2xl ${
                          message.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-white dark:bg-[#1a1a24] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => copyMessage(message.content)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            title="Kopyala"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => submitFeedback(message.id, 5)}
                            className="p-1 text-slate-400 hover:text-green-600"
                            title="Beğen"
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => submitFeedback(message.id, 1)}
                            className="p-1 text-slate-400 hover:text-red-600"
                            title="Beğenme"
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {sending && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Düşünüyor...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12121a]">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Mesajınızı yazın..."
                    rows={1}
                    className="w-full px-4 py-3 pr-12 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-[#0a0a0f] text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ minHeight: "48px", maxHeight: "200px" }}
                  />
                  <button className="absolute right-3 bottom-3 p-1 text-slate-400 hover:text-slate-600">
                    <Paperclip className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || sending}
                  className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl transition-colors"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-400 text-center mt-2">
                Hyla yapay zeka tarafından desteklenmektedir. Yanıtlar her zaman doğru olmayabilir.
              </p>
            </div>
          </>
        ) : (
          // No conversation selected
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Hyla AI Asistan
            </h2>
            <p className="text-slate-500 max-w-md mb-8">
              Sorularınızı yanıtlayabilir, içerik oluşturabilir, kod yazabilir ve çok daha fazlasını yapabilirim.
            </p>
            <button
              onClick={createConversation}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all"
            >
              <Zap className="w-5 h-5" />
              Sohbete Başla
            </button>
            <div className="grid grid-cols-3 gap-4 mt-12 max-w-2xl">
              {[
                { icon: "💬", title: "Soru-Cevap", desc: "Her konuda sorular sorun" },
                { icon: "✍️", title: "İçerik Oluşturma", desc: "Blog, email, sosyal medya" },
                { icon: "💻", title: "Kod Yardımı", desc: "Kodlama ve debugging" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-4 bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  <span className="text-2xl mb-2 block">{item.icon}</span>
                  <h3 className="font-medium text-slate-900 dark:text-white text-sm">{item.title}</h3>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
