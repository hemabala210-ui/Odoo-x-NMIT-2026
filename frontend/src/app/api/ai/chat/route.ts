import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in the server environment. Please add it to your .env file." },
        { status: 500 }
      );
    }

    // 1. Fetch organizational context from Prisma
    // For this prototype, we'll fetch a summary of employees and recent leaves
    // to give the AI context about the company.
    const employees = await prisma.employee.findMany({
      take: 20, // Limit to 20 for token reasons
      include: {
        user: { select: { name: true, email: true } },
        attendance: { take: 5, orderBy: { date: 'desc' } },
        leaves: { take: 5, orderBy: { startDate: 'desc' } },
      }
    });

    const anomalies = await prisma.anomalyFlag.findMany({
      where: { resolvedBool: false },
      take: 10,
      include: {
        employee: { include: { user: true } }
      }
    });

    // 2. Build the AI Prompt with the Context
    const systemInstruction = `
      You are Dayflow AI, an advanced AI assistant embedded within a Human Operations Command System. 
      Your job is to analyze workforce telemetry, attendance, payroll, and employee data, and provide concise, professional, and highly intelligent insights.
      
      You have access to the following live database context (formatted as JSON):
      ---
      EMPLOYEES (Recent):
      ${JSON.stringify(employees, null, 2)}
      
      ACTIVE ANOMALIES:
      ${JSON.stringify(anomalies, null, 2)}
      ---
      
      If the user asks about an employee (like "Alice Johnson"), look through the EMPLOYEES data to find them, summarize their recent attendance, any leaves they've taken, and check if they have any active anomalies. 
      Respond in a premium, professional, slightly sci-fi/operational tone. Keep it concise. Format your response with markdown if necessary.
    `;

    // 3. Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 4. Generate Content
    const result = await model.generateContent([
      systemInstruction,
      `User Query: ${message}`
    ]);

    const responseText = result.response.text();

    return NextResponse.json({ response: responseText });

  } catch (error: any) {
    console.error("Dayflow AI Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process AI request" }, { status: 500 });
  }
}
