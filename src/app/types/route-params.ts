/**
 * Types for Next.js App Router route handlers
 * These types are compatible with Next.js 15
 */

// Extract the route parameters from the [source] segment
export type SourceRouteParams = {
  params: {
    source: string;
  };
};

// Helper function to safely await route params
export async function resolveRouteParams<T>(params: T): Promise<T> {
  return await Promise.resolve(params);
} 