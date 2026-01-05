
import { GoogleGenAI, Type } from "@google/genai";
import { VerificationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const verifySelfie = async (base64Image: string): Promise<VerificationResult> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Analise esta selfie para fins de emissão de cartão estudantil e matrícula. 
  Verifique se o rosto está claramente visível, bem iluminado, centralizado, com expressão neutra e fundo simples.
  Retorne a análise em formato JSON em português.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING },
            details: {
              type: Type.OBJECT,
              properties: {
                lighting: { type: Type.STRING },
                expression: { type: Type.STRING },
                background: { type: Type.STRING },
                framing: { type: Type.STRING }
              },
              required: ["lighting", "expression", "background", "framing"]
            }
          },
          required: ["isValid", "feedback", "details"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as VerificationResult;
  } catch (error) {
    console.error("Erro na verificação:", error);
    throw error;
  }
};
