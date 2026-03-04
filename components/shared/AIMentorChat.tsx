'use client';

import { useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function AIMentorChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content:
        'Hey Alex! I noticed you paused on the Authentication Flow. Want a quick refresher on JWTs?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (will be replaced with actual API call)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content:
          'Great question! Let me help you with that. [This will be replaced with actual AI response]',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  return (
    <div className="bg-gradient-to-b from-indigo-900/20 to-[#1E293B] border border-indigo-500/20 rounded-xl p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <span className="material-symbols-outlined text-white text-[16px]">smart_toy</span>
        </div>
        <h3 className="font-bold text-white text-sm">AI Mentor</h3>
      </div>

      {/* Messages */}
      <div className="space-y-3 mb-4 max-h-48 overflow-y-auto relative z-10">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'ai' && (
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-[12px]">smart_toy</span>
              </div>
            )}
            <div
              className={`text-sm p-3 rounded-lg max-w-[80%] ${
                message.role === 'ai'
                  ? 'bg-[#0F172A]/50 border border-indigo-500/10 text-gray-300'
                  : 'bg-indigo-600 text-white'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2 justify-start">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-[12px]">smart_toy</span>
            </div>
            <div className="bg-[#0F172A]/50 border border-indigo-500/10 text-gray-300 text-sm p-3 rounded-lg">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                ></span>
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 mb-3 relative z-10">
        <button
          onClick={() => handleQuickAction('Explain JWTs')}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors shadow-lg shadow-indigo-900/20"
        >
          Explain JWTs
        </button>
        <button
          onClick={() => handleQuickAction('Ask Question')}
          className="flex-1 bg-[#334155] hover:bg-[#475569] text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors"
        >
          Ask Question
        </button>
      </div>

      {/* Input */}
      <div className="flex gap-2 relative z-10">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask me anything..."
          className="flex-1 bg-[#0F172A]/50 border border-indigo-500/20 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-500"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
        </button>
      </div>
    </div>
  );
}
