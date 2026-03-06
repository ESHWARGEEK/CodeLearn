'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Lightbulb, Bug, Zap, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIMentorChatProps {
  context?: {
    currentTask?: string;
    code?: string;
    projectId?: string;
  };
  className?: string;
}

export default function AIMentorChat({ context, className }: AIMentorChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content:
        "Hi! I'm your AI Mentor. I'm here to help you learn and solve problems. Ask me anything about your code or the task you're working on!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call to POST /api/ai/mentor/chat
      // For now, simulate AI response
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content:
          'Great question! Let me help you with that. [This will be replaced with actual AI response from Claude 3.5]',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content:
          "I'm sorry, I encountered an error. Please try again or check the documentation for help.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleQuickAction = (action: string, prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-lg border bg-card shadow-sm',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b bg-muted/50 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary shadow-sm">
          <Lightbulb className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold">AI Mentor</h3>
          <p className="text-xs text-muted-foreground">Ask me anything</p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
          <span className="text-xs text-green-600 dark:text-green-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'ai' && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                <Lightbulb className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[80%] rounded-lg px-4 py-2 text-sm',
                message.role === 'ai'
                  ? 'bg-muted text-foreground'
                  : 'bg-primary text-primary-foreground'
              )}
            >
              <p className="leading-relaxed">{message.content}</p>
              <span className="mt-1 block text-xs opacity-70">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            {message.role === 'user' && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                <span className="text-sm font-medium">You</span>
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary">
              <Lightbulb className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="rounded-lg bg-muted px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50"></span>
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50"
                  style={{ animationDelay: '0.1s' }}
                ></span>
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50"
                  style={{ animationDelay: '0.2s' }}
                ></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="border-t bg-muted/30 px-4 py-3">
        <div className="mb-3 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              handleQuickAction('explain', 'Can you explain this code to me?')
            }
            disabled={isLoading}
            className="flex-1"
          >
            <Lightbulb className="h-3 w-3" />
            Explain
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              handleQuickAction('bugs', 'Can you help me find bugs in my code?')
            }
            disabled={isLoading}
            className="flex-1"
          >
            <Bug className="h-3 w-3" />
            Find Bugs
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              handleQuickAction('optimize', 'How can I optimize this code?')
            }
            disabled={isLoading}
            className="flex-1"
          >
            <Zap className="h-3 w-3" />
            Optimize
          </Button>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
