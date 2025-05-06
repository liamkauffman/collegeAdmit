import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define schema for example questions - removed min/max constraints
const ExampleQuestionsSchema = z.object({
  questions: z.array(z.string())
});

export async function POST(request) {
  try {
    const { userProfile } = await request.json();
    
    // Generate context-based on user profile
    let contextPrompt = "Generate example college search questions";
    
    if (userProfile) {
      contextPrompt += " tailored to this student profile:";
      
      if (userProfile.interests) {
        contextPrompt += ` Interests: ${userProfile.interests.join(", ")}.`;
      }
      
      if (userProfile.location) {
        contextPrompt += ` Location: ${userProfile.location}.`;
      }
      
      if (userProfile.testScores) {
        contextPrompt += ` Test scores: ${JSON.stringify(userProfile.testScores)}.`;
      }
      
      if (userProfile.academicPreferences) {
        contextPrompt += ` Academic preferences: ${userProfile.academicPreferences.join(", ")}.`;
      }
      
      if (userProfile.extracurriculars) {
        contextPrompt += ` Extracurricular activities: ${userProfile.extracurriculars.join(", ")}.`;
      }
    } else {
      contextPrompt += " that are diverse and cover different aspects of college search.";
    }
    
    // Add explicit instructions about number of questions
    contextPrompt += " Generate exactly 4 questions.";
    
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are a helpful assistant that generates example college search queries. Create diverse, specific questions that help students find colleges matching their needs and interests. Always generate exactly 4 queries. Make the questions very concise, just a few words." 
        },
        { 
          role: "user", 
          content: contextPrompt
        },
      ],
      response_format: zodResponseFormat(ExampleQuestionsSchema, "exampleQuestions"),
    });
    
    // Default questions in case the API fails
    const defaultQuestions = [
      "Show me liberal arts colleges with strong computer science programs",
      "What are the best colleges for pre-med students on the East Coast?",
      "Find public universities with good financial aid in California",
      "Which colleges have strong engineering programs and Division I sports?"
    ];
    
    let questions;
    
    if (completion.choices[0]?.message?.parsed?.questions) {
      questions = completion.choices[0].message.parsed.questions;
      
      // Ensure we have exactly 4 questions
      if (questions.length > 4) {
        questions = questions.slice(0, 4);
      } else if (questions.length < 4) {
        // Fill with default questions if we have less than 4
        const remainingCount = 4 - questions.length;
        questions = [...questions, ...defaultQuestions.slice(0, remainingCount)];
      }
    } else {
      questions = defaultQuestions;
    }
    
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error generating example questions:", error);
    
    // Return default questions if there's an error
    return NextResponse.json({ 
      questions: [
        "Show me liberal arts colleges with strong computer science programs",
        "What are the best colleges for pre-med students on the East Coast?",
        "Find public universities with good financial aid in California",
        "Which colleges have strong engineering programs and Division I sports?"
      ]
    });
  }
} 