/**
 * Claude API Wrapper for Hyble Core
 * Supports Claude Opus, Sonnet, and Haiku models
 */

import Anthropic from "@anthropic-ai/sdk";

// Types
export type ClaudeModel =
  | "claude-opus-4-5-20251101"
  | "claude-sonnet-4-20250514"
  | "claude-3-5-haiku-20241022"
  | "claude-3-5-sonnet-20241022";

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClaudeResponse {
  content: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  stopReason: string | null;
}

export interface ClaudeStreamChunk {
  type: "text" | "done" | "error";
  content?: string;
  error?: string;
}

export interface ClaudeOptions {
  model?: ClaudeModel;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  stopSequences?: string[];
}

// Default options
const DEFAULT_OPTIONS: Required<Omit<ClaudeOptions, "systemPrompt" | "stopSequences">> = {
  model: "claude-sonnet-4-20250514",
  maxTokens: 4096,
  temperature: 0.7,
};

// Claude client singleton
let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("CLAUDE_API_KEY or ANTHROPIC_API_KEY environment variable is required");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

/**
 * Send a message to Claude and get a response
 */
export async function sendMessage(
  messages: ClaudeMessage[],
  options: ClaudeOptions = {}
): Promise<ClaudeResponse> {
  const anthropic = getClient();
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const response = await anthropic.messages.create({
    model: opts.model,
    max_tokens: opts.maxTokens,
    temperature: opts.temperature,
    system: options.systemPrompt,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
    stop_sequences: options.stopSequences,
  });

  const textContent = response.content.find(c => c.type === "text");

  return {
    content: textContent?.type === "text" ? textContent.text : "",
    model: response.model,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    stopReason: response.stop_reason,
  };
}

/**
 * Send a single prompt to Claude
 */
export async function prompt(
  userMessage: string,
  options: ClaudeOptions = {}
): Promise<ClaudeResponse> {
  return sendMessage([{ role: "user", content: userMessage }], options);
}

/**
 * Stream a response from Claude
 */
export async function* streamMessage(
  messages: ClaudeMessage[],
  options: ClaudeOptions = {}
): AsyncGenerator<ClaudeStreamChunk> {
  const anthropic = getClient();
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    const stream = await anthropic.messages.stream({
      model: opts.model,
      max_tokens: opts.maxTokens,
      temperature: opts.temperature,
      system: options.systemPrompt,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      stop_sequences: options.stopSequences,
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield { type: "text", content: event.delta.text };
      }
    }

    yield { type: "done" };
  } catch (error) {
    yield { type: "error", error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Generate website content using Claude
 */
export async function generateWebsiteContent(
  businessType: string,
  businessName: string,
  description: string,
  options: ClaudeOptions = {}
): Promise<{
  hero: { title: string; subtitle: string; cta: string };
  about: string;
  services: Array<{ title: string; description: string }>;
  features: Array<{ title: string; description: string }>;
  testimonials: Array<{ name: string; role: string; content: string }>;
  faq: Array<{ question: string; answer: string }>;
  seo: { title: string; description: string; keywords: string[] };
}> {
  const systemPrompt = `You are a professional web content writer. Generate website content in JSON format.
The content should be engaging, professional, and optimized for the target audience.
Respond only with valid JSON, no markdown or explanations.`;

  const userPrompt = `Generate website content for:
Business Type: ${businessType}
Business Name: ${businessName}
Description: ${description}

Generate a complete JSON object with these sections:
- hero: { title, subtitle, cta }
- about: string (2-3 paragraphs)
- services: array of { title, description } (4-6 items)
- features: array of { title, description } (4-6 items)
- testimonials: array of { name, role, content } (3 items)
- faq: array of { question, answer } (5-6 items)
- seo: { title, description, keywords[] }

Use Turkish language for all content.`;

  const response = await prompt(userPrompt, {
    ...options,
    systemPrompt,
    temperature: 0.7,
  });

  try {
    return JSON.parse(response.content);
  } catch {
    throw new Error("Failed to parse Claude response as JSON");
  }
}

/**
 * Generate SEO metadata using Claude
 */
export async function generateSEO(
  pageTitle: string,
  pageContent: string,
  options: ClaudeOptions = {}
): Promise<{
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
}> {
  const systemPrompt = `You are an SEO expert. Generate optimized SEO metadata in JSON format.
Focus on Turkish market and language. Respond only with valid JSON.`;

  const userPrompt = `Generate SEO metadata for this page:
Title: ${pageTitle}
Content: ${pageContent.substring(0, 2000)}

Generate JSON with: title, description (max 160 chars), keywords (5-10), ogTitle, ogDescription`;

  const response = await prompt(userPrompt, {
    ...options,
    systemPrompt,
    model: "claude-3-5-haiku-20241022", // Use Haiku for faster/cheaper SEO generation
    temperature: 0.5,
  });

  try {
    return JSON.parse(response.content);
  } catch {
    throw new Error("Failed to parse SEO response");
  }
}

/**
 * Generate blog post using Claude
 */
export async function generateBlogPost(
  topic: string,
  keywords: string[],
  tone: "professional" | "casual" | "technical" = "professional",
  options: ClaudeOptions = {}
): Promise<{
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  seo: { title: string; description: string };
}> {
  const systemPrompt = `You are a professional content writer specializing in ${tone} blog posts.
Write engaging, well-structured content in Turkish. Respond only with valid JSON.`;

  const userPrompt = `Write a blog post about: ${topic}
Keywords to include: ${keywords.join(", ")}
Tone: ${tone}

Generate JSON with:
- title: catchy blog title
- excerpt: 2-3 sentence summary
- content: full blog post in markdown (1000-1500 words)
- tags: relevant tags (5-8)
- seo: { title, description }`;

  const response = await prompt(userPrompt, {
    ...options,
    systemPrompt,
    maxTokens: 4096,
    temperature: 0.8,
  });

  try {
    return JSON.parse(response.content);
  } catch {
    throw new Error("Failed to parse blog post response");
  }
}

/**
 * Generate product description using Claude
 */
export async function generateProductDescription(
  productName: string,
  category: string,
  features: string[],
  options: ClaudeOptions = {}
): Promise<{
  shortDescription: string;
  longDescription: string;
  bulletPoints: string[];
  seo: { title: string; description: string };
}> {
  const systemPrompt = `You are an e-commerce copywriter. Write compelling product descriptions in Turkish.
Focus on benefits, not just features. Respond only with valid JSON.`;

  const userPrompt = `Write product description for:
Product: ${productName}
Category: ${category}
Features: ${features.join(", ")}

Generate JSON with:
- shortDescription: 1-2 sentences
- longDescription: 2-3 paragraphs
- bulletPoints: 5-7 key benefits
- seo: { title, description }`;

  const response = await prompt(userPrompt, {
    ...options,
    systemPrompt,
    model: "claude-3-5-haiku-20241022",
    temperature: 0.6,
  });

  try {
    return JSON.parse(response.content);
  } catch {
    throw new Error("Failed to parse product description response");
  }
}

/**
 * Improve content using Claude
 */
export async function improveContent(
  content: string,
  improvements: ("grammar" | "clarity" | "engagement" | "seo")[],
  options: ClaudeOptions = {}
): Promise<{
  improvedContent: string;
  changes: string[];
  suggestions: string[];
}> {
  const systemPrompt = `You are a content editor. Improve the given content based on specified criteria.
Maintain the original meaning and tone. Respond only with valid JSON.`;

  const userPrompt = `Improve this content:
${content}

Focus on: ${improvements.join(", ")}

Generate JSON with:
- improvedContent: the improved text
- changes: list of changes made
- suggestions: additional suggestions`;

  const response = await prompt(userPrompt, {
    ...options,
    systemPrompt,
    temperature: 0.5,
  });

  try {
    return JSON.parse(response.content);
  } catch {
    throw new Error("Failed to parse improvement response");
  }
}

/**
 * Support ticket triage using Claude
 */
export async function triageTicket(
  subject: string,
  message: string,
  options: ClaudeOptions = {}
): Promise<{
  category: string;
  priority: "low" | "normal" | "high" | "urgent";
  sentiment: "positive" | "neutral" | "negative";
  suggestedResponse: string;
  shouldEscalate: boolean;
  tags: string[];
}> {
  const systemPrompt = `You are a customer support AI assistant. Analyze support tickets and provide triage information.
Be helpful and empathetic. Respond only with valid JSON.`;

  const userPrompt = `Analyze this support ticket:
Subject: ${subject}
Message: ${message}

Generate JSON with:
- category: billing, technical, account, sales, bug, feature, feedback, other
- priority: low, normal, high, urgent
- sentiment: positive, neutral, negative
- suggestedResponse: a helpful response in Turkish
- shouldEscalate: boolean if needs human attention
- tags: relevant tags`;

  const response = await prompt(userPrompt, {
    ...options,
    systemPrompt,
    model: "claude-3-5-haiku-20241022",
    temperature: 0.3,
  });

  try {
    return JSON.parse(response.content);
  } catch {
    throw new Error("Failed to parse ticket triage response");
  }
}

/**
 * Token counting utility
 */
export function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token for English, ~2 for Turkish
  return Math.ceil(text.length / 3);
}

/**
 * Cost estimation utility
 */
export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  model: ClaudeModel = "claude-sonnet-4-20250514"
): number {
  // Pricing per 1M tokens (as of 2025)
  const pricing: Record<ClaudeModel, { input: number; output: number }> = {
    "claude-opus-4-5-20251101": { input: 15, output: 75 },
    "claude-sonnet-4-20250514": { input: 3, output: 15 },
    "claude-3-5-haiku-20241022": { input: 0.25, output: 1.25 },
    "claude-3-5-sonnet-20241022": { input: 3, output: 15 },
  };

  const rates = pricing[model];
  return (inputTokens * rates.input + outputTokens * rates.output) / 1_000_000;
}

export default {
  sendMessage,
  prompt,
  streamMessage,
  generateWebsiteContent,
  generateSEO,
  generateBlogPost,
  generateProductDescription,
  improveContent,
  triageTicket,
  estimateTokens,
  estimateCost,
};
