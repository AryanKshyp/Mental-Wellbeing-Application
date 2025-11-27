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
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  moodRating?: number | null;
  moodNotes?: string | null;
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
        const history = await getChatHistory() as DbMessage[]; // Cast the return type
        if (history && history.length > 0) {
          const transformedHistory = history.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            createdAt: msg.created_at
          })) as Message[];
          setMessages(transformedHistory);
        } else {
          setMessages([{
            id: 'welcome',
            role: 'assistant',
            content: "Hello! I'm your AI Buddy. How are you feeling today?",
            createdAt: new Date().toISOString()
          }]);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    initChat();
  }, [router]);

  // Scroll to bottom effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (customContent?: string) => {
    const messageContent = customContent || input.trim();
    if (!messageContent || !userId) return;

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

    // Optimistic Update
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // 1. Save User Message
      // We don't need the result, just waiting for it to save
      await saveMessage('user', messageContent, currentMood ?? null, moodNotes ?? null, chatMode);

      // 2. Generate Response using Server Action
      const aiResponseContent = await generateResponse(
        messages.map(m => ({ role: m.role, content: m.content })), // Pass history context
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
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-white">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Bot className="text-blue-500" /> AI Buddy
        </h1>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <Button
            variant={chatMode === 'common' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setChatMode('common')}
          >
            Chat
          </Button>
          <Button
             variant={chatMode === 'reflection' ? 'default' : 'ghost'}
             size="sm"
             onClick={() => setChatMode('reflection')}
          >
            Reflection
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border shadow-sm'
              }`}>
                {msg.moodRating && (
                   <div className="text-xs mb-1 opacity-80 flex items-center gap-1">
                      Mood: {msg.moodRating}/10
                   </div>
                )}
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {/* Reflection Prompts Injection */}
          {chatMode === 'reflection' && messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && !isLoading && (
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {REFLECTION_PROMPTS.slice(0, 3).map((prompt, i) => (
                <button 
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-xs bg-indigo-50 text-indigo-700 px-3 py-2 rounded-full hover:bg-indigo-100 transition-colors border border-indigo-100 flex items-center gap-1"
                >
                  <Sparkles size={12} /> {prompt}
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
      <div className="p-4 bg-white border-t">
        <div className="max-w-2xl mx-auto">
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
              className={currentMood ? "text-blue-600 border-blue-200 bg-blue-50" : ""}
            >
              {currentMood ? <Smile /> : <Plus />}
            </Button>
            
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            
            <Button onClick={() => handleSendMessage()} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}