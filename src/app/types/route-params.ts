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

// Helper function to fully resolve nested route params
export async function resolveRouteParams<T extends { params: object }>(context: T): Promise<{ params: { [key: string]: string } }> {
  // First await the context object
  const awaitedContext = await Promise.resolve(context);
  
  // Then await the params object
  const awaitedParams = await Promise.resolve(awaitedContext.params);
  
  // Create a new object with awaited properties
  const result = {
    params: {} as { [key: string]: string }
  };
  
  // Await each property individually and add it to the result
  for (const key in awaitedParams) {
    if (Object.prototype.hasOwnProperty.call(awaitedParams, key)) {
      // Await the property value
      result.params[key] = await Promise.resolve((awaitedParams as any)[key]);
    }
  }
  
  return result;
} 