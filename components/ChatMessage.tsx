import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Simple formatter to handle bold text (**text**) and newlines
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
          }
          return <span key={j}>{part}</span>;
        })}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-8 animate-fade-in`}>
      <div className={`max-w-[85%] md:max-w-[75%] flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-serif text-xs 
          ${isUser 
            ? 'bg-slate-200 text-slate-600' 
            : 'bg-strategic-dark text-white'
          }`}>
          {isUser ? 'Dig' : 'ES'}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`
            px-6 py-4 rounded-2xl shadow-sm text-sm leading-relaxed
            ${isUser 
              ? 'bg-white text-slate-700 border border-slate-200 rounded-tr-none' 
              : 'bg-white text-slate-800 border-l-4 border-l-strategic-dark border-y border-r border-slate-200 rounded-tl-none'
            }
          `}>
            {isUser ? (
              <p>{message.content}</p>
            ) : (
              <div className="prose prose-sm max-w-none font-sans text-slate-600">
                {formatText(message.content)}
                {message.isStreaming && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-slate-400 animate-pulse align-middle"></span>
                )}
              </div>
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
            {isUser ? 'Bruger' : 'Strategist'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;