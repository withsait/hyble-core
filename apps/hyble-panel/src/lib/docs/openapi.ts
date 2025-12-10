/**
 * OpenAPI/Swagger Documentation Generator
 * Generates API documentation for Hyble Panel
 */

export interface OpenAPIInfo {
  title: string;
  version: string;
  description: string;
  termsOfService?: string;
  contact?: {
    name: string;
    url: string;
    email: string;
  };
  license?: {
    name: string;
    url: string;
  };
}

export interface OpenAPIServer {
  url: string;
  description: string;
}

export interface OpenAPISecurityScheme {
  type: string;
  scheme?: string;
  bearerFormat?: string;
  name?: string;
  in?: string;
  description?: string;
}

export interface OpenAPISpec {
  openapi: string;
  info: OpenAPIInfo;
  servers: OpenAPIServer[];
  paths: Record<string, unknown>;
  components: {
    securitySchemes: Record<string, OpenAPISecurityScheme>;
    schemas: Record<string, unknown>;
  };
  tags: Array<{ name: string; description: string }>;
}

/**
 * Generate base OpenAPI specification
 */
export function generateOpenAPISpec(): OpenAPISpec {
  return {
    openapi: "3.1.0",
    info: {
      title: "Hyble Panel API",
      version: "1.0.0",
      description: `
# Hyble Panel API

B2B Identity & Access Management API for Hyble Platform.

## Overview

The Hyble Panel API provides programmatic access to:
- User authentication and management
- Organization management
- Security settings
- API key management

## Authentication

All API requests require authentication using one of the following methods:

### Session Token
Include the session cookie in your requests for browser-based authentication.

### API Key
Include your API key in the \`X-API-Key\` header:
\`\`\`
X-API-Key: hbl_xxxxxxxxxxxxxxxx
\`\`\`

### Bearer Token
Include the Bearer token in the Authorization header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

## Rate Limiting

API requests are rate limited to ensure fair usage:
- Standard endpoints: 100 requests per minute
- Auth endpoints: 5-10 requests per minute
- Export endpoints: 5 requests per 5 minutes

Rate limit headers are included in all responses:
- \`X-RateLimit-Limit\`: Maximum requests per window
- \`X-RateLimit-Remaining\`: Requests remaining
- \`X-RateLimit-Reset\`: Unix timestamp when limit resets

## Errors

The API uses standard HTTP status codes and returns JSON error responses:

\`\`\`json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
\`\`\`

Common error codes:
- \`UNAUTHORIZED\`: Authentication required
- \`FORBIDDEN\`: Insufficient permissions
- \`NOT_FOUND\`: Resource not found
- \`VALIDATION_ERROR\`: Invalid input
- \`RATE_LIMITED\`: Too many requests
      `,
      termsOfService: "https://hyble.io/terms",
      contact: {
        name: "Hyble Support",
        url: "https://hyble.io/support",
        email: "support@hyble.io",
      },
      license: {
        name: "Proprietary",
        url: "https://hyble.io/license",
      },
    },
    servers: [
      {
        url: "https://api.hyble.io/v1",
        description: "Production API",
      },
      {
        url: "https://staging-api.hyble.io/v1",
        description: "Staging API",
      },
      {
        url: "http://localhost:3000/api",
        description: "Local Development",
      },
    ],
    paths: generatePaths(),
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT Bearer token authentication",
        },
        apiKey: {
          type: "apiKey",
          name: "X-API-Key",
          in: "header",
          description: "API Key authentication",
        },
        sessionAuth: {
          type: "apiKey",
          name: "authjs.session-token",
          in: "cookie",
          description: "Session cookie authentication",
        },
      },
      schemas: generateSchemas(),
    },
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "User", description: "User management endpoints" },
      { name: "Security", description: "Security settings endpoints" },
      { name: "Organization", description: "Organization management endpoints" },
      { name: "API Keys", description: "API key management endpoints" },
      { name: "Admin", description: "Admin-only endpoints" },
    ],
  };
}

/**
 * Generate API paths
 */
