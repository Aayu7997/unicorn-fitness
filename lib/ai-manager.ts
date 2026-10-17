import { GoogleGenAI } from '@google/genai';

/**
 * A centralized AI manager that handles model execution and robust fallbacks.
 * Split into Admin (High Knowledge) and User (High Speed/Chat).
 */

// --- Helpers ---

// Helper for OpenRouter fetch
const fetchOpenRouter = async (model: string, prompt: string, systemInstruction?: string, requireJson: boolean = false, history: any[] = []) => {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterKey) throw new Error("No OPENROUTER_API_KEY provided.");

  const messages = [];
  if (systemInstruction) messages.push({ role: "system", content: systemInstruction });
  
  if (history.length > 0) {
    messages.push(...history);
  }
  messages.push({ role: "user", content: prompt });

  const body: any = { model, messages };
  if (requireJson) {
    body.response_format = { type: "json_object" };
    messages.push({ role: "system", content: "You MUST reply with ONLY valid JSON." });
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openRouterKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error(`OpenRouter ${model} error: ${await response.text()}`);
  
  const data = await response.json();
  return data.choices[0].message.content;
};

// Helper for Groq fetch (Insanely fast, OpenAI compatible)
const fetchGroq = async (model: string, prompt: string, systemInstruction?: string, requireJson: boolean = false, history: any[] = []) => {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) throw new Error("No GROQ_API_KEY provided.");

  const messages = [];
  if (systemInstruction) messages.push({ role: "system", content: systemInstruction });
  
  if (history.length > 0) {
    messages.push(...history);
  }
  messages.push({ role: "user", content: prompt });

  const body: any = { model, messages };
  if (requireJson) {
    body.response_format = { type: "json_object" };
    messages.push({ role: "system", content: "You MUST reply with ONLY valid JSON." });
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${groqKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error(`Groq ${model} error: ${await response.text()}`);
  
  const data = await response.json();
  return data.choices[0].message.content;
};

// Helper for Groq Stream
export const fetchGroqStream = async (model: string = "openai/gpt-oss-120b", prompt: string, systemInstruction?: string, history: any[] = []) => {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) throw new Error("No GROQ_API_KEY provided.");

  const messages = [];
  if (systemInstruction) messages.push({ role: "system", content: systemInstruction });
  if (history.length > 0) messages.push(...history);
  messages.push({ role: "user", content: prompt });

  const body: any = { model: model || "openai/gpt-oss-120b", messages, stream: true };

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${groqKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error(`Groq stream error: ${await response.text()}`);
  return response.body; // Returns a ReadableStream
};

// Helper for Gemini
const fetchGemini = async (model: string = 'gemini-3.8-flash', prompt: string, systemInstruction?: string, requireJson: boolean = false, history: any[] = [], imageBase64?: string, tools?: any[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const config: any = {};
  if (systemInstruction) config.systemInstruction = systemInstruction;
  if (requireJson) config.responseMimeType = 'application/json';
  if (tools && tools.length > 0) config.tools = tools;

  const contents: any[] = [];
  
  // Format history for Gemini (roles: 'user' | 'model')
  history.forEach(msg => {
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    });
  });
  
  const userParts: any[] = [{ text: prompt }];
  
  if (imageBase64) {
    // Determine mimeType from base64 prefix if exists, default to jpeg
    let mimeType = 'image/jpeg';
    let base64Data = imageBase64;
    
    if (imageBase64.includes('data:image')) {
      mimeType = imageBase64.split(';')[0].split(':')[1];
      base64Data = imageBase64.split(',')[1];
    }
    
    userParts.push({
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    });
  }
  
  contents.push({ role: 'user', parts: userParts });

  const generatePromise = ai.models.generateContent({
    model: model || 'gemini-3.8-flash',
    contents,
    config,
  });

  const response: any = await Promise.race([
    generatePromise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Gemini ${model} request timeout (7s)`)), 7000))
  ]);

  // Handle function call if the model decided to use a tool
  if (response.functionCalls && response.functionCalls.length > 0) {
    return { type: 'function_call', call: response.functionCalls[0] };
  }

  if (!response.text) throw new Error(`Gemini ${model} returned no text.`);
  return { type: 'text', text: response.text };
};


/**
 * ADMIN CONTENT (High Knowledge, Deep Reasoning)
 * Primary: Groq GPT-OSS 120B (Sub-second, 120B reasoning, zero 503 spikes)
 * Backup 1: Groq Qwen 27B
 * Backup 2: Gemini 3.8 Flash (With tool support)
 * Backup 3: OpenRouter GPT-4o-mini / Llama 3.3 70B
 */
export async function generateAdminContent(
  prompt: string,
  systemInstruction?: string,
  requireJson: boolean = false,
  history: any[] = [],
  tools?: any[]
): Promise<any> {
  // 1. Primary: Groq GPT-OSS 120B (Extremely fast, 120B parameters, no 503 high-demand errors)
  try {
    const text = await fetchGroq("openai/gpt-oss-120b", prompt, systemInstruction, requireJson, history);
    console.log("Successfully used Admin Primary: Groq GPT-OSS 120B");
    return text;
  } catch (error) {
    console.warn("Groq 120B primary failed, trying Groq Qwen 27B...", error);
  }

  // 2. Backup 1: Groq Qwen 27B
  try {
    const text = await fetchGroq("qwen/qwen3.8-27b", prompt, systemInstruction, requireJson, history);
    console.log("Successfully used Admin Backup 1: Groq Qwen 27B");
    return text;
  } catch (error) {
    console.warn("Groq Qwen 27B failed, trying Gemini...", error);
  }

  // 3. Backup 2: Gemini 3.8 Flash
  try {
    const result = await fetchGemini('gemini-3.8-flash', prompt, systemInstruction, requireJson, history, undefined, tools);
    console.log("Successfully used Admin Backup 2: Gemini 3.8 Flash");
    if (result.type === 'function_call') {
      return result;
    }
    return result.text;
  } catch (error) {
    console.warn("Gemini 3.8 Flash failed, trying OpenRouter...", error);
  }

  // 4. Backup 3: OpenRouter GPT-4o-mini
  try {
    const text = await fetchOpenRouter("openai/gpt-4o-mini", prompt, systemInstruction, requireJson, history);
    console.log("Successfully used Admin Backup 3: OpenRouter GPT-4o-mini");
    return text;
  } catch (error) {
    console.warn("OpenRouter GPT-4o-mini failed, trying Llama 3.3 70B...", error);
  }

  // 5. Backup 4: OpenRouter Llama 3.3 70B
  try {
    const text = await fetchOpenRouter("meta-llama/llama-3.3-70b-instruct", prompt, systemInstruction, requireJson, history);
    console.log("Successfully used Admin Backup 4: OpenRouter Llama 3.3 70B");
    return text;
  } catch (error) {
    console.error("All Admin AI generations failed.", error);
  }

  throw new Error("All Admin AI generations failed.");
}

/**
 * USER CONTENT (High Speed, Real-time)
 * Primary: Groq GPT-OSS 120B (Lightning fast)
 * Fallback 1: Gemini 3.8 Flash
 * Fallback 2: OpenRouter GPT-4o-mini
 */
export async function generateUserContent(
  prompt: string,
  systemInstruction?: string,
  requireJson: boolean = false,
  history: any[] = [],
  imageBase64?: string
): Promise<string> {
  
  // If an image is provided, we use Gemini vision
  if (imageBase64) {
    try {
      const result = await fetchGemini('gemini-3.8-flash', prompt, systemInstruction, requireJson, history, imageBase64);
      console.log("Successfully used User Vision Model: Gemini 3.8 Flash");
      if (result.type === 'text' && result.text) return result.text;
    } catch (error) {
      console.error("User Vision Model (Gemini) failed...", error);
      throw new Error("Image analysis failed. Please try again.");
    }
  }

  // 1. Primary: Groq GPT-OSS 120B
  try {
    const text = await fetchGroq("openai/gpt-oss-120b", prompt, systemInstruction, requireJson, history);
    console.log("Successfully used User Primary: Groq GPT-OSS 120B");
    return text;
  } catch (error) {
    console.error("User Primary (Groq 120B) failed, trying Groq 20B...", error);
    try {
      const text2 = await fetchGroq("openai/gpt-oss-20b", prompt, systemInstruction, requireJson, history);
      console.log("Successfully used User Primary Backup: Groq GPT-OSS 20B");
      return text2;
    } catch (e2) {
      console.error("User Primary Backup (Groq 20B) failed, trying Fallback 1...", e2);
    }
  }

  // 2. Fallback 1: Gemini 3.8 Flash
  try {
    const result = await fetchGemini('gemini-3.8-flash', prompt, systemInstruction, requireJson, history);
    console.log("Successfully used User Fallback 1: Gemini 3.8 Flash");
    if (result.type === 'text' && result.text) return result.text;
  } catch (error) {
    console.error("User Fallback 1 (Gemini) failed, trying Fallback 2...", error);
  }

  // 3. Fallback 2: OpenRouter GPT-4o-mini
  try {
    const text = await fetchOpenRouter("openai/gpt-4o-mini", prompt, systemInstruction, requireJson, history);
    console.log("Successfully used User Fallback 2: OpenRouter GPT-4o-mini");
    return text;
  } catch (error) {
    console.error("User Fallback 2 (OpenRouter) failed.", error);
  }

  throw new Error("All User AI generations failed.");
}

// Backward compatibility for existing routes
export const generateAdvancedContent = generateUserContent;
