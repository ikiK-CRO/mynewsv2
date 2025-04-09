import { collection, doc, setDoc, deleteDoc, getDocs, getDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UnifiedArticle } from '../types/news';

// Extend UnifiedArticle type to include bookmarkedAt
interface BookmarkedArticle extends UnifiedArticle {
  bookmarkedAt?: string;
}

const BOOKMARKS_COLLECTION = 'bookmarks';

export const addBookmark = async (userId: string, article: UnifiedArticle) => {
  try {
    const bookmarkRef = doc(db, BOOKMARKS_COLLECTION, `${userId}_${article.id}`);
    
    await setDoc(bookmarkRef, {
      userId,
      articleId: article.id,
      article: {
        ...article,
        bookmarkedAt: new Date().toISOString(),
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return false;
  }
};

export const removeBookmark = async (userId: string, articleId: string) => {
  try {
    const bookmarkRef = doc(db, BOOKMARKS_COLLECTION, `${userId}_${articleId}`);
    await deleteDoc(bookmarkRef);
    return true;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return false;
  }
};

export const getBookmarks = async (userId: string): Promise<BookmarkedArticle[]> => {
  try {
    const bookmarksQuery = query(
      collection(db, BOOKMARKS_COLLECTION),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(bookmarksQuery);
    
    const bookmarks: BookmarkedArticle[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bookmarks.push(data.article as BookmarkedArticle);
    });
    
    // Sort by bookmarked date (newest first)
    return bookmarks.sort((a, b) => {
      const dateA = new Date(a.bookmarkedAt || a.publishedAt).getTime();
      const dateB = new Date(b.bookmarkedAt || b.publishedAt).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return [];
  }
};

export const isBookmarked = async (userId: string, articleId: string): Promise<boolean> => {
  try {
    const bookmarkRef = doc(db, BOOKMARKS_COLLECTION, `${userId}_${articleId}`);
    const docSnapshot = await getDoc(bookmarkRef);
    return docSnapshot.exists();
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return false;
  }
}; 