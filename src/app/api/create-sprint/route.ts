import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY!)

export async function POST(req: Request) {
  try {
    const { name, duration, mainGoal, teamSize, notes } = await req.json()
    const prompt = `
You are an agile project manager. Given the following info, generate a sprint plan:
Sprint Name: ${name}
Duration: ${duration} days
Main Feature/Goal: ${mainGoal}
Team Size: ${teamSize || "N/A"}
Special Notes: ${notes || "N/A"}

Return ONLY valid JSON in this format:
{
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "goals": ["goal 1", "goal 2", ...],
  "tasks": [
    {
      "title": "Task title",
      "description": "Task description",
      "estimate": "hours",
      "status": "pending"
    }
  ]
}
Do not include any explanation or markdown.
Sprint should be realistic for the duration and team size.
Start date should be today, end date should be today + duration days.
`
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("No valid JSON found in response")
    const parsed = JSON.parse(jsonMatch[0])
    return Response.json({ success: true, sprint: {
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      goals: parsed.goals,
    }, tasks: parsed.tasks })
  } catch (error: any) {
    return Response.json({ success: false, error: error?.message || "AI error" }, { status: 500 })
  }
}