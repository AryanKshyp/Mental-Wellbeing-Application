"use server";

import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "embedding-001" });

export async function updateMentorEmbedding(mentorId: string) {
    const supabase = await createClient();

    // 1. Fetch the Mentor Data required for AI
    const { data: mentor, error } = await supabase
        .from("mentors")
        .select(`
      id, name, bio_for_profile, mentoring_style, confident_queries,
      mentor_internships (company_org, role_position),
      mentor_struggles (area, situation_description, advice_to_junior)
    `)
        .eq("id", mentorId)
        .single();

    if (error || !mentor) {
        console.error("❌ Error fetching mentor for embedding:", error);
        return { success: false, error: error?.message };
    }

    try {
        // 2. Prepare the text string for Gemini
        const textForAI = `
      Name: ${mentor.name}
      Bio: ${mentor.bio_for_profile}
      Style: ${mentor.mentoring_style}
      Topics: ${mentor.confident_queries?.join(", ")}
      Internships: ${mentor.mentor_internships?.map((i: any) => `${i.role_position} at ${i.company_org}`).join(", ")}
      Struggles: ${mentor.mentor_struggles?.map((s: any) => `${s.area}: ${s.situation_description}`).join(", ")}
    `.replace(/\s+/g, " ").trim();

        // 3. Generate Embedding
        const result = await model.embedContent(textForAI);
        const embedding = result.embedding.values;

        // 4. Save to Database
        const { error: upsertError } = await supabase.from("mentor_embeddings").upsert({
            mentor_id: mentorId,
            embedding_source_text: textForAI,
            embedding: embedding,
        });

        if (upsertError) throw upsertError;

        return { success: true };

    } catch (err: any) {
        console.error("❌ Embedding generation failed:", err.message);
        return { success: false, error: err.message };
    }
}