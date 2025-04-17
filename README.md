# MyNews - News Aggregator Application

MyNews is a full-stack news aggregation application that provides users with the latest news stories from around the world. The application features user authentication, article categorization, search functionality, and bookmark capabilities.

**[Live Demo](https://mynewsv.vercel.app/)**

## Features

- **User Authentication**: Sign up and sign in with email verification
- **News Aggregation**: Articles from multiple sources (NewsAPI and New York Times)
- **Category Navigation**: Browse news by categories (General, Business, Technology, etc.)
- **Infinite Scroll**: Load more articles as you scroll in the Latest News section
- **Search Functionality**: Find articles by keywords
- **Bookmarking System**: Save favorite articles to read later
- **Responsive Design**: Optimized for both desktop and mobile devices

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, SCSS/Sass
- **Backend**: Next.js API Routes, Firebase Authentication, Firestore
- **APIs**: NewsAPI, New York Times API
- **Testing**: Jest, React Testing Library

## Prerequisites

Before you begin, ensure you have:

- Node.js (v18 or higher)
- npm (v8 or higher)
- Firebase account
- NewsAPI key 
- New York Times API key

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ikiK-CRO/mynewsv2.git
   cd mynewsv2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # News API Keys
   NEXT_PUBLIC_NEWS_API_KEY=your_news_api_key_here
   NEXT_PUBLIC_NYT_API_KEY=your_nytimes_api_key_here

   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Authentication

- Sign up with email, first name, last name, and password
- Verify your email through the verification link sent to your inbox
- Sign in with your verified email and password

### News Reading

- The homepage displays news articles organized by categories
- Use the sidebar navigation to filter articles by category
- Scroll down in the latest news section to load more articles
- Click on article cards to read the full article

### Search

- Use the search bar at the top of the page to find articles by keyword
- Results will display immediately with matching articles
- Click the "x" button to clear search results

### Bookmarks

- Bookmark icons are positioned in the top-right corner of each article card for easy access
- This consistent placement makes it intuitive for users to save articles while browsing
- The bookmark icon changes state (filled/unfilled) to indicate whether an article is saved
- Access your favorite articles from the "Favorites" option in the sidebar
- Remove articles from your favorites by clicking the bookmark icon again

## Design Decisions

### Authentication System

We implemented Firebase Authentication to handle user registration, login, and email verification. This choice allows us to focus on the application's core features while leveraging a secure, proven authentication system.

### News Sources

The application uses both NewsAPI and New York Times API to provide a diverse range of news articles. This approach ensures:
- Wider coverage of topics and perspectives
- Backup sources in case one API experiences issues
- Deduplication of similar stories from different sources

### Article Sorting and Layout

- **Breaking News**: Featured prominently at the top of the homepage in a larger card format to highlight important stories
- **Category Sections**: Articles are sorted chronologically (newest first) within each category
- **Latest News**: Located below the category sections, provides a continuous feed of the most recent articles with infinite scroll
- **Ad Placements**: Non-intrusive ad cards are integrated within the article grid, clearly distinguished from news content while maintaining the overall design aesthetic

### Responsive Design

We implemented a mobile-first design approach with:
- A sidebar navigation for desktop views
- A mobile menu for smaller screens
- Flexible card layouts that adapt to different screen sizes
- Optimized reading experience across devices

## Testing

Run the tests with:

```bash
npm test
```

## Deployment

The application is configured for easy deployment to Vercel:

```bash
npm run build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [NewsAPI](https://newsapi.org/) for providing current news articles
- [New York Times API](https://developer.nytimes.com/) for quality news content
- [Firebase](https://firebase.google.com/) for authentication and database services
