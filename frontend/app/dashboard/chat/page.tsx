'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { ChatMessage as ChatMessageType, ConversationSummary } from '@/types';
import { sendChatMessage, getConversations, getMessages } from '@/lib/api/chat';
import { handleApiError } from '@/lib/utils/errors';
import ChatThread from '@/components/chat/ChatThread';
import ChatInput from '@/components/chat/ChatInput';
import ConversationList from '@/components/chat/ConversationList';

export default function ChatPage() {
  const { user, signout } = useAuth();
  const router = useRouter();

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [convsLoading, setConvsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setConvsLoading(true);
    try {
      const convs = await getConversations();
      setConversations(convs);
    } catch (err) {
      const errorResult = handleApiError(err);
      if (errorResult.shouldRedirect) signout();
    } finally {
      setConvsLoading(false);
    }
  };

  const handleSelectConversation = useCallback(async (id: string) => {
    setActiveConversationId(id);
    setError(null);
    try {
      const msgs = await getMessages(id);
      setMessages(msgs);
    } catch (err) {
      const errorResult = handleApiError(err);
      setError(errorResult.message);
      if (errorResult.shouldRedirect) signout();
    }
  }, [signout]);

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setError(null);
  };

  const handleSend = async (message: string) => {
    setLoading(true);
    setError(null);

    // Optimistic: add user message to thread
    const tempUserMsg: ChatMessageType = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await sendChatMessage(message, activeConversationId);

      // Set active conversation (may be new)
      setActiveConversationId(response.conversation_id);

      // Add assistant message
      const assistantMsg: ChatMessageType = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        tool_calls: response.tool_calls.length > 0 ? response.tool_calls : null,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Refresh conversations list
      await fetchConversations();
    } catch (err) {
      const errorResult = handleApiError(err);
      setError(errorResult.message);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
      if (errorResult.shouldRedirect) signout();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Conversation List */}
      {sidebarOpen && (
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={handleSelectConversation}
          onNewChat={handleNewChat}
          loading={convsLoading}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-700 p-1"
              aria-label="Toggle sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">AI Chat Assistant</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Tasks
            </button>
            <span className="text-sm text-gray-500">{user?.email}</span>
            <button
              onClick={signout}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Chat Thread */}
        <ChatThread messages={messages} loading={loading} />

        {/* Chat Input */}
        <ChatInput onSend={handleSend} disabled={loading} />
      </div>
    </div>
  );
}
