import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../api/chat';

interface AetherChatProps {
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

function AetherChat({ onClose }: AetherChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hi! I'm Aether, your intelligent calendar assistant. I can help you create, view, update, and manage your calendar events. What would you like me to help you with?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');

  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: chatApi.sendMessage,
    onSuccess: (response) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + '-assistant',
        content: response.reply,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '-error',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMessageMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + '-user',
      content: input.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    sendMessageMutation.mutate(input.trim());
    setInput('');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Aether Assistant</span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '0',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.isUser ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: '18px',
                backgroundColor: message.isUser ? '#4285f4' : '#f1f3f4',
                color: message.isUser ? 'white' : '#202124',
                fontSize: '14px',
                lineHeight: '1.4',
                wordBreak: 'break-word',
              }}
            >
              {message.content}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: '#9aa0a6',
                marginTop: '4px',
              }}
            >
              {message.timestamp.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </div>
          </div>
        ))}

        {sendMessageMutation.isPending && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#9aa0a6',
              fontSize: '14px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid #e0e0e0',
                borderTop: '2px solid #4285f4',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            Aether is thinking...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me to schedule something..."
          disabled={sendMessageMutation.isPending}
        />
        <button
          type="submit"
          disabled={!input.trim() || sendMessageMutation.isPending}
          style={{
            background: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          →
        </button>
      </form>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default AetherChat;