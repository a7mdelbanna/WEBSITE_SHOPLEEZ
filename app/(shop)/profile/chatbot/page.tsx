'use client';

/**
 * Chatbot Page (Help & Support)
 *
 * Real-time chat interface for customer support.
 * Features:
 * - SignalR WebSocket connection
 * - Message bubbles (user right, bot/agent left)
 * - Quick action chips
 * - Typing indicator
 * - Connection status
 * - Auto-reconnect
 * - RTL support
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Loader2,
  Wifi,
  WifiOff,
  RefreshCcw,
  Headphones,
  Package,
  CreditCard,
  HelpCircle,
} from 'lucide-react';
import { AppShell } from '@/components/layout';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useAuth } from '@/lib/contexts/auth-context';
import { useProfile, useStartChatSession } from '@/lib/services/auth';
import { useApiClient } from '@/lib/api/provider';
import { chatbotService } from '@/lib/services/chatbot';
import { cn } from '@/lib/utils';
import type { ChatMessage, ChatbotStatus } from '@/types/profile';

// Quick action chips
const QUICK_ACTIONS = [
  { labelEn: 'Track Order', labelAr: 'تتبع الطلب', icon: Package },
  { labelEn: 'Payment Issue', labelAr: 'مشكلة في الدفع', icon: CreditCard },
  { labelEn: 'General Help', labelAr: 'مساعدة عامة', icon: HelpCircle },
];

// Message bubble component
function MessageBubble({
  message,
  isRTL,
}: {
  message: ChatMessage;
  isRTL: boolean;
}) {
  const isUser = message.senderType === 'user';

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={cn(
      "flex gap-2 mb-4",
      isUser ? "justify-end" : "justify-start",
      isRTL && "flex-row-reverse"
    )}>
      {/* Avatar for bot/agent */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
          <Headphones className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Message bubble */}
      <div className={cn(
        "max-w-[75%] px-4 py-3 rounded-[16px]",
        isUser
          ? "bg-[var(--color-primary)] text-white rounded-br-[4px]"
          : "bg-[#F5F5F7] text-[#1A1A1A] rounded-bl-[4px]",
        isRTL && isUser && "rounded-br-[16px] rounded-bl-[4px]",
        isRTL && !isUser && "rounded-bl-[16px] rounded-br-[4px]"
      )}>
        <p className="text-[14px] leading-relaxed whitespace-pre-wrap">
          {message.message}
        </p>
        <p className={cn(
          "text-[10px] mt-1",
          isUser ? "text-white/70" : "text-[#9CA3AF]",
          isUser ? "text-right" : "text-left",
          isRTL && "text-left"
        )}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}

