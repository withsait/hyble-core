import { createTRPCReact } from "@trpc/react-query";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

// Dynamic router type - uses core's AppRouter at runtime
// Type safety is handled by the core app, this package provides the client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AppRouterType = any;

export const api = createTRPCReact<AppRouterType>();

// Type exports for consumers
export type AppRouter = AppRouterType;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

// Blog post type for consumers
export interface BlogPost {
  id: string;
  slug: string;
  vertical: "GENERAL" | "DIGITAL" | "STUDIOS";
  titleTr: string;
  titleEn: string;
  excerptTr: string | null;
  excerptEn: string | null;
  contentTr: string;
  contentEn: string;
  featuredImage: string | null;
  thumbnail: string | null;
  authorName: string | null;
  authorImage: string | null;
  category: { id: string; nameTr: string; nameEn: string } | null;
  tags: string[];
  readingTime: number;
  viewCount: number;
  publishedAt: Date | string | null;
  relatedPosts?: Array<{
    id: string;
    slug: string;
    titleTr: string;
    thumbnail: string | null;
    readingTime: number;
  }>;
}