function generatePaths(): Record<string, unknown> {
  return {
    "/trpc/auth.login": {
      post: {
        tags: ["Auth"],
        summary: "User login",
        description: "Authenticate user with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                  rememberMe: { type: "boolean", default: false },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" },
              },
            },
          },
          "401": { description: "Invalid credentials" },
          "429": { description: "Too many attempts" },
        },
      },
    },
    "/trpc/auth.register": {
      post: {
        tags: ["Auth"],
        summary: "User registration",
        description: "Register a new user account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "name"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                  name: { type: "string", minLength: 2 },
                  acceptTerms: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Registration successful" },
          "400": { description: "Validation error" },
          "409": { description: "Email already exists" },
        },
      },
    },
    "/trpc/user.getProfile": {
      get: {
        tags: ["User"],
        summary: "Get user profile",
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        responses: {
          "200": {
            description: "User profile",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserProfile" },
              },
            },
          },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/trpc/organization.list": {
      get: {
        tags: ["Organization"],
        summary: "List user organizations",
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        responses: {
          "200": {
            description: "List of organizations",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Organization" },
                },
              },
            },
          },
        },
      },
    },
    "/trpc/organization.create": {
      post: {
        tags: ["Organization"],
        summary: "Create organization",
        security: [{ bearerAuth: [] }, { apiKey: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", minLength: 2, maxLength: 100 },
                  description: { type: "string", maxLength: 500 },
                  website: { type: "string", format: "uri" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Organization created" },
          "400": { description: "Validation error" },
        },
      },
    },
    "/trpc/apiKey.list": {
      get: {
        tags: ["API Keys"],
        summary: "List API keys",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "List of API keys",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/ApiKey" },
                },
              },
            },
          },
        },
      },
    },
    "/trpc/apiKey.create": {
      post: {
        tags: ["API Keys"],
        summary: "Create API key",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "scopes"],
                properties: {
                  name: { type: "string", minLength: 1, maxLength: 100 },
                  scopes: { type: "array", items: { type: "string" } },
                  expiresAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "API key created (key shown only once)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    key: { type: "string", description: "Full API key (shown only once)" },
                    name: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

/**
 * Generate component schemas
 */
function generateSchemas(): Record<string, unknown> {
  return {
    LoginResponse: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        requiresTwoFactor: { type: "boolean" },
        user: { $ref: "#/components/schemas/User" },
      },
    },
    User: {
      type: "object",
      properties: {
        id: { type: "string" },
        email: { type: "string", format: "email" },
        name: { type: "string", nullable: true },
        role: { type: "string", enum: ["user", "admin", "super_admin"] },
        status: { type: "string", enum: ["ACTIVE", "SUSPENDED", "FROZEN", "PENDING_DELETION"] },
        trustLevel: { type: "string", enum: ["GUEST", "VERIFIED", "SECURE", "CORPORATE"] },
        emailVerified: { type: "boolean" },
        phoneVerified: { type: "boolean" },
        createdAt: { type: "string", format: "date-time" },
      },
    },
    UserProfile: {
      type: "object",
      properties: {
        id: { type: "string" },
        email: { type: "string" },
        name: { type: "string" },
        profile: {
          type: "object",
          properties: {
            avatar: { type: "string", nullable: true },
            bio: { type: "string", nullable: true },
            timezone: { type: "string" },
            language: { type: "string" },
          },
        },
        addresses: {
          type: "array",
          items: { $ref: "#/components/schemas/Address" },
        },
      },
    },
    Address: {
      type: "object",
      properties: {
        id: { type: "string" },
        label: { type: "string" },
        line1: { type: "string" },
        line2: { type: "string", nullable: true },
        city: { type: "string" },
        state: { type: "string", nullable: true },
        country: { type: "string" },
        postalCode: { type: "string", nullable: true },
        isDefault: { type: "boolean" },
      },
    },
    Organization: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        slug: { type: "string" },
        description: { type: "string", nullable: true },
        logo: { type: "string", nullable: true },
        website: { type: "string", nullable: true },
        memberCount: { type: "integer" },
        role: { type: "string", enum: ["OWNER", "ADMIN", "MANAGER", "BILLING", "MEMBER", "VIEWER"] },
      },
    },
    ApiKey: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        keyPrefix: { type: "string", description: "First 12 characters of the key" },
        scopes: { type: "array", items: { type: "string" } },
        lastUsedAt: { type: "string", format: "date-time", nullable: true },
        expiresAt: { type: "string", format: "date-time", nullable: true },
        createdAt: { type: "string", format: "date-time" },
      },
    },
    Error: {
      type: "object",
      properties: {
        error: {
          type: "object",
          properties: {
            code: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
  };
}
