import React, { useRef, useEffect } from 'react';
import { Bot, User, Search, ArrowRight } from 'lucide-react';

export function ConversationMessage({ message, type }) {
  return (
    <div className={`flex items-start gap-3 ${type === 'user' ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center 
        ${type === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
        {type === 'user' ? (
          <User className="w-4 h-4 text-blue-600" />
        ) : (
          <Bot className="w-4 h-4 text-gray-600" />
        )}
      </div>
      <div className={`flex-1 max-w-[80%] p-4 rounded-2xl ${
        type === 'user' 
          ? 'bg-blue-600 text-white ml-auto rounded-tr-none' 
          : 'bg-gray-100 text-gray-900 rounded-tl-none'
      }`}>
        {message}
      </div>
    </div>
  );
}

export function ConversationThread({ 
  messages, 
  onSendMessage, 
  isTyping = false,
  placeholder = "Refine your search or ask about specific colleges...",
  shouldScrollToSearch = false
}) {
  const [input, setInput] = React.useState('');
  const searchSectionRef = useRef(null);

  useEffect(() => {
    if (shouldScrollToSearch && searchSectionRef.current) {
      searchSectionRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [shouldScrollToSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 animate-fade-in">
      {/* Previous messages */}
      {messages.length > 0 && (
        <div className="space-y-6 mb-8">
          {messages.map((msg, idx) => (
            <div key={idx} className="animate-slide-in-bottom" style={{ 
              animationDelay: `${idx * 100}ms` 
            }}>
              <ConversationMessage 
                message={msg.content} 
                type={msg.type} 
              />
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-center gap-2 text-gray-500 animate-pulse">
              <Bot className="w-5 h-5" />
              <span>Thinking...</span>
            </div>
          )}
        </div>
      )}

      {/* Divider with text */}
      <div className="relative mb-6" ref={searchSectionRef}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 py-1 bg-white text-gray-500 rounded-full border border-gray-200">
            Refine Your Search
          </span>
        </div>
      </div>

      {/* Search form */}
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-1">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <div className="absolute left-4 text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="w-full py-4 pl-12 pr-16 rounded-xl bg-transparent
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              transition-all duration-200 text-gray-900 placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className={`absolute right-3 flex items-center gap-2 px-4 py-2 rounded-lg
              transition-all duration-200 ${
                input.trim() 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-100 text-gray-400'
              }`}
          >
            <span className="text-sm font-medium">Ask</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Example queries */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        <button 
          onClick={() => onSendMessage("Show me more safety schools")}
          className="text-sm px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Show me more safety schools
        </button>
        <button 
          onClick={() => onSendMessage("What are similar colleges to my best fit?")}
          className="text-sm px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Similar to best fit
        </button>
        <button 
          onClick={() => onSendMessage("Find colleges with lower tuition")}
          className="text-sm px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Lower tuition options
        </button>
      </div>
    </div>
  );
} 