/**
 * Google Gemini API Wrapper for Hyble Core
 * Supports Gemini Pro, Ultra, and Vision models
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Types
export type GeminiModel =
  | "gemini-2.0-flash-exp"
  | "gemini-1.5-pro"
  | "gemini-1.5-flash"
  | "gemini-1.5-flash-8b";

export interface GeminiMessage {
  role: "user" | "model";
  parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }>;
}

export interface GeminiResponse {
  content: string;
  model: string;
  promptTokens?: number;
  candidateTokens?: number;
  finishReason?: string;
}

export interface GeminiStreamChunk {
  type: "text" | "done" | "error";
  content?: string;
  error?: string;
}

export interface GeminiOptions {
  model?: GeminiModel;
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
}

export interface ImageAnalysisResult {
  description: string;
  labels: string[];
  colors: string[];
  objects: Array<{ name: string; confidence: number }>;
  text?: string;
  isNSFW: boolean;
  suggestions: string[];
}

// Default options
const DEFAULT_OPTIONS: Required<Omit<GeminiOptions, "stopSequences">> = {
  model: "gemini-1.5-flash",
  maxOutputTokens: 4096,
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
};

// Safety settings
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Gemini client singleton
let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY or GOOGLE_AI_API_KEY environment variable is required");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Send a message to Gemini and get a response
 */
export async function sendMessage(
  messages: GeminiMessage[],
  options: GeminiOptions = {}
): Promise<GeminiResponse> {
  const client = getClient();
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const model = client.getGenerativeModel({
    model: opts.model,
    safetySettings,
    generationConfig: {
      maxOutputTokens: opts.maxOutputTokens,
      temperature: opts.temperature,
      topP: opts.topP,
      topK: opts.topK,
      stopSequences: options.stopSequences,
    },
  });

  const chat = model.startChat({
    history: messages.slice(0, -1).map(m => ({
      role: m.role,
      parts: m.parts,
    })),
  });

  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessage(lastMessage.parts);
  const response = result.response;

  return {
    content: response.text(),
    model: opts.model,
    promptTokens: response.usageMetadata?.promptTokenCount,
    candidateTokens: response.usageMetadata?.candidatesTokenCount,
    finishReason: response.candidates?.[0]?.finishReason,
  };
}

/**
 * Send a single prompt to Gemini
 */
export async function prompt(
  userMessage: string,
  options: GeminiOptions = {}
): Promise<GeminiResponse> {
  return sendMessage([
    { role: "user", parts: [{ text: userMessage }] }
  ], options);
}

/**
 * Stream a response from Gemini
 */
export async function* streamMessage(
  messages: GeminiMessage[],
  options: GeminiOptions = {}
): AsyncGenerator<GeminiStreamChunk> {
  const client = getClient();
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const model = client.getGenerativeModel({
    model: opts.model,
    safetySettings,
    generationConfig: {
      maxOutputTokens: opts.maxOutputTokens,
      temperature: opts.temperature,
      topP: opts.topP,
      topK: opts.topK,
    },
  });

  try {
    const chat = model.startChat({
      history: messages.slice(0, -1).map(m => ({
        role: m.role,
        parts: m.parts,
      })),
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessageStream(lastMessage.parts);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield { type: "text", content: text };
      }
    }

    yield { type: "done" };
  } catch (error) {
    yield { type: "error", error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Analyze an image using Gemini Vision
 */
export async function analyzeImage(
  imageBase64: string,
  mimeType: string = "image/jpeg",
  customPrompt?: string,
  options: GeminiOptions = {}
): Promise<ImageAnalysisResult> {
  const client = getClient();
  const opts = { ...DEFAULT_OPTIONS, ...options, model: "gemini-1.5-flash" as GeminiModel };

  const model = client.getGenerativeModel({
    model: opts.model,
    safetySettings,
  });

  const analysisPrompt = customPrompt || `Analyze this image and provide a detailed JSON response with:
- description: A detailed description of the image
- labels: Array of relevant labels/tags
- colors: Array of dominant colors (hex codes)
- objects: Array of detected objects with name and confidence (0-1)
- text: Any text detected in the image (if any)
- isNSFW: Boolean indicating if content is inappropriate
- suggestions: Array of suggestions for using this image

Respond only with valid JSON.`;

  const result = await model.generateContent([
    { text: analysisPrompt },
    { inlineData: { mimeType, data: imageBase64 } },
  ]);

  const response = result.response.text();

  try {
    return JSON.parse(response);
  } catch {
    // If JSON parsing fails, return a basic structure
    return {
      description: response,
      labels: [],
      colors: [],
      objects: [],
      isNSFW: false,
      suggestions: [],
    };
  }
}

/**
 * Generate image tags for e-commerce products
 */
export async function generateProductTags(
  imageBase64: string,
  mimeType: string = "image/jpeg",
  productName?: string,
  options: GeminiOptions = {}
): Promise<{
  tags: string[];
  category: string;
  attributes: Record<string, string>;
  seoKeywords: string[];
}> {
  const client = getClient();

  const model = client.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings,
  });

  const prompt = `Analyze this product image${productName ? ` for "${productName}"` : ""} and generate:
- tags: Array of relevant product tags (10-15)
- category: Most appropriate product category
- attributes: Object with attributes like color, material, style, size
- seoKeywords: Array of SEO-friendly keywords (5-10)

Focus on e-commerce and Turkish market. Respond only with valid JSON.`;

  const result = await model.generateContent([
    { text: prompt },
    { inlineData: { mimeType, data: imageBase64 } },
  ]);

  try {
    return JSON.parse(result.response.text());
  } catch {
    throw new Error("Failed to parse product tags response");
  }
}

/**
 * Extract text from image (OCR)
 */
export async function extractText(
  imageBase64: string,
  mimeType: string = "image/jpeg",
  options: GeminiOptions = {}
): Promise<{
  text: string;
  blocks: Array<{ text: string; confidence: number }>;
  language: string;
}> {
  const client = getClient();

  const model = client.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings,
  });

  const result = await model.generateContent([
    { text: `Extract all text from this image. Return JSON with:
- text: All extracted text as a single string
- blocks: Array of text blocks with text and confidence (0-1)
- language: Detected language code

Respond only with valid JSON.` },
    { inlineData: { mimeType, data: imageBase64 } },
  ]);

  try {
    return JSON.parse(result.response.text());
  } catch {
    return {
      text: result.response.text(),
      blocks: [],
      language: "unknown",
    };
  }
}

/**
 * Compare two images
 */
export async function compareImages(
  image1Base64: string,
  image2Base64: string,
  mimeType: string = "image/jpeg",
  options: GeminiOptions = {}
): Promise<{
  similarity: number;
  differences: string[];
  commonElements: string[];
  recommendation: string;
}> {
  const client = getClient();

  const model = client.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings,
  });

  const result = await model.generateContent([
    { text: `Compare these two images and provide:
- similarity: A score from 0-100 indicating how similar they are
- differences: Array of notable differences
- commonElements: Array of common elements
- recommendation: Which image is better for e-commerce use and why

Respond only with valid JSON.` },
    { inlineData: { mimeType, data: image1Base64 } },
    { inlineData: { mimeType, data: image2Base64 } },
  ]);

  try {
    return JSON.parse(result.response.text());
  } catch {
    throw new Error("Failed to parse image comparison response");
  }
}

/**
 * Generate alt text for accessibility
 */
export async function generateAltText(
  imageBase64: string,
  mimeType: string = "image/jpeg",
  context?: string,
  options: GeminiOptions = {}
): Promise<{
  altText: string;
  shortAlt: string;
  longDescription: string;
}> {
  const client = getClient();

  const model = client.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings,
  });

  const contextInfo = context ? `Context: ${context}\n` : "";

  const result = await model.generateContent([
    { text: `${contextInfo}Generate accessibility alt text for this image:
- altText: Standard alt text (50-125 characters)
- shortAlt: Very short alt (under 50 characters)
- longDescription: Detailed description for screen readers (200-300 characters)

Use Turkish language. Respond only with valid JSON.` },
    { inlineData: { mimeType, data: imageBase64 } },
  ]);

  try {
    return JSON.parse(result.response.text());
  } catch {
    throw new Error("Failed to parse alt text response");
  }
}

/**
 * Detect and moderate content
 */
export async function moderateContent(
  imageBase64: string,
  mimeType: string = "image/jpeg",
  options: GeminiOptions = {}
): Promise<{
  isSafe: boolean;
  categories: Record<string, { detected: boolean; confidence: number }>;
  recommendation: "approve" | "review" | "reject";
  reason?: string;
}> {
  const client = getClient();

  const model = client.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings,
  });

  const result = await model.generateContent([
    { text: `Analyze this image for content moderation:
- isSafe: Boolean indicating if safe for general audience
- categories: Object with categories (violence, adult, hate, spam) each with detected and confidence (0-1)
- recommendation: "approve", "review", or "reject"
- reason: If not approved, explain why

Respond only with valid JSON.` },
    { inlineData: { mimeType, data: imageBase64 } },
  ]);

  try {
    return JSON.parse(result.response.text());
  } catch {
    return {
      isSafe: true,
      categories: {},
      recommendation: "review",
      reason: "Could not analyze image",
    };
  }
}

/**
 * Token counting utility
 */
export function estimateTokens(text: string): number {
  // Rough estimation for Gemini
  return Math.ceil(text.length / 4);
}

/**
 * Cost estimation utility
 */
export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  model: GeminiModel = "gemini-1.5-flash"
): number {
  // Pricing per 1M tokens (as of 2025)
  const pricing: Record<GeminiModel, { input: number; output: number }> = {
    "gemini-2.0-flash-exp": { input: 0, output: 0 }, // Free tier
    "gemini-1.5-pro": { input: 1.25, output: 5 },
    "gemini-1.5-flash": { input: 0.075, output: 0.3 },
    "gemini-1.5-flash-8b": { input: 0.0375, output: 0.15 },
  };

  const rates = pricing[model];
  return (inputTokens * rates.input + outputTokens * rates.output) / 1_000_000;
}

export default {
  sendMessage,
  prompt,
  streamMessage,
  analyzeImage,
  generateProductTags,
  extractText,
  compareImages,
  generateAltText,
  moderateContent,
  estimateTokens,
  estimateCost,
};
