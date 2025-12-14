'use client';

/**
 * Chatbot Service - Flutter-Compatible Implementation
 *
 * SignalR-based chat service for customer support.
 * This implementation matches the Flutter app's ACTUAL implementation exactly.
 *
 * Flow:
 * 1. Call REST API to start session and get sessionId
 * 2. Connect to SignalR hub at /chatHub
 * 3. Join session using JoinSession(sessionId)
 * 4. Send messages using SendMessageToSession(sessionId, message)
 * 5. Receive messages via ReceiveSessionMessage event
 */

import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { getTokens } from '@/lib/api/client';
import type { ChatMessage, ChatbotStatus } from '@/types/profile';

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
  private baseUrl: string | null = null;

  /**
   * Initialize the chatbot service with callbacks
   */
  initialize(callbacks: ChatbotCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Connect to the chat hub (Flutter-compatible)
   * @param sessionId - Existing session ID from REST API call
   * @param baseUrl - API base URL
   */
  async connect(sessionId: string, baseUrl: string): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) {
      return;
    }

    if (!baseUrl || !sessionId) {
      console.error('[Chatbot] No base URL or session ID provided');
      this.callbacks?.onStatusChange('error');
      return;
    }

    this.baseUrl = baseUrl;
    this.sessionId = sessionId;
    this.callbacks?.onStatusChange('connecting');

    const { accessToken } = getTokens();

    // Build hub URL - Flutter uses /chatHub with access_token query parameter
    const hubUrl = `${baseUrl}/chatHub`;
    console.log('[Chatbot] Connecting to:', hubUrl);
    console.log('[Chatbot] Using session ID:', sessionId);

    try {

      // Build SignalR connection
      this.connection = new HubConnectionBuilder()
        .withUrl(`${hubUrl}?access_token=${accessToken}`, {
          skipNegotiation: false,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount >= this.maxReconnectAttempts) {
              return null; // Stop retrying
            }
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
          },
        })
        .configureLogging(LogLevel.Information)
        .build();

      // Set up event handlers
      this.setupEventHandlers();

      // Start connection
      await this.connection.start();
      console.log('[Chatbot] SignalR connected');

      // Join session
      await this.joinSession(this.sessionId);

      this.callbacks?.onStatusChange('connected');
      this.reconnectAttempts = 0;

    } catch (error) {
      console.error('[Chatbot] Connection failed:', error);
      this.callbacks?.onStatusChange('error');
      this.callbacks?.onError(error as Error);
    }
  }

  /**
   * Set up SignalR event handlers (Flutter-compatible)
   */
  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Receive message from admin/bot (Flutter: ReceiveSessionMessage)
    this.connection.on('ReceiveSessionMessage', (...args: any[]) => {
      console.log('[Chatbot] ReceiveSessionMessage:', args);

      // Handle both array and object formats
      const messageData = args[0];
      const message = Array.isArray(messageData) ? messageData[0] : messageData;

      if (message) {
        const chatMessage: ChatMessage = {
          id: message.messageId || Date.now().toString(),
          message: message.message || message.toString(),
          senderId: message.senderId || 'admin',
          senderType: message.senderType || 'agent',
          timestamp: message.timestamp || new Date().toISOString(),
          sessionId: this.sessionId || '',
          choices: message.choices || undefined,
        };
        this.callbacks?.onMessage(chatMessage);
      }
    });

    // Session closed by admin (Flutter: SessionClosed)
    this.connection.on('SessionClosed', (...args: any[]) => {
      console.log('[Chatbot] SessionClosed:', args);
      this.sessionId = null;
      this.callbacks?.onStatusChange('sessionClosed');
    });

    // Connection state changes
    this.connection.onclose(() => {
      console.log('[Chatbot] Connection closed');
      this.callbacks?.onStatusChange('disconnected');
    });

    this.connection.onreconnecting(() => {
      console.log('[Chatbot] Reconnecting...');
      this.callbacks?.onStatusChange('connecting');
    });

    this.connection.onreconnected(async () => {
      console.log('[Chatbot] Reconnected');
      // Rejoin session after reconnect
      if (this.sessionId) {
        await this.joinSession(this.sessionId);
      }
      this.callbacks?.onStatusChange('connected');
      this.reconnectAttempts = 0;
    });
  }

  /**
   * Join a chat session (Flutter: JoinSession)
   */
  private async joinSession(sessionId: string): Promise<void> {
    if (!this.connection) return;

    try {
      console.log('[Chatbot] Joining session:', sessionId);
      await this.connection.invoke('JoinSession', sessionId);
      console.log('[Chatbot] Joined session successfully');
    } catch (error) {
      console.error('[Chatbot] Failed to join session:', error);
      throw error;
    }
  }

  /**
   * Send a message (Flutter: SendMessageToSession)
   */
  async sendMessage(message: string): Promise<void> {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      throw new Error('Not connected to chat');
    }

    if (!this.sessionId) {
      throw new Error('No active session');
    }

    try {
      console.log('[Chatbot] Sending message:', message);
      await this.connection.invoke('SendMessageToSession', this.sessionId, message);
      console.log('[Chatbot] Message sent successfully');
    } catch (error) {
      console.error('[Chatbot] Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Leave session (Flutter: LeaveSession)
   */
  private async leaveSession(): Promise<void> {
    if (!this.sessionId || !this.connection) return;

    try {
      console.log('[Chatbot] Leaving session:', this.sessionId);
      await this.connection.invoke('LeaveSession', this.sessionId);
      this.sessionId = null;
      console.log('[Chatbot] Left session successfully');
    } catch (error) {
      console.error('[Chatbot] Failed to leave session:', error);
    }
  }

  /**
   * Disconnect from the chat hub
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.leaveSession();
        await this.connection.stop();
      } catch (error) {
        console.error('[Chatbot] Disconnect error:', error);
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