// Typing indicator
function TypingIndicator({ isRTL }: { isRTL: boolean }) {
  return (
    <div className={cn(
      "flex gap-2 mb-4",
      "justify-start",
      isRTL && "flex-row-reverse"
    )}>
      <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
        <Headphones className="w-4 h-4 text-white" />
      </div>
      <div className="bg-[#F5F5F7] px-4 py-3 rounded-[16px] rounded-bl-[4px]">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-[#9CA3AF] animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-[#9CA3AF] animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-[#9CA3AF] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

// Connection status badge
function ConnectionStatus({
  status,
  isRTL,
  onReconnect,
}: {
  status: ChatbotStatus;
  isRTL: boolean;
  onReconnect: () => void;
}) {
  const statusConfig = {
    initial: { color: 'bg-gray-100 text-gray-600', icon: WifiOff, labelEn: 'Connecting...', labelAr: 'جاري الاتصال...' },
    connecting: { color: 'bg-amber-100 text-amber-700', icon: Loader2, labelEn: 'Connecting...', labelAr: 'جاري الاتصال...' },
    connected: { color: 'bg-green-100 text-green-700', icon: Wifi, labelEn: 'Online', labelAr: 'متصل' },
    disconnected: { color: 'bg-red-100 text-red-700', icon: WifiOff, labelEn: 'Offline', labelAr: 'غير متصل' },
    error: { color: 'bg-red-100 text-red-700', icon: WifiOff, labelEn: 'Error', labelAr: 'خطأ' },
    sessionClosed: { color: 'bg-gray-100 text-gray-600', icon: WifiOff, labelEn: 'Session ended', labelAr: 'انتهت الجلسة' },
  };

  const config = statusConfig[status] || statusConfig.initial;
  const Icon = config.icon;
  const isSpinning = status === 'connecting';
  const canReconnect = status === 'disconnected' || status === 'error';

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-medium",
      config.color
    )}>
      <Icon className={cn("w-3.5 h-3.5", isSpinning && "animate-spin")} />
      <span>{isRTL ? config.labelAr : config.labelEn}</span>
      {canReconnect && (
        <button
          onClick={onReconnect}
          className="ml-1 p-0.5 hover:bg-black/5 rounded"
        >
          <RefreshCcw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

export default function ChatbotPage() {
  const router = useRouter();
  const { isRTL } = useTranslations();
  const { isAuthenticated, isLoading: authLoading, openLoginModal } = useAuth();
  const { baseUrl } = useApiClient();
  const { data: profile } = useProfile(isAuthenticated);

  // Chat session mutation
  const startChatSession = useStartChatSession();

  // State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<ChatbotStatus>('initial');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Initialize chatbot
  useEffect(() => {
    chatbotService.initialize({
      onMessage: (message) => {
        setMessages(prev => [...prev, message]);
        setIsTyping(false);
      },
      onStatusChange: (newStatus) => {
        setStatus(newStatus);
      },
      onTyping: (typing) => {
        setIsTyping(typing);
      },
      onError: (error) => {
        console.error('Chatbot error:', error);
      },
    });

    return () => {
      chatbotService.disconnect();
    };
  }, []);

  // Start chat session and connect when authenticated
  useEffect(() => {
    if (isAuthenticated && !sessionId && status === 'initial') {
      console.log('[ChatPage] Starting chat session...');
      startChatSession.mutate(undefined, {
        onSuccess: (data) => {
          console.log('[ChatPage] Session started:', data.sessionId);

          // If existing session, load messages into UI
          if (data.messages && data.messages.length > 0) {
            console.log('[ChatPage] Loading', data.messages.length, 'existing messages');
            setMessages(data.messages);  // ✅ Load ALL existing messages
          }

          setSessionId(data.sessionId);
          // Connect to SignalR with the session ID
          chatbotService.connect(data.sessionId, baseUrl);
        },
        onError: (error) => {
          console.error('[ChatPage] Failed to start session:', error);
          setStatus('error');
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, sessionId, status, baseUrl]);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Redirect if not authenticated
  useEffect(() => {
    // Don't redirect while still checking authentication
    if (authLoading) return;

    if (!isAuthenticated) {
      openLoginModal();
      router.push('/profile');
    }
  }, [isAuthenticated, openLoginModal, router]);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  // Handle reconnect
  const handleReconnect = () => {
    if (sessionId) {
      setStatus('initial');
      chatbotService.connect(sessionId, baseUrl);
    } else {
      // No session ID - restart from beginning
      setStatus('initial');
    }
  };

  // Handle send message
  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;

    const messageText = inputValue.trim();
    setInputValue('');
    setIsSending(true);

    // Add user message optimistically
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: messageText,
      senderId: profile?.id ? String(profile.id) : 'user',
      senderType: 'user',
      timestamp: new Date().toISOString(),
      sessionId: '',
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      await chatbotService.sendMessage(messageText);
    } catch (error) {
      console.error('Send failed:', error);
      // Could show error toast here
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  // Handle quick action
  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    setInputValue(isRTL ? action.labelAr : action.labelEn);
    inputRef.current?.focus();
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AppShell>
      <div className="flex-1 min-w-0 bg-white flex flex-col h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-4 py-4 border-b border-[#F0F0F0]">
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F5F5F7] hover:bg-[#ECECEC] transition-colors"
            >
              <BackIcon className="w-5 h-5 text-[#1A1A1A]" />
            </Link>
            <div>
              <h1 className="text-[18px] font-bold text-[#1A1A1A]">
                {isRTL ? 'المساعدة والدعم' : 'Help & Support'}
              </h1>
            </div>
          </div>
          <ConnectionStatus status={status} isRTL={isRTL} onReconnect={handleReconnect} />
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--color-primary)] bg-opacity-10 flex items-center justify-center mb-4">
                <Headphones className="w-8 h-8 text-[var(--color-primary)]" />
              </div>
              <h2 className="text-[18px] font-semibold text-[#1A1A1A] mb-2">
                {isRTL ? 'مرحباً! كيف يمكننا مساعدتك؟' : 'Hello! How can we help you?'}
              </h2>
              <p className="text-[14px] text-[#6B7280] max-w-sm mx-auto">
                {isRTL
                  ? 'اكتب رسالتك أو اختر من الخيارات السريعة أدناه'
                  : 'Type your message or choose from the quick options below'}
              </p>

              {/* Quick Actions */}
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {QUICK_ACTIONS.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full",
                        "bg-[#F5F5F7] hover:bg-[#ECECEC] transition-colors",
                        "text-[13px] font-medium text-[#1A1A1A]"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {isRTL ? action.labelAr : action.labelEn}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} isRTL={isRTL} />
          ))}

          {/* Typing indicator */}
          {isTyping && <TypingIndicator isRTL={isRTL} />}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-[#F0F0F0] p-4">
          <div className={cn(
            "flex items-center gap-3 bg-[#F5F5F7] rounded-full px-4 py-2",
            isRTL && "flex-row-reverse"
          )}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isRTL ? 'اكتب رسالتك...' : 'Type your message...'}
              disabled={status !== 'connected'}
              className={cn(
                "flex-1 bg-transparent outline-none text-[14px] text-[#1A1A1A]",
                "placeholder:text-[#9CA3AF] disabled:opacity-50",
                isRTL && "text-right"
              )}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isSending || status !== 'connected'}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                inputValue.trim() && status === 'connected'
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[#E5E7EB] text-[#9CA3AF]",
                "disabled:opacity-50"
              )}
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className={cn("w-5 h-5", isRTL && "rotate-180")} />
              )}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
