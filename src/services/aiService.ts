import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const aiService = {
  async generateChecklist(date: string, theme: string = "Classic") {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a list of 5 essential wedding planning tasks for a wedding on ${date} with a ${theme} theme. Return a JSON array of objects with 'title' and 'category'.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                category: { type: Type.STRING },
              },
              required: ["title", "category"],
            },
          },
        },
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error("AI Checklist Error:", error);
      return [];
    }
  },

  async suggestBudgetAllocation(totalBudget: number) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Suggest a budget allocation for a wedding with a total budget of $${totalBudget}. Provide allocations for Venue, Catering, Photography, Flowers, and Attire. Return a JSON array of objects with 'category' and 'amount'.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                amount: { type: Type.NUMBER },
              },
              required: ["category", "amount"],
            },
          },
        },
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error("AI Budget Error:", error);
      return [];
    }
  },

  async draftInquiry(vendorName: string, vendorType: string, weddingDetails: string) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Draft a professional and friendly initial inquiry message to a wedding vendor named ${vendorName} who provides ${vendorType} services. Some background context: ${weddingDetails}. Return a single string.`,
      });

      return response.text;
    } catch (error) {
      console.error("AI Drafting Error:", error);
      return "Hi, we are interested in your services for our wedding. Could you tell us more?";
    }
  }
};
