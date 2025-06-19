import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY!)

export async function POST(req: Request) {
    try {
        const { feature, description } = await req.json()
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
        
        // Structured prompt to ensure JSON response
        const prompt = `
        Create a development task breakdown for this feature as JSON.
        Feature: ${feature}
        Description: ${description}

        Rules:
        1. Respond ONLY with valid JSON
        2. Format must be an array of tasks
        3. Each task must have exactly these fields:
           - title (string)
           - description (string)
           - estimate (number)
        4. No additional text or explanations
        5. No markdown or code formatting

        Example structure:
        [
          {
            "title": "Task name",
            "description": "Task description",
            "estimate": 2
          }
        ]`

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }]}],
            generationConfig: {
                temperature: 0.3,
                topK: 40,
                topP: 0.8,
            }
        })

        const text = result.response.text()
        
        // Extract JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        if (!jsonMatch) {
            throw new Error('No valid JSON found in response')
        }

        const tasks = JSON.parse(jsonMatch[0])

        // Validate task structure
        if (!Array.isArray(tasks) || !tasks.every(task => 
            typeof task.title === 'string' &&
            typeof task.description === 'string' &&
            typeof task.estimate === 'number'
        )) {
            throw new Error('Invalid task structure')
        }

        return Response.json({ 
            success: true, 
            tasks 
        })

    } catch (error: any) {
        console.error('AI Task Generation Error:', error)
        return Response.json({ 
            success: false, 
            error: error?.message || 'Failed to generate tasks'
        }, { 
            status: 500 
        })
    }
}