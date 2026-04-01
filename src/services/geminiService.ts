import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const INTERIOR_STYLES = [
  { id: 'scandinavian', name: 'Scandinavian', description: 'Minimalist, functional, and cozy with light woods and neutral tones.' },
  { id: 'mid-century', name: 'Mid-Century Modern', description: 'Retro-inspired with clean lines, organic shapes, and bold accents.' },
  { id: 'industrial', name: 'Industrial', description: 'Raw materials like exposed brick, metal, and reclaimed wood.' },
  { id: 'bohemian', name: 'Bohemian', description: 'Eclectic, colorful, and full of textures and global patterns.' },
  { id: 'minimalist', name: 'Minimalist', description: 'Simple, clutter-free, and focused on essential elements.' },
  { id: 'japandi', name: 'Japandi', description: 'A blend of Japanese aesthetics and Scandinavian functionality.' },
];

export async function generateRoomMakeover(base64Image: string, style: string, prompt?: string) {
  const model = ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image.split(',')[1],
            mimeType: 'image/png',
          },
        },
        {
          text: `Reimagine this room in a ${style} style. ${prompt || ''} Maintain the basic layout and structure of the room but completely transform the furniture, decor, wall colors, and lighting to match the ${style} aesthetic. High quality, professional interior design photography.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K"
      }
    }
  });

  const response = await model;
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to generate image");
}

export async function chatWithConsultant(message: string, history: any[], currentImage?: string) {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are an expert AI Interior Design Consultant. 
      Your goal is to help users refine their room makeovers. 
      When users ask for refinements, suggest specific changes. 
      When users ask for where to buy items, provide shoppable links or store suggestions using Google Maps grounding if relevant.
      Be professional, creative, and encouraging.
      If an image is provided, analyze it to give specific advice.`,
      tools: [{ googleSearch: {} }, { googleMaps: {} }],
    },
    history: history,
  });

  const contents: any[] = [{ text: message }];
  if (currentImage) {
    contents.push({
      inlineData: {
        data: currentImage.split(',')[1],
        mimeType: 'image/png'
      }
    });
  }

  const response = await chat.sendMessage({
    message: message,
  });

  return {
    text: response.text,
    groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
}
