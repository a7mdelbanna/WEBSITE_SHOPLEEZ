'use client';

/**
 * Chatbot Service
 *
 * SignalR-based chat service for customer support.
 * Features:
 * - WebSocket connection to CustomerSupport hub
 * - Message sending and receiving
 * - Connection state management
 * - Auto-reconnect on disconnect
 * - Typing indicators
 */

import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { getTokens } from '@/lib/api/client';
import type { ChatMessage, ChatbotStatus } from '@/types/profile';

// Hub URL - use environment variable or default
const CHAT_HUB_URL = process.env.NEXT_PUBLIC_CHAT_HUB_URL || 'https://api.shopleez.com/CustomerSupport';

// Message types from hub
type HubMessage = {
  messageId?: string;
  message: string;
  senderId: string;
  senderType: 'user' | 'bot' | 'agent';
  timestamp: string;
  sessionId: string;
};

export interface ChatbotCallbacks {
  onMessage: (message: ChatMessage) => void;
  onStatusChange: (status: ChatbotStatus) => void;
  onTyping: (isTyping: boolean) => void;
  onError: (error: Error) => void;
}

/**
 * Chatbot connection manager
 */
export class ChatbotService {
  private connection: HubConnection | null = null;
  private callbacks: ChatbotCallbacks | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private sessionId: string | null = null;

  /**
   * Initialize the chatbot service with callbacks
   */
  initialize(callbacks: ChatbotCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Connect to the chat hub
   */
  async connect(userId: string, storeId: number): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) {
      return;
    }

    this.callbacks?.onStatusChange('connecting');

    const { accessToken } = getTokens();

    try {
      // Build connection
      this.connection = new HubConnectionBuilder()
        .withUrl(`${CHAT_HUB_URL}?storeId=${storeId}`, {
          accessTokenFactory: () => accessToken || '',
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount >= this.maxReconnectAttempts) {
              return null; // Stop retrying
            }
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
          },
        })
        .configureLogging(LogLevel.Warning)
        .build();

      // Set up event handlers
      this.setupEventHandlers();

      // Start connection
      await this.connection.start();

      // Start session
      await this.startSession(userId);

      this.callbacks?.onStatusChange('connected');
      this.reconnectAttempts = 0;

    } catch (error) {
      console.error('Chat connection failed:', error);
      this.callbacks?.onStatusChange('error');
      this.callbacks?.onError(error as Error);
    }
  }

  /**
   * Set up SignalR event handlers
   */
  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Receive message
    this.connection.on('ReceiveMessage', (message: HubMessage) => {
      const chatMessage: ChatMessage = {
        id: message.messageId || Date.now().toString(),
        message: message.message,
        senderId: message.senderId,
        senderType: message.senderType,
        timestamp: message.timestamp,
        sessionId: message.sessionId,
      };
      this.callbacks?.onMessage(chatMessage);
    });

    // Typing indicator
    this.connection.on('Typing', (isTyping: boolean) => {
      this.callbacks?.onTyping(isTyping);
    });

    // Session started
    this.connection.on('SessionStarted', (sessionId: string) => {
      this.sessionId = sessionId;
    });

    // Session closed
    this.connection.on('SessionClosed', () => {
      this.sessionId = null;
      this.callbacks?.onStatusChange('sessionClosed');
    });

    // Connection state changes
    this.connection.onclose(() => {
      this.callbacks?.onStatusChange('disconnected');
    });

    this.connection.onreconnecting(() => {
      this.callbacks?.onStatusChange('connecting');
    });

    this.connection.onreconnected(() => {
      this.callbacks?.onStatusChange('connected');
      this.reconnectAttempts = 0;
    });
  }

  /**
   * Start a chat session
   */
  private async startSession(userId: string): Promise<void> {
    if (!this.connection) return;

    try {
      const response = await this.connection.invoke('StartSession', userId);
      if (response?.sessionId) {
        this.sessionId = response.sessionId;
      }
    } catch (error) {
      console.error('Failed to start session:', error);
      throw error;
    }
  }

  /**
   * Send a message
   */
  async sendMessage(message: string): Promise<void> {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      throw new Error('Not connected to chat');
    }

    if (!this.sessionId) {
      throw new Error('No active session');
    }

    try {
      await this.connection.invoke('SendMessage', {
        sessionId: this.sessionId,
        message,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Send typing indicator
   */
  async sendTyping(isTyping: boolean): Promise<void> {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      return;
    }

    try {
      await this.connection.invoke('SetTyping', this.sessionId, isTyping);
    } catch (error) {
      console.error('Failed to send typing:', error);
    }
  }

  /**
   * Disconnect from the chat hub
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (error) {
        console.error('Disconnect error:', error);
      }
      this.connection = null;
    }
    this.sessionId = null;
    this.callbacks?.onStatusChange('disconnected');
  }

  /**
   * Get connection state
   */
  getState(): HubConnectionState {
    return this.connection?.state ?? HubConnectionState.Disconnected;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected;
  }
}

// Singleton instance
export const chatbotService = new ChatbotService();
