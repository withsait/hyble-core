import DOMPurify, { Config } from "dompurify";

/**
 * HTML Sanitization Utility
 * Prevents XSS attacks by sanitizing HTML content
 */

// Allowed HTML tags for user content
const ALLOWED_TAGS = [
  "a", "abbr", "article", "b", "blockquote", "br", "caption", "cite", "code",
  "col", "colgroup", "dd", "div", "dl", "dt", "em", "figcaption", "figure",
  "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i", "img", "li", "mark", "ol",
  "p", "pre", "q", "s", "section", "small", "span", "strong", "sub", "sup",
  "table", "tbody", "td", "tfoot", "th", "thead", "tr", "u", "ul", "video"
];

// Allowed HTML attributes
const ALLOWED_ATTR = [
  "href", "src", "alt", "title", "class", "id", "target", "rel",
  "width", "height", "style", "colspan", "rowspan", "loading",
  "controls", "autoplay", "loop", "muted", "poster"
];

// Allowed protocols for href/src
const ALLOWED_URI_REGEXP = /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i;

// Configure DOMPurify
const createDOMPurifyConfig = (options?: SanitizeOptions): Config => ({
  ALLOWED_TAGS: options?.allowedTags || ALLOWED_TAGS,
  ALLOWED_ATTR: options?.allowedAttr || ALLOWED_ATTR,
  ALLOWED_URI_REGEXP,
  ALLOW_DATA_ATTR: false,
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_TRUSTED_TYPE: false,
  FORCE_BODY: false,
  SANITIZE_DOM: true,
  WHOLE_DOCUMENT: false,
  ADD_ATTR: options?.addAttr || [],
  ADD_TAGS: options?.addTags || [],
});

export interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttr?: string[];
  addTags?: string[];
  addAttr?: string[];
}

/**
 * Sanitize HTML string to prevent XSS attacks
 * @param dirty - The potentially unsafe HTML string
 * @param options - Optional configuration
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(dirty: string, options?: SanitizeOptions): string {
  if (!dirty || typeof dirty !== "string") {
    return "";
  }

  // Check if we're in a browser environment
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    return DOMPurify.sanitize(dirty, createDOMPurifyConfig(options));
  }

  // Server-side: use basic regex sanitization as fallback
  // This is less thorough but prevents basic XSS
  return serverSideSanitize(dirty);
}

/**
 * Server-side sanitization fallback
 * Removes script tags, event handlers, and javascript: URLs
 */
function serverSideSanitize(dirty: string): string {
  return dirty
    // Remove script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove event handlers
    .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\s+on\w+\s*=\s*[^\s>]+/gi, "")
    // Remove javascript: URLs
    .replace(/javascript\s*:/gi, "")
    // Remove data: URLs (except images)
    .replace(/data\s*:\s*(?!image\/)/gi, "")
    // Remove expression() CSS
    .replace(/expression\s*\(/gi, "")
    // Remove vbscript: URLs
    .replace(/vbscript\s*:/gi, "")
    // Remove HTML comments that might contain malicious content
    .replace(/<!--[\s\S]*?-->/g, "")
    // Remove CDATA sections
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/gi, "");
}

/**
 * Sanitize HTML for blog content (more permissive)
 */
export function sanitizeBlogContent(dirty: string): string {
  return sanitizeHtml(dirty, {
    addTags: ["iframe"], // Allow iframes for embedded content
    addAttr: ["frameborder", "allowfullscreen", "allow", "sandbox"],
  });
}

/**
 * Sanitize HTML for website builder (more permissive)
 */
export function sanitizeBuilderContent(dirty: string): string {
  return sanitizeHtml(dirty, {
    addTags: ["iframe", "form", "input", "button", "textarea", "select", "option", "label"],
    addAttr: [
      "frameborder", "allowfullscreen", "allow", "sandbox",
      "type", "name", "value", "placeholder", "required", "disabled",
      "checked", "selected", "for", "action", "method", "enctype",
      "min", "max", "minlength", "maxlength", "pattern", "autocomplete"
    ],
  });
}

/**
 * Sanitize plain text (strip all HTML)
 */
export function sanitizeText(dirty: string): string {
  if (!dirty || typeof dirty !== "string") {
    return "";
  }

  // Remove all HTML tags
  return dirty
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}

/**
 * Escape HTML special characters (for displaying HTML as text)
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

export default {
  sanitizeHtml,
  sanitizeBlogContent,
  sanitizeBuilderContent,
  sanitizeText,
  escapeHtml,
};
