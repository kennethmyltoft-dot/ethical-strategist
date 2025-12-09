import React, { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import { sendMessageStream, resetChat, initializeChat } from './services/geminiService';
import { Message, AppState } from './types';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize chat on mount
  useEffect(() => {
    initializeChat();
    // Add initial greeting from the Strategist
    setMessages([{
      id: 'init',
      role: 'model',
      content: "**Velkommen.** \n\nJeg er The Ethical Strategist. Hvilken udfordring eller dilemma står du overfor, som kræver både karakter og effektivitet?"
    }]);
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Input Size
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
    }
  }, [inputValue]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || appState !== AppState.IDLE) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    if (textAreaRef.current) textAreaRef.current.style.height = 'auto';
    setAppState(AppState.THINKING);

    try {
      const modelMessageId = (Date.now() + 1).toString();
      let fullContent = '';

      // Initialize placeholder message for model
      setMessages(prev => [...prev, {
        id: modelMessageId,
        role: 'model',
        content: '',
        isStreaming: true
      }]);

      setAppState(AppState.STREAMING);

      const stream = sendMessageStream(userMessage.content);

      for await (const chunk of stream) {
        fullContent += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === modelMessageId 
              ? { ...msg, content: fullContent } 
              : msg
          )
        );
      }

      // Finish streaming
      setMessages(prev => 
        prev.map(msg => 
          msg.id === modelMessageId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );
      setAppState(AppState.IDLE);

    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: "**Fejl:** Der opstod en uventet fejl. Vi genstarter sessionen for at bevare data-integriteten."
      }]);
      resetChat();
      setTimeout(() => setAppState(AppState.IDLE), 2000);
    }
  }, [inputValue, appState]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-strategic-dark p-4 text-white flex justify-between items-center shadow-md">
          <span className="font-serif font-bold">The Ethical Strategist</span>
          <span className="text-xs text-slate-400">MENTOR</span>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 py-8 md:px-12 md:py-10 max-w-5xl mx-auto w-full">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {appState === AppState.THINKING && (
            <div className="flex items-center space-x-2 text-slate-400 text-sm ml-12 animate-pulse">
              <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animation-delay-200"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animation-delay-400"></span>
              <span className="ml-2 font-serif italic">Reflekterer...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="w-full bg-slate-50 border-t border-slate-200 p-4 md:p-8">
          <div className="max-w-4xl mx-auto relative">
            <textarea
              ref={textAreaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Beskriv din udfordring..."
              rows={1}
              className="w-full bg-white border border-slate-300 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-strategic-dark/20 focus:border-strategic-dark resize-none shadow-sm transition-all max-h-48 overflow-y-auto font-sans"
              disabled={appState !== AppState.IDLE}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || appState !== AppState.IDLE}
              className={`absolute right-3 bottom-3 p-2 rounded-lg transition-all duration-200 
                ${inputValue.trim() && appState === AppState.IDLE
                  ? 'bg-strategic-dark text-white hover:bg-slate-800 shadow-md' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-2">
            The Ethical Strategist søger klarhed, ikke nemme svar.
          </p>
        </div>
      </main>
    </div>
  );
};

export default App;