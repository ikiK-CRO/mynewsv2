import { NextRequest, NextResponse } from 'next/server';

const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY || '';
const NYT_API_KEY = process.env.NEXT_PUBLIC_NYT_API_KEY || '';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';
const NYT_API_BASE_URL = 'https://api.nytimes.com/svc';

// Simple in-memory cache
type CacheEntry = {
  data: any;
  timestamp: number;
};

const cache: Record<string, CacheEntry> = {};
// Cache duration: 5 minutes (reduced from 1 hour to ensure fresher content)
const CACHE_DURATION = 5 * 60 * 1000;

// Track daily API usage to avoid hitting limits
let newsApiRequestCount = 0;
let nytApiRequestCount = 0;
let lastResetDay = new Date().getDate();
const MAX_NEWS_API_REQUESTS = 90; // 90% of the 100/day limit
const MAX_NYT_API_REQUESTS = 450; // Adjust based on NYT limits

// Reset the request counter if we're on a new day
function checkAndResetCounter() {
  const today = new Date().getDate();
  if (today !== lastResetDay) {
    newsApiRequestCount = 0;
    nytApiRequestCount = 0;
    lastResetDay = today;
    console.log('API request counters reset for new day');
  }
}

// Define params as a simple record for type safety
type Params = {
  params: {
    source: string
  }
}

// API route handler with the precise Next.js App Router signature
export async function GET(
  request: NextRequest,
  params: Params
): Promise<NextResponse> {
  try {
    // Reset counter if it's a new day
    checkAndResetCounter();
    
    // Extract source from params using the correct structure
    const source = params.params.source;
    
    console.log(`Processing request for source: ${source}`);
    
    // More explicit type checking and validation
    if (!source || typeof source !== 'string') {
      console.error('Invalid or missing source parameter:', source);
      return NextResponse.json(
        { error: 'Missing or invalid source parameter' },
        { status: 400 }
      );
    }
    
    // Convert to string explicitly to avoid type issues
    const sourceStr = source.toLowerCase();
    
    // Validate source
    if (!['newsapi', 'nytimes'].includes(sourceStr)) {
      console.error(`Unsupported source requested: ${sourceStr}`);
      return NextResponse.json(
        { error: 'Invalid source. Use "newsapi" or "nytimes".' },
        { status: 400 }
      );
    }

    // Get the full URL and search parameters
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || '';
    
    if (!endpoint) {
      console.error(`Missing endpoint parameter for ${sourceStr}`);
      return NextResponse.json(
        { error: 'Missing endpoint parameter' },
        { status: 400 }
      );
    }
    
    // Calculate cache key based on full request
    const cacheKey = `${sourceStr}-${endpoint}-${searchParams.toString()}`;
    
    // Check if we have valid cache
    if (cache[cacheKey] && 
        (Date.now() - cache[cacheKey].timestamp) < CACHE_DURATION) {
      const minutesRemaining = Math.round((CACHE_DURATION - (Date.now() - cache[cacheKey].timestamp)) / 60000);
      console.log(`Serving ${sourceStr}/${endpoint} from cache (expires in ${minutesRemaining} minutes)`);
      return NextResponse.json(cache[cacheKey].data);
    }

    // Prepare the request based on the source
    let apiUrl: string;
    let headers: Record<string, string> = {};
    
    if (sourceStr === 'newsapi') {
      // Check if we're approaching the daily limit for NewsAPI
      if (newsApiRequestCount >= MAX_NEWS_API_REQUESTS) {
        return NextResponse.json(
          { 
            error: 'Rate limit protection', 
            message: 'Daily NewsAPI request limit reached. Please try again later.'
          },
          { status: 429 }
        );
      }
      
      // Build NewsAPI URL
      const apiParams = new URLSearchParams(searchParams);
      apiParams.delete('endpoint'); // Remove the endpoint param
      apiParams.append('apiKey', NEWS_API_KEY);
      apiUrl = `${NEWS_API_BASE_URL}/${endpoint}?${apiParams}`;
      headers = { 'X-Api-Key': NEWS_API_KEY };
      
      // Increment counter
      newsApiRequestCount++;
      console.log(`NewsAPI request ${newsApiRequestCount}/${MAX_NEWS_API_REQUESTS} for ${endpoint}`);
    } else {
      // NYTimes API
      // Check if we're approaching the daily limit for NYTimes API
      if (nytApiRequestCount >= MAX_NYT_API_REQUESTS) {
        return NextResponse.json(
          { 
            error: 'Rate limit protection', 
            message: 'Daily NYTimes API request limit reached. Please try again later.'
          },
          { status: 429 }
        );
      }
      
      // Parse NYTimes specific parameters
      const section = searchParams.get('section') || 'home';
      const period = searchParams.get('period') || '1';
      
      // Handle different NYTimes endpoints
      switch (endpoint) {
        case 'topstories':
          apiUrl = `${NYT_API_BASE_URL}/topstories/v2/${section}.json?api-key=${NYT_API_KEY}`;
          break;
        case 'mostpopular':
          apiUrl = `${NYT_API_BASE_URL}/mostpopular/v2/viewed/${period}.json?api-key=${NYT_API_KEY}`;
          break;
        case 'newswire':
          const sourceParam = searchParams.get('source') || 'all';
          const limit = searchParams.get('limit') || '20';
          const offset = searchParams.get('offset') || '0';
          apiUrl = `${NYT_API_BASE_URL}/news/v3/content/${sourceParam}/${section}.json?api-key=${NYT_API_KEY}&limit=${limit}&offset=${offset}`;
          break;
        default:
          return NextResponse.json(
            { error: 'Invalid NYTimes endpoint. Use "topstories", "mostpopular", or "newswire".' },
            { status: 400 }
          );
      }
      
      // Increment counter
      nytApiRequestCount++;
      console.log(`NYTimes API request ${nytApiRequestCount}/${MAX_NYT_API_REQUESTS} for ${endpoint}`);
    }

    // Make the API request
    const response = await fetch(apiUrl, {
      headers,
      next: { revalidate: CACHE_DURATION / 1000 } // Built-in Next.js cache control
    });

    // Check if request was successful
    if (!response.ok) {
      // Try to parse error response
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      
      console.error(`API error (${sourceStr}/${endpoint}): ${response.status}`, errorData);
      
      return NextResponse.json(
        { 
          error: errorData.message || `Failed to fetch data from ${sourceStr}`, 
          status: response.status
        },
        { status: response.status }
      );
    }

    // Parse and cache response
    const data = await response.json();
    
    // Store in cache
    cache[cacheKey] = {
      data,
      timestamp: Date.now()
    };
    
    // Return the data
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in news API proxy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 