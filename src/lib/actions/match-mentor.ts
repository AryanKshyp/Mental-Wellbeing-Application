"use server";

import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- 1. DEFINE THE BRAIN (SYSTEM PROMPT) ---
const SYSTEM_INSTRUCTION = `
You are an expert Mentor Matchmaking AI for a university platform.
Your goal is to connect students with the **top 2 most relevant mentors** from the provided list based on their query.

### MATCHING RULES (In Order of Priority):
1. **Club & Activity Match:** If the user asks about a specific Club, Tech Team, or Student Body (e.g., "Racing", "Enactus", "Exhibitions", "Design Club"), YOU MUST prioritize mentors who are explicitly part of those **Groups**.
2. **Topic & Career Match:** If the user asks about a specific career or skill (e.g., "Consulting", "Google", "Research", "Coding"), prioritize mentors with that specific **Internship** or **Tag**.
3. **Emotional Resonance:** If the user expresses anxiety, loneliness, burnout, or failure, prioritize mentors who have listed similar **Struggles** (e.g., "Academic Failure", "Isolation").
4. **Role Match:** If the user explicitly asks for an "Alumni" or "Professor", strictly filter for that.

### OUTPUT FORMAT:
Return ONLY a valid JSON Array of objects with the 'id' of the selected mentors.
Example: [ { "id": "uuid-1" }, { "id": "uuid-2" } ]
`;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-pro",
    systemInstruction: SYSTEM_INSTRUCTION
});

export async function findBestMentor(userQuery: string) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
        // --- 2. FETCH RICH DATA FROM 'mentors2' ---
        const { data: mentors, error } = await supabase
            .from("mentors2")
            .select("*");

        if (error) throw new Error(`Supabase Error: ${error.message}`);
        if (!mentors || mentors.length === 0) return { success: false, message: "No mentors in DB" };

        // --- 3. PREPARE CONTEXT FOR AI ---
        const mentorsContext = mentors.map((m) => ({
            id: m.mentor_id,
            name: m.name,
            role: m.user_type,
            bio: m.bio_for_profile,
            tags: m.confident_queries,
            // Detailed Context fields for the AI to analyze
            internship: m.company_org ? `${m.internship_role_position} at ${m.company_org}` : "None",
            struggles: m.struggle_area ? `${m.struggle_area}: ${m.struggle_situation_description}` : "None",
            groups: [m.group_name_1, m.group_name_2].filter(Boolean).join(", ")
        }));

        const prompt = `
      USER QUERY: "${userQuery}"
      
      CANDIDATE MENTORS:
      ${JSON.stringify(mentorsContext)}
    `;

        // --- 4. CALL GEMINI ---
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean JSON
        const cleanJson = text.replace(/```json|```/g, "").trim();
        const bestMatches = JSON.parse(cleanJson);

        // --- 5. RETURN FULL OBJECTS ---
        const matchedMentors = bestMatches
            .map((match: any) => mentors.find((m) => m.mentor_id === match.id))
            .filter(Boolean);

        if (matchedMentors.length === 0) return { success: false, message: "No suitable match found." };

        return { success: true, mentors: matchedMentors };

    } catch (error: any) {
        console.error("AI Match Error:", error);
        return { success: false, message: error.message || "AI Service Failed" };
    }
}

// --- (OPTIONAL) ONE-LINER BIO FUNCTION ---
export async function generateBioSummary(bioText: string) {
    try {
        const prompt = `
      Read this mentor's bio: "${bioText}"
      Task: Summarize this into EXACTLY ONE catchy, professional sentence (under 15 words).
      Return ONLY the text.
    `;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        return bioText.substring(0, 50) + "...";
    }
}