'use server';

import { createServerClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Database } from '@/types/database.types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Define the precise Insert type for clean usage
type MessageInsert = Database['public']['Tables']['messages']['Insert'];

export async function getUserSession() {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function saveMessage(
  role: 'user' | 'assistant',
  content: string,
  moodRating?: number | null,
  moodNotes?: string | null,
  chatMode: 'common' | 'reflection' = 'common'
) {
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // 3. Strictly type the object to match the Database Insert type
  const messageData: MessageInsert = {
    user_id: user.id,
    role: role,
    content: content,
    // Ensure nulls are handled exactly as DB expects
    mood_rating: moodRating ?? null, 
    mood_notes: moodNotes ?? null,
    chat_mode: chatMode
  };

  const { data, error } = await supabase
    .from('messages')
    .insert([messageData]) 
    .select()
    .single();

  if (error) {
    console.error('Error saving message:', error);
    return null;
  }
  return data;
}

export async function getChatHistory() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
  return data;
}

export async function generateResponse(
  history: { role: string; content: string }[],
  currentMessage: string,
  mode: 'common' | 'reflection'
) {
  try {
    const commonPrompt = `
      You are a friendly, supportive AI companion named "Buddy".
      - Tone: Casual, warm, and empathetic.
      - Style: Keep responses concise (1-3 sentences) unless the user asks for more.
      - Usage: Use emojis occasionally to feel human-like.
      - Goal: Just be there for the user, chat about their day, and offer light support.
    `;

    const reflectionPrompt = `
      You are an empathetic Reflection Coach.
      - Goal: Help the user process emotions, find gratitude, or solve problems.
      - Method: Use techniques from CBT and Active Listening.
      - Style: Ask one open-ended, thought-provoking question at a time.
      - Constraint: Do not give long lectures. Listen, validate, and gently guide.
      - Tone: Calming, professional but warm.
    `;

    const systemInstruction = mode === 'reflection' ? reflectionPrompt : commonPrompt;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction 
    });

    const formattedHistory = history
      .slice(-30) 
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(currentMessage);
    const response = result.response.text();
    
    return response;

  } catch (error) {
    console.error('AI Generation Error:', error);
    return "I'm having a little trouble thinking clearly right now. Could you ask me that again?";
  }
}