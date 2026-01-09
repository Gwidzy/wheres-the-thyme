
import { GoogleGenAI } from "@google/genai";
import type { Project, Task, TimeEntry } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getProductivityInsights(
  projects: Project[],
  tasks: Task[],
  timeEntries: TimeEntry[]
): Promise<string> {
  if (!process.env.API_KEY) {
    return "API Key is not configured. Please set the API_KEY environment variable to use this feature.";
  }
  
  const model = ai.models;

  const data = {
    projects,
    tasks,
    timeEntries: timeEntries.map(entry => ({
      ...entry,
      durationMinutes: Math.round(entry.duration / 60)
    }))
  };

  const prompt = `
    You are a productivity expert. Analyze the following project and time tracking data for a user.
    Provide actionable insights and a summary of their work.
    The data is in JSON format. All timestamps are in Unix milliseconds and durations are in seconds.

    Data:
    ${JSON.stringify(data, null, 2)}

    Based on the data, provide the following:
    1.  A brief, encouraging summary of the work done.
    2.  Identify the project with the most time logged.
    3.  Identify the day of the week with the highest productivity (most time logged).
    4.  Offer one specific, actionable suggestion for improving focus or time management.
    5.  Keep the entire response concise and formatted as Markdown. Use headings and bullet points.
    `;
    
  try {
    const response = await model.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error generating productivity insights:", error);
    if (error instanceof Error) {
        return `An error occurred while analyzing your data: ${error.message}`;
    }
    return "An unknown error occurred while analyzing your data.";
  }
}
