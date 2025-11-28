"use server";

import { createServerClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

type MentorInternship = {
  company_org: string;
  role_position: string;
};

type MentorStruggle = {
  area: string;
  situation_description: string;
  advice_to_junior: string;
};

type Mentor = {
  id: string;
  name: string;
  bio_for_profile: string;
  mentoring_style: string;
  confident_queries: string[];
  mentor_internships: MentorInternship[];
  mentor_struggles: MentorStruggle[];
};

type MentorEmbedding = {
  mentor_id: string;
  embedding_source_text: string;
  embedding: number[];
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "embedding-001" });

export async function updateMentorEmbedding(mentorId: string) {
  const supabase = await createServerClient();

  // 1. Fetch the Mentor Data required for AI
  const { data, error } = await supabase 
    .from("mentors")
    .select(`
      id, 
      name, 
      bio_for_profile, 
      mentoring_style, 
      confident_queries,
      mentor_internships (company_org, role_position),
      mentor_struggles (area, situation_description, advice_to_junior)
    `)
    .eq("id", mentorId)
    .single();
  
  const mentor = data as Mentor | null;

  if (error || !mentor) {
    console.error(" Error fetching mentor for embedding:", error);
    return { success: false, error: error?.message };
  }

  try {
    // 2. Prepare the text string for Gemini
    const textForAI = `
      Name: ${mentor?.name || 'N/A'}
      Bio: ${mentor?.bio_for_profile || 'N/A'}
      Style: ${mentor?.mentoring_style || 'N/A'}
      Topics: ${mentor?.confident_queries?.join(", ") || 'N/A'}
      Internships: ${mentor?.mentor_internships?.map(i => `${i.role_position} at ${i.company_org}`).join(", ") || 'N/A'}
      Struggles: ${mentor?.mentor_struggles?.map(s => `${s.area}: ${s.situation_description}`).join(", ") || 'N/A'}
    `.replace(/\s+/g, " ").trim();

    // 3. Generate Embedding
    const result = await model.embedContent(textForAI);
    const embedding = result.embedding.values;

    // 4. Save to Database
    const { error: upsertError } = await (supabase as any)
      .from("mentor_embeddings")
      .upsert({
        mentor_id: mentorId,
        embedding_source_text: textForAI,
        embedding: embedding,
      });

    if (upsertError) throw upsertError;

    return { success: true };
  } catch (err: any) {
    console.error(" Embedding generation failed:", err.message);
    return { success: false, error: err.message };
  }
}