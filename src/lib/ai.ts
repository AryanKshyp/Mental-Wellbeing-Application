import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function processAllMentors() {
  console.log("🚀 Starting process...");

  // 1. Define keys INSIDE the function (Runtime check)
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // 2. Debugging: This will print to your terminal when you visit the route
  console.log("Debug Keys:", {
    url: sbUrl ? "Exists" : "Missing",
    key: sbKey ? "Exists" : "Missing",
    ai: geminiKey ? "Exists" : "Missing"
  });

  if (!sbUrl || !sbKey || !geminiKey) {
    throw new Error("Missing Environment Variables. Check terminal logs.");
  }

  // 3. Initialize Clients INSIDE the function
  const supabase = createClient(sbUrl, sbKey, {
    auth: { persistSession: false }
  });

  const genAI = new GoogleGenerativeAI(geminiKey);
  const model = genAI.getGenerativeModel({ model: "embedding-001" });

  // 4. Run Logic
  const { data: mentors, error } = await supabase
    .from("mentors")
    .select(`
      id, name, bio_for_profile, mentoring_style, confident_queries,
      mentor_internships (company_org, role_position),
      mentor_struggles (area, situation_description, advice_to_junior)
    `);

  if (error) throw new Error(error.message);
  if (!mentors?.length) return ["No mentors found"];

  const results = [];

  for (const mentor of mentors) {
    const text = `
      Mentor: ${mentor.name}
      Bio: ${mentor.bio_for_profile}
      Style: ${mentor.mentoring_style}
      Topics: ${mentor.confident_queries?.join(", ")}
      Internships: ${mentor.mentor_internships?.map((i: any) => i.company_org).join(", ")}
      Struggles: ${mentor.mentor_struggles?.map((s: any) => s.area).join(", ")}
    `.replace(/\s+/g, " ").trim();

    try {
      const { embedding } = await model.embedContent(text);

      const { error: upsertError } = await supabase.from("mentor_embeddings").upsert({
        mentor_id: mentor.id,
        embedding_source_text: text,
        embedding: embedding.values,
      });

      if (upsertError) throw upsertError;
      results.push(`✅ Saved: ${mentor.name}`);
    } catch (e: any) {
      console.error(e);
      results.push(`❌ Error: ${mentor.name}`);
    }
  }

  return results;
}