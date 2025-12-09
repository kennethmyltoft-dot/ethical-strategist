import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';

let chatSession: Chat | null = null;

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const initializeChat = () => {
  try {
    const ai = getClient();
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, // Balance between creativity and strict adherence to the persona
      },
    });
    return chatSession;
  } catch (error) {
    console.error("Failed to initialize chat:", error);
    throw error;
  }
};

export const sendMessageStream = async function* (message: string) {
  if (!chatSession) {
    initializeChat();
  }

  if (!chatSession) {
    throw new Error("Chat session could not be established");
  }

  try {
    const result = await chatSession.sendMessageStream({ message });

    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        yield c.text;
      }
    }
  } catch (error) {
    console.error("Error in sendMessageStream:", error);
    // Attempt to reset session on error
    chatSession = null;
    throw error;
  }
};

export const resetChat = () => {
  chatSession = null;
  initializeChat();
};