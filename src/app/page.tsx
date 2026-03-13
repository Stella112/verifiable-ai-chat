'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, ShieldCheck, Menu, X, Terminal, Cpu } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Types
type Message = {
  role: 'user' | 'ai';
  content: string;
  receipt?: {
    txHash: string;
    modelId: string;
    latency: string;
  };
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // Auth & Session State
  const [authState, setAuthState] = useState<'landing' | 'ghost' | 'logged_in'>('landing');
  const [userEmail, setUserEmail] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [sessionId, setSessionId] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate or retrieve session ID
    let currentSession = localStorage.getItem('og_session_id');
    if (!currentSession) {
      currentSession = crypto.randomUUID();
      localStorage.setItem('og_session_id', currentSession);
    }
    setSessionId(currentSession);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail && loginPassword) {
      setUserEmail(loginEmail);
      setAuthState('logged_in');
      // Mock saving token
      localStorage.setItem('og_auth_token', 'mock_verified_token_' + Date.now());
    }
  };

  const handleLogout = () => {
    setAuthState('landing');
    setUserEmail('');
    setMessages([]);
    localStorage.removeItem('og_auth_token');
  };


  const mockSessions = [
    "DeFi Strategy",
    "Smart Contract Audit",
    "zk-KYC flow",
    "Liquidity Pool Analysis",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const content = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    const updatedMessages: Message[] = [
      ...messages,
      { role: 'user', content }
    ];
    setMessages(updatedMessages);

    try {
      if (isDemoMode) {
        // Simulated delay for Demo Mode
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockResponse: Message = {
          role: 'ai',
          content: `This is a secure response generated in Demo Mode. While the OpenGradient backend is currently undergoing SSL maintenance (CERTIFICATE_VERIFY_FAILED), the UI demonstrates the verifiable flow.`,
          receipt: {
            txHash: "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
            modelId: "OG-Llama-3-Demo",
            latency: "142ms"
          }
        };
        setMessages((prev) => [...prev, mockResponse]);
        return;
      }

      const token = localStorage.getItem('og_auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (authState === 'logged_in' && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://38.49.209.149:8003/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          sessionId,
          messages: updatedMessages 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from the secure TEE endpoint.');
      }

      const aiResponse = await response.json();
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: 'An error occurred while connecting to the secure enclave. Please try again.',
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-black text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[#1a1a1a] bg-[#050505] transition-transform duration-300 ease-in-out md:relative",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-2 text-neon-purple font-bold text-lg tracking-wider">
            <Cpu className="w-5 h-5" />
            <span>OG TEE CHAT</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-4 px-2">Secure Sessions</h3>
          <div className="space-y-1">
            {mockSessions.map((session, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:bg-[#111111] hover:text-white rounded-lg transition-colors text-left"
              >
                <Terminal className="w-4 h-4" />
                <span className="truncate">{session}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-[#1a1a1a] space-y-4">
           <div className="flex items-center justify-between">
             <span className="text-xs font-mono text-gray-400">Demo Mode</span>
             <button
               onClick={() => setIsDemoMode(!isDemoMode)}
               className={cn(
                 "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                 isDemoMode ? "bg-neon-purple" : "bg-[#222222]"
               )}
             >
               <span
                 className={cn(
                   "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
                   isDemoMode ? "translate-x-4" : "translate-x-1"
                 )}
               />
             </button>
           </div>
           
           <div className="text-xs text-gray-500 flex items-center gap-2">
             <div className={cn(
               "w-2 h-2 rounded-full animate-pulse",
               isDemoMode ? "bg-yellow-500" : "bg-neon-purple"
             )} />
             {isDemoMode ? "Demo Fallback Active" : "Enclave Connection Active"}
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col h-full bg-black min-w-0 relative">
        {authState === 'landing' ? (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
            <div className="w-full max-w-md p-8 rounded-2xl bg-[#0a0a0a] border border-[#222222] shadow-[0_0_50px_rgba(176,38,255,0.05)]">
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 rounded-full bg-[#111111] border border-[#222222] flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8 text-neon-purple" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Secure Access</h2>
                <p className="text-gray-400 text-sm mt-2 text-center">Authenticate to access the verifiable enclave.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-[#111111] border border-[#222222] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-[#111111] border border-[#222222] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-neon-purple hover:bg-neon-purple/90 text-white font-medium py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(176,38,255,0.3)]"
                >
                  Enter Secure Enclave
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-[#1a1a1a] text-center">
                <button
                  onClick={() => setAuthState('ghost')}
                  className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
                >
                  Continue in Ghost Mode (Anonymous)
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <header className="flex h-16 items-center justify-between border-b border-[#1a1a1a] px-4 shrink-0">
          <div className="flex items-center">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="mr-4 text-gray-400 hover:text-white transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-lg font-medium">New Conversation</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {authState === 'ghost' ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111111] border border-[#222222] text-xs font-medium text-gray-400">
                  <span>👻</span> Ghost Mode Active
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-neon-purple hover:text-neon-purple/80 transition-colors"
                >
                  Sign In to Save History
                </button>
              </>
            ) : (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111111] border border-[#222222] text-xs font-medium text-gray-300">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  {userEmail}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </header>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-32">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#111111] border border-[#222222] flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-neon-purple" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Verifiable AI Intelligence</h2>
              <p className="text-gray-400 text-sm">
                Every response is executed within an OpenGradient TEE, guaranteeing cryptographic proof of execution and model integrity.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-8 pb-8">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex flex-col gap-2 max-w-[85%]",
                    message.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div
                    className={cn(
                      "px-4 py-3 rounded-2xl",
                      message.role === 'user'
                        ? "bg-[#1f1f1f] text-white rounded-br-sm"
                        : "bg-transparent text-white border-l-2 border-neon-purple pl-4 pr-0 py-1"
                    )}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>

                  {message.role === 'ai' && message.receipt && (
                    <div className="mt-2 w-full max-w-xl bg-[#0a0a0a] border border-[#222222] rounded-lg p-4 font-mono text-xs overflow-hidden shadow-[0_0_15px_rgba(176,38,255,0.05)]">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#222222]">
                        <ShieldCheck className="w-4 h-4 text-neon-purple drop-shadow-[0_0_5px_rgba(176,38,255,1)]" />
                        <span className="text-neon-purple font-semibold tracking-wider drop-shadow-[0_0_2px_rgba(176,38,255,0.5)]">
                          TEE VERIFIED
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-gray-400">
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-gray-500">TX Hash</span>
                          <span className="truncate text-gray-300">{message.receipt.txHash}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-gray-500">Model ID</span>
                          <span className="truncate text-gray-300">{message.receipt.modelId}</span>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-gray-500">Latency</span>
                          <span className="text-gray-300">{message.receipt.latency}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex mr-auto items-start max-w-[85%]">
                   <div className="bg-transparent text-white border-l-2 border-[#333333] pl-4 py-1 flex items-center gap-3">
                     <div className="flex gap-1">
                       <div className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-bounce" style={{ animationDelay: '0ms' }} />
                       <div className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-bounce" style={{ animationDelay: '150ms' }} />
                       <div className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-bounce" style={{ animationDelay: '300ms' }} />
                     </div>
                     <span className="text-gray-500 text-sm italic">Executing in Secure Enclave...</span>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black to-transparent pt-10 pb-6 shrink-0 md:relative bg-black">
          <div className="max-w-3xl mx-auto px-4">
            <form
              onSubmit={handleSubmit}
              className="relative flex items-center rounded-2xl bg-[#111111] border border-[#222222] focus-within:border-[#333333] focus-within:ring-1 focus-within:ring-[#333333] transition-all overflow-hidden p-1 shadow-xl"
            >
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (inputMessage.trim() && !isLoading) handleSubmit(e);
                  }
                }}
                disabled={isLoading}
                placeholder="Message the verifiable AI..."
                className="w-full max-h-32 min-h-[44px] resize-none bg-transparent py-3 px-4 text-white focus:outline-none disabled:opacity-50"
                rows={1}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-2 bottom-2 p-2 rounded-xl bg-neon-purple text-white disabled:opacity-50 disabled:bg-[#333333] transition-colors flex items-center gap-2 font-medium self-end group"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="hidden sm:inline-block px-2 text-sm">Send Securely</span>
                    <Send className="w-4 h-4 sm:ml-[-4px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
            <div className="mt-3 text-center">
              <p className="text-xs text-slate-500 font-medium tracking-wide">
                Secured by <span className="text-slate-400">OpenGradient TEE</span> & <span className="text-slate-400">Base Sepolia</span>.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
