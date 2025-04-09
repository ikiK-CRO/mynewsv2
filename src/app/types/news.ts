// NewsAPI interfaces
export interface NewsApiArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
}

export interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsApiArticle[];
}

// NYTimes Most Popular API interfaces
export interface NYTimesMedia {
  type: string;
  subtype: string;
  caption: string;
  copyright: string;
  approved_for_syndication: boolean;
  'media-metadata': {
    url: string;
    format: string;
    height: number;
    width: number;
  }[];
}

export interface NYTimesPopularArticle {
  url: string;
  adx_keywords: string;
  subsection: string;
  section: string;
  byline: string;
  type: string;
  title: string;
  abstract: string;
  published_date: string;
  source: string;
  id: number;
  asset_id: number;
  media: NYTimesMedia[];
  uri: string;
}

export interface NYTimesPopularResponse {
  status: string;
  copyright: string;
  num_results: number;
  results: NYTimesPopularArticle[];
}

// NYTimes Top Stories API interfaces
export interface NYTimesMultimedia {
  url: string;
  format: string;
  height: number;
  width: number;
  type: string;
  subtype: string;
  caption: string;
  copyright: string;
}

export interface NYTimesTopStoryArticle {
  section: string;
  subsection: string;
  title: string;
  abstract: string;
  url: string;
  uri: string;
  byline: string;
  item_type: string;
  updated_date: string;
  created_date: string;
  published_date: string;
  material_type_facet: string;
  kicker: string;
  des_facet: string[];
  org_facet: string[];
  per_facet: string[];
  geo_facet: string[];
  multimedia: NYTimesMultimedia[];
  short_url: string;
}

export interface NYTimesTopStoriesResponse {
  status: string;
  copyright: string;
  section: string;
  last_updated: string;
  num_results: number;
  results: NYTimesTopStoryArticle[];
}

// NYTimes Newswire API interfaces
export interface NYTimesNewswireArticle {
  section: string;
  subsection: string;
  title: string;
  abstract: string;
  url: string;
  uri: string;
  byline: string;
  thumbnail_standard: string;
  item_type: string;
  source: string;
  updated_date: string;
  created_date: string;
  published_date: string;
  material_type_facet: string;
  kicker: string;
  headline: string;
  des_facet: string[] | string;
  org_facet: string[] | string;
  per_facet: string[] | string;
  geo_facet: string[] | string;
  multimedia: NYTimesMultimedia[];
  short_url: string;
}

export interface NYTimesNewswireResponse {
  status: string;
  copyright: string;
  num_results: number;
  results: NYTimesNewswireArticle[];
}

// Unified article type for our app
export interface UnifiedArticle {
  id: string;
  title: string;
  description: string;
  content?: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  source: string;
  author?: string;
  category: string;
} 