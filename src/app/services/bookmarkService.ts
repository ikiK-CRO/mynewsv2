import { collection, doc, setDoc, deleteDoc, getDocs, getDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UnifiedArticle } from '../types/news';

// Extend UnifiedArticle type to include bookmarkedAt
interface BookmarkedArticle extends UnifiedArticle {
  bookmarkedAt?: string;
}

const BOOKMARKS_COLLECTION = 'bookmarks';

// Sanitize document ID to be Firestore-compatible
// Firestore doesn't allow: /, ., [, ], #, *, //, etc.
function sanitizeId(id: string): string {
  // First try to encode the URI to handle all special characters
  try {
    // Replace all problematic characters with safe alternatives
    return id.replace(/[\/.:*\[\]#%?&=]/g, '_');
  } catch (e) {
    console.error('[bookmarkService] Error sanitizing ID:', e);
    // If encoding fails, use a simple replacement as fallback
    return id.replace(/[^a-zA-Z0-9_-]/g, '_');
  }
}

export const addBookmark = async (userId: string, article: UnifiedArticle) => {
  try {
    if (!userId || !article || !article.id) {
      console.error('Invalid userId or article data when adding bookmark');
      return false;
    }

    // Sanitize the article ID
    const sanitizedArticleId = sanitizeId(article.id);
    console.log(`Adding bookmark for user ${userId}, original article ID: ${article.id}, sanitized: ${sanitizedArticleId}`);
    
    const bookmarkRef = doc(db, BOOKMARKS_COLLECTION, `${userId}_${sanitizedArticleId}`);
    
    // Create a bookmark document with a simpler structure
    // Make sure to include ALL article data so we don't need to refetch from APIs
    const bookmarkData = {
      userId,
      articleId: article.id, // Store the original ID for reference
      sanitizedArticleId,
      createdAt: new Date().toISOString(),
      article: {
        ...article,
        bookmarkedAt: new Date().toISOString(),
      }
    };
    
    await setDoc(bookmarkRef, bookmarkData);
    console.log('Bookmark successfully added to Firestore');
    
    return true;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return false;
  }
};

export const removeBookmark = async (userId: string, articleId: string) => {
  try {
    if (!userId || !articleId) {
      console.error('Invalid userId or articleId when removing bookmark');
      return false;
    }
    
    // Sanitize the article ID
    const sanitizedArticleId = sanitizeId(articleId);
    console.log(`Removing bookmark for user ${userId}, original article ID: ${articleId}, sanitized: ${sanitizedArticleId}`);
    
    const bookmarkRef = doc(db, BOOKMARKS_COLLECTION, `${userId}_${sanitizedArticleId}`);
    await deleteDoc(bookmarkRef);
    console.log('Bookmark successfully removed from Firestore');
    return true;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return false;
  }
};

export const getBookmarks = async (userId: string): Promise<BookmarkedArticle[]> => {
  try {
    if (!userId) {
      console.error('[bookmarkService] Invalid userId when fetching bookmarks');
      return [];
    }
    
    console.log(`[bookmarkService] Fetching bookmarks for user: ${userId}`);
    
    // Create a query that specifically only gets documents where userId equals the provided userId
    const bookmarksQuery = query(
      collection(db, BOOKMARKS_COLLECTION),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(bookmarksQuery);
    
    if (querySnapshot.empty) {
      console.log('[bookmarkService] No bookmarks found for user', userId);
      return [];
    }
    
    console.log(`[bookmarkService] Found ${querySnapshot.size} bookmark documents in Firestore`);
    
    const bookmarks: BookmarkedArticle[] = [];
    
    // Process each document from the query
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      console.log(`[bookmarkService] Processing bookmark document: ${docSnapshot.id}`);
      
      if (data && data.article) {
        // Extract the complete article data from Firestore
        console.log(`[bookmarkService] Adding article to bookmarks: "${data.article.title}" (${data.article.id})`);
        bookmarks.push(data.article as BookmarkedArticle);
      } else {
        console.warn(`[bookmarkService] Document ${docSnapshot.id} missing article data`);
      }
    });
    
    console.log(`[bookmarkService] Retrieved ${bookmarks.length} bookmarks for user ${userId}`);
    
    // Sort by bookmarked date (newest first)
    return bookmarks.sort((a, b) => {
      const dateA = new Date(a.bookmarkedAt || a.publishedAt).getTime();
      const dateB = new Date(b.bookmarkedAt || b.publishedAt).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error('[bookmarkService] Error fetching bookmarks:', error);
    return [];
  }
};

export const isBookmarked = async (userId: string, articleId: string): Promise<boolean> => {
  try {
    if (!userId || !articleId) {
      console.log('Missing userId or articleId when checking bookmark status');
      return false;
    }
    
    // Sanitize the article ID
    const sanitizedArticleId = sanitizeId(articleId);
    const docId = `${userId}_${sanitizedArticleId}`;
    console.log(`Checking bookmark status for document ID: ${docId} (original article ID: ${articleId})`);
    
    const bookmarkRef = doc(db, BOOKMARKS_COLLECTION, docId);
    const docSnapshot = await getDoc(bookmarkRef);
    const exists = docSnapshot.exists();
    
    console.log(`Bookmark status for article ${articleId}: ${exists ? 'bookmarked' : 'not bookmarked'}`);
    
    return exists;
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return false;
  }
}; 