import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Force Next.js to not cache this route
export const dynamic = 'force-dynamic';

// Helper function to pause execution (prevents 429 Errors)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET() {
  console.log("🚀 Starting Safe Embedding Process...");

  // 1. Validate Keys
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // MUST be the Service Role Key
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!sbUrl || !sbKey || !geminiKey) {
    return NextResponse.json({
      error: "Missing Environment Variables. Check .env.local"
    }, { status: 500 });
  }

  try {
    // 2. Initialize Clients
    const supabase = createClient(sbUrl, sbKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "embedding-001" });

    // 3. Fetch Mentors
    const { data: mentors, error } = await supabase
      .from("mentors")
      .select(`
        id, name, bio_for_profile, mentoring_style, confident_queries,
        mentor_internships (company_org, role_position),
        mentor_struggles (area, situation_description, advice_to_junior)
      `);

    if (error) return NextResponse.json({ error: error.message });
    if (!mentors || mentors.length === 0) return NextResponse.json({ error: "No mentors found in DB" });

    const logs = [];

    // 4. Loop through mentors one by one
    for (const mentor of mentors) {
      try {
        // A. Construct the text for AI to read
        const textForAI = `
          Mentor: ${mentor.name}
          Bio: ${mentor.bio_for_profile}
          Style: ${mentor.mentoring_style}
          Topics: ${mentor.confident_queries ? mentor.confident_queries.join(", ") : ""}
          Internships: ${mentor.mentor_internships.map((i: any) => i.company_org).join(", ")}
          Struggles: ${mentor.mentor_struggles.map((s: any) => s.area + ": " + s.situation_description).join(", ")}
        `.replace(/\s+/g, " ").trim();

        // B. Generate Embedding (The Math)
        const result = await model.embedContent(textForAI);
        const embedding = result.embedding.values;

        // C. Save to Database
        const { error: upsertError } = await supabase.from("mentor_embeddings").upsert({
          mentor_id: mentor.id,
          embedding_source_text: textForAI,
          embedding: embedding,
        });

        if (upsertError) throw new Error(upsertError.message);

        logs.push(`✅ Success: ${mentor.name}`);
        console.log(`✅ Processed ${mentor.name}`);

        // D. CRITICAL: Wait 5 seconds before the next one to allow API to cool down
        await delay(5000);

      } catch (err: any) {
        console.error(`❌ Failed for ${mentor.name}:`, err.message);
        logs.push(`❌ Failed: ${mentor.name} (${err.message})`);
        // Wait even if it fails, just to be safe
        await delay(5000);
      }
    }

    return NextResponse.json({ success: true, logs });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}