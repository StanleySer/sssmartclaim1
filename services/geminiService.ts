import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedReceiptData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const extractReceiptInfo = async (file: File): Promise<ExtractedReceiptData> => {
  try {
    const base64Data = await fileToBase64(file);

    const prompt = `
      Analyze this receipt image and extract the following information into a JSON object:
      1. date: The date of the transaction (format as DD.MM.YYYY).
      2. merchant: The name of the store or company.
      3. total: The total amount paid (numeric only).
      
      If you cannot find a specific field, return null for that field.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            merchant: { type: Type.STRING },
            total: { type: Type.NUMBER }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as ExtractedReceiptData;

  } catch (error) {
    console.error("Error extracting receipt info:", error);
    // Return empty/partial object on failure so the user can manually fill it
    return {};
  }
};
