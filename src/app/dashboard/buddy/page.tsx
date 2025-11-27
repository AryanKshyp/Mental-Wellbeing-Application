// src/app/dashboard/buddy/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
// 1. Updated Import: Added generateResponse
import { getChatHistory, saveMessage, getUserSession, generateResponse } from './actions'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Bot, Plus, Smile } from 'lucide-react'; // Cleaned unused icons
import { Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  moodRating?: number | null;
  moodNotes?: string | null;
  isCue?: boolean;
}

interface DbMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

type ChatMode = 'common' | 'reflection';

const REFLECTION_PROMPTS = [
  "What's something that made you smile today?",
  "What challenge did you face today?",
  "What's one thing you're grateful for right now?",
];

export default function BuddyPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<ChatMode>('common');
  const [showPrompts, setShowPrompts] = useState(true);
  
  const toggleChatMode = async () => {
    const newMode = chatMode === 'common' ? 'reflection' : 'common';
    setChatMode(newMode);
    
    // If switching to reflection mode, add a welcome message
    if (newMode === 'reflection') {
      const welcomeMessage = {
        id: `reflection-welcome-${Date.now()}`,
        role: 'assistant' as const,
        content: 'Welcome to Reflection Mode. Let\'s take a moment to reflect. What\'s been on your mind lately?',
        createdAt: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, welcomeMessage]);
      await saveMessage('assistant', welcomeMessage.content, null, null, 'reflection');
    }
  };

  // Mood states
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [moodNotes, setMoodNotes] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 1. Initial Data Fetching
  useEffect(() => {
    const initChat = async () => {
      const user = await getUserSession(); 
      
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      try {
        const history = await getChatHistory() as DbMessage[];
        if (history && history.length > 0) {
          const transformedHistory: Message[] = history.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            createdAt: msg.created_at,
            moodRating: (msg as any).mood_rating, // Using type assertion since mood_rating isn't in DbMessage
            moodNotes: (msg as any).mood_notes,   // Using type assertion since mood_notes isn't in DbMessage
            isCue: false
          }));
          setMessages(transformedHistory);
          
          // Show prompts if last message is from assistant
          if (transformedHistory.length > 0 && transformedHistory[transformedHistory.length - 1].role === 'assistant') {
            setShowPrompts(true);
          }
        } else {
          // Add welcome message if no history exists
          const welcomeMessage = {
            id: 'welcome-' + Date.now(),
            role: 'assistant' as const,
            content: "Hello! I'm your AI Buddy. How are you feeling today?",
            createdAt: new Date().toISOString(),
            isCue: false
          };
          setMessages([welcomeMessage]);
          await saveMessage('assistant', welcomeMessage.content, null, null, 'common');
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initChat();
  }, [router]);

  // Scroll to bottom effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCueSelection = async (cue: string) => {
    if (!userId) return;
    
    setShowPrompts(false); // Hide prompts when a cue is selected
    
    // Add the cue as an assistant message
    const cueMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: cue,
      createdAt: new Date().toISOString(),
      isCue: true
    };
    
    try {
      // Save the cue message to the database
      await saveMessage('assistant', cue, null, null, 'reflection');
      
      // Update the UI with the new message
      setMessages(prev => [...prev, cueMessage]);
      
      // Set the cue as the input for the user to respond to
      setInput(cue);
      
      // Focus the input field
      const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
      inputElement?.focus();
    } catch (error) {
      console.error('Error handling cue selection:', error);
    }
  };

  const handleSendMessage = async (customContent?: string, isFromCue: boolean = false) => {
    const messageContent = customContent || input.trim();
    if (!messageContent || !userId) return;
    
    setShowPrompts(false); // Hide prompts when a message is sent
    setShowMoodSelector(false); // Hide mood selector if open

    // Reset UI states immediately
    setInput('');
    setShowMoodSelector(false);
    setCurrentMood(null);
    setMoodNotes('');
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      createdAt: new Date().toISOString(),
      moodRating: currentMood,
      moodNotes: moodNotes
    };

    // Create updated messages array with the new user message
    const updatedMessages = [...messages, userMessage];
    
    // Optimistic Update
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // 1. Save User Message
      await saveMessage('user', messageContent, currentMood ?? null, moodNotes ?? null, chatMode);

      // 2. Generate Response using Server Action
      // Only include user and assistant messages in the history sent to the LLM
      const conversationHistory = updatedMessages
        .filter(msg => msg.role !== 'system')
        .map(({ role, content }) => ({ role, content }));

      const aiResponseContent = await generateResponse(
        conversationHistory,
        messageContent,
        chatMode
      );

      // 3. Update UI with Bot Message
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: aiResponseContent,
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
      
      // 4. Save Bot Message
      await saveMessage('assistant', aiResponseContent, null, null, chatMode);

    } catch (error) {
      console.error('Chat Error:', error);
      // Optional: Add toast notification here
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again.",
        createdAt: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-64px)] transition-colors duration-300 ${
      chatMode === 'reflection' ? 'bg-indigo-50' : 'bg-white'
    }`}>
      {/* Header */}
      <div className={`p-4 border-b flex justify-between items-center transition-colors duration-300 ${
        chatMode === 'reflection' ? 'bg-indigo-600 text-white' : 'bg-white'
      }`}>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">AI Buddy</h1>
          {chatMode === 'reflection' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
              <Sparkles className="h-3 w-3" />
              Reflection Mode
            </span>
          )}
        </div>
        <Button 
          onClick={toggleChatMode}
          variant={chatMode === 'reflection' ? 'secondary' : 'outline'}
          className={`gap-2 transition-all ${chatMode === 'reflection' ? 'bg-white text-indigo-700 hover:bg-indigo-50' : ''}`}
        >
          {chatMode === 'reflection' ? (
            <>
              <Sparkles className="h-4 w-4" />
              Exit Reflection
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Start Reflecting
            </>
          )}
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className={`flex-1 p-4 overflow-y-auto transition-colors duration-300 ${
        chatMode === 'reflection' ? 'bg-gradient-to-b from-indigo-50 to-indigo-25' : ''
      }`}>
        <div className={`max-w-2xl mx-auto space-y-4 transition-all duration-300 ${
          chatMode === 'reflection' ? 'transform -translate-y-1' : ''
        }`}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : msg.role === 'system' 
                    ? 'bg-indigo-50 border-l-4 border-indigo-300 text-indigo-800 italic' 
                    : 'bg-white border shadow-sm'
              }`}>
                {msg.moodRating && (
                   <div className="text-xs mb-1 opacity-80 flex items-center gap-1">
                      Mood: {msg.moodRating}/10
                   </div>
                )}
                {msg.isCue ? (
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0 text-indigo-400" />
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          
          {/* Reflection Prompts Injection */}
          {chatMode === 'reflection' && messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && !isLoading && showPrompts && (
            <div className="flex flex-wrap gap-2 mt-4 justify-center animate-in fade-in-50 slide-in-from-bottom-2">
              {REFLECTION_PROMPTS.slice(0, 3).map((prompt, i) => (
                <button 
                  key={i}
                  onClick={(e) => {
                    e.preventDefault();
                    handleCueSelection(prompt);
                  }}
                  className="text-xs bg-white/80 backdrop-blur-sm text-indigo-700 px-4 py-2 rounded-full hover:bg-white transition-all shadow-sm hover:shadow-md border border-indigo-100 hover:border-indigo-200 flex items-center gap-2"
                >
                  <Sparkles size={12} className="text-indigo-500" /> 
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {isLoading && (
             <div className="flex items-center gap-2 text-slate-400 text-sm p-2">
               <Loader2 className="h-4 w-4 animate-spin" /> AI is thinking...
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className={`p-4 border-t transition-colors duration-300 ${
        chatMode === 'reflection' ? 'bg-white/80 backdrop-blur-sm' : 'bg-white'
      }`}>
        <div className="max-w-2xl mx-auto">
          {chatMode === 'reflection' && (
            <div className="text-center text-xs text-indigo-600 mb-2 font-medium">
              You're in Reflection Mode. Take your time to express yourself.
            </div>
          )}
          {showMoodSelector && (
             <div className="mb-4 p-4 bg-slate-50 rounded-xl border animate-in slide-in-from-bottom-2">
                <p className="text-sm font-medium mb-3">How are you feeling?</p>
                <div className="flex justify-between gap-1">
                  {[1,2,3,4,5,6,7,8,9,10].map(num => (
                    <button 
                      key={num} 
                      onClick={() => { setCurrentMood(num); setShowMoodSelector(false); }}
                      className={`w-8 h-8 text-xs rounded-full transition-colors ${
                        currentMood === num ? 'bg-blue-600 text-white' : 'bg-white border hover:bg-slate-100'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
             </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowMoodSelector(!showMoodSelector)}
              className={`transition-all ${currentMood ? "text-blue-600 border-blue-200 bg-blue-50" : ""} ${
                chatMode === 'reflection' ? 'bg-white/80 hover:bg-white border-indigo-200' : ''
              }`}
            >
              {currentMood ? <Smile /> : <Plus />}
            </Button>
            
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading}
              className={`flex-1 transition-all ${
                chatMode === 'reflection' ? 'bg-white/80 border-indigo-200 focus:border-indigo-400' : ''
              }`}
            />
            
            <Button 
              onClick={() => handleSendMessage()} 
              disabled={isLoading || !input.trim()}
              className={chatMode === 'reflection' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}