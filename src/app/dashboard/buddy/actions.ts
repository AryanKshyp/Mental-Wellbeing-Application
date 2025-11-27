'use server';

import { createServerClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI, Content } from '@google/generative-ai';
import { Database } from "@/types/database.types";

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("Missing GEMINI_API_KEY environment variable.");
}
const genAI = new GoogleGenerativeAI(apiKey || '');

// Define Types
type MessageInsert = Database['public']['Tables']['messages']['Insert'];
type ChatMode = 'common' | 'reflection';

// --- PROMPTS ---

const COMMON_PROMPT = `
You are IITB AI Buddy — a warm, concise, IIT Bombay–aware mentor.
You help students with academics, clubs, careers, emotions, and wellbeing using a friendly senior-like tone.

🎓 Identity & Tone
Warm, conversational, non-judgmental.
Never robotic, preachy, or overly long.
Sound like an IITB senior/alum who genuinely cares.
Use short validating lines: "Totally get why that feels heavy.", "Many IITB students feel similar."

🧠 Campus Knowledge
Be aware of IITB clubs, tech teams, POR culture, MI/Techfest cycles, workloads, hostel life, internship patterns, FOMO, comparison, burnout.

💛 Dual Role
1. Mentor: academics, skill roadmaps, clubs, internships
2. Wellbeing Buddy: stress, burnout, self-doubt

✨ Feature-Aware Suggestions (Short, Optional)
Suggest platform features only when relevant (TalkSpace, Journalling, Habit Tracker).

💬 Response Structure
1. Validate feelings
2. Add IITB-specific insight (short)
3. Give a clear, simple next step
4. Ask one gentle question (optional)

🛑 Avoid
Long messages, Judgment, Diagnosing mental health issues, Generic ChatGPT advice.
`;

const REFLECTION_PROMPT = `
You are Haven Reflect, IITB’s journalling & self-reflection companion.
Your purpose is to guide students through short, flowing reflective prompts.

🎭 Tone
Calm, warm, slow-paced, short, concise, emotionally grounding.
Do not lecture. Do not give advice until journalling is finished.

✍️ How Journalling Mode Works
1. Start with a very short opening question.
2. Ask follow-up reflection prompts — one at a time.
3. Stop when the student shows they’re done.

🧠 After Journalling
A. Summarise reflections (3-4 lines).
B. Ask if they want an "analysis" (gentle patterns).
C. Ask if they want suggestions.

🛑 Never Do
Long messages, Multiple questions at once, Push emotional depth, Diagnose issues.
`;

// --- SERVER ACTIONS ---

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
  chatMode: ChatMode = 'common'
) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Unauthorized');

    const message: MessageInsert = {
      user_id: user.id,
      role,
      content,
      mood_rating: moodRating ?? null,
      mood_notes: moodNotes ?? null,
      chat_mode: chatMode,
      // created_at is usually handled by default in Postgres, but sending it is fine
      created_at: new Date().toISOString() 
    };

    const { error } = await (supabase as any)
      .from('messages')
      .insert([message]);

    if (error) throw error;
    return message;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
}

export async function getChatHistory() {
  try {
    const supabase = await createServerClient();
    const user = await getUserSession();
    
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return []; // Return empty array instead of throwing to prevent UI crash
  }
}

export async function generateResponse(
  history: { role: string; content: string }[] = [],
  message: string,
  mode: ChatMode
) {
  try {
    // 1. Select System Prompt
    const systemInstruction = mode === 'reflection' ? REFLECTION_PROMPT : COMMON_PROMPT;

    // 2. Initialize Model
    // Note: 'gemini-2.5-flash' does not exist yet. Using 'gemini-1.5-flash'
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction
    });

    // 3. Format History for Gemini SDK
    // SDK expects: { role: 'user' | 'model', parts: [{ text: string }] }
    let formattedHistory: Content[] = history
      .slice(-20) // Keep last 20 messages context
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

    // 4. Sanitize History
    // Ensure the history starts with a user message
    while (formattedHistory.length > 0 && formattedHistory[0].role !== 'user') {
      formattedHistory.shift();
    }
    // If no user message is found, ensure we have at least the current message
    if (formattedHistory.length === 0) {
      return "I'm not sure how to respond to that. Could you try rephrasing?";
    }

    // 5. Start Chat
    const chat = model.startChat({
      history: formattedHistory,
    });

    // 6. Send Message
    const result = await chat.sendMessage(message);
    const response = result.response.text();
    
    return response;

  } catch (error) {
    console.error('AI Generation Error:', error);
    // Fallback response to keep the UI graceful
    return "I'm having a little trouble thinking clearly right now. Could you ask me that again?";
  }
}