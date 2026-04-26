import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextRequest, NextResponse } from "next/server"

// Initialize Gemini API (Ensure GEMINI_API_KEY is in your environment variables)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

const SYSTEM_PROMPT = `You are an empathetic, professional Kenyan educator. Your job is to take a teacher's raw, jargon-heavy notes and a CBC rubric score (EE = Exceeding Expectations, ME = Meeting Expectations, AE = Approaching Expectations, BE = Below Expectations) and translate them into a warm, encouraging, and easy-to-understand message for a Kenyan parent. Explain what the rubric score means in plain language, celebrate the child's effort, and provide one practical, hyper-local, low-cost activity the parent can do at home to support the child's specific learning gap. Format the response beautifully with paragraphs.`

export async function POST(req: NextRequest) {
  try {
    const { studentId, subject, rubricScore, teacherNotes } = await req.json()

    // 1. Call Gemini API for translation
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    
    const prompt = `
      Subject: ${subject}
      Rubric Score: ${rubricScore}
      Teacher Notes: ${teacherNotes}
    `

    const result = await model.generateContent([SYSTEM_PROMPT, prompt])
    const aiTranslatedNote = result.response.text()

    // 2. Save to Cloudflare D1
    // Note: In Cloudflare Pages, the D1 binding is usually available on the request context 
    // or via process.env in newer Next.js versions on Cloudflare.
    // Assuming 'DB' is the binding name.
    const db = (process.env as any).DB
    
    if (db) {
      // Find subject ID (in a real app, you'd have these IDs in the frontend)
      const subjectRow: any = await db.prepare("SELECT id FROM Subjects WHERE name = ?").bind(subject).first()
      const subjectId = subjectRow?.id || 1

      await db.prepare(`
        INSERT INTO Assessments (student_id, subject_id, rubric_score, teacher_notes, ai_translated_note)
        VALUES (?, ?, ?, ?, ?)
      `).bind(studentId, subjectId, rubricScore, teacherNotes, aiTranslatedNote).run()
    } else {
      console.warn("D1 Database binding 'DB' not found. Skipping persistence.")
    }

    return NextResponse.json({ success: true, translatedNote: aiTranslatedNote })
  } catch (error: any) {
    console.error("Error in translation route:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
