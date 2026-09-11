import { Injectable } from '@angular/core';
import {
  addDoc,
  serverTimestamp,
  query,
  collection,
  doc,
  getDoc,
  getDocs,
  where,
  updateDoc,
} from 'firebase/firestore';

import { firestore } from '../firebase/firebase.config';
import { Article } from '../models/article.model';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  async getPublishedArticles(): Promise<Article[]> {
    const articlesRef = collection(firestore, 'articles');

    const snapshot = await getDocs(articlesRef);

    const now = new Date();

    let publishedArticles = snapshot.docs
      .map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,

          title: data['title'],

          description: data['description'],

          content: data['content'],

          thumbnail: data['thumbnail'],

          authorId: data['authorId'],

          authorName: data['authorName'],

          createdAt: data['createdAt']?.toDate?.(),

          updatedAt: data['updatedAt']?.toDate?.(),

          publishedAt: data['publishedAt'] ? data['publishedAt'].toDate() : null,

          scheduledAt: data['scheduledAt'] ? data['scheduledAt'].toDate() : null,

          status: data['status'] ?? 'published',

          views: data['views'] ?? 0,

          featured: data['featured'] ?? false,

          editorsPick: data['editorsPick'] ?? false,
        } as Article;
      })
      .filter((article) => {
        // Normal published article
        if (article.status === 'published') {
          return true;
        }

        // Scheduled article whose date has arrived
        if (article.status === 'scheduled' && article.scheduledAt && article.scheduledAt <= now) {
          return true;
        }

        // Draft or future scheduled article
        return false;
      })
      .sort((a, b) => {
        const dateA = a.publishedAt?.getTime() ?? a.scheduledAt?.getTime() ?? 0;

        const dateB = b.publishedAt?.getTime() ?? b.scheduledAt?.getTime() ?? 0;

        return dateB - dateA;
      });
    console.log('Published Articles:', publishedArticles);
    return publishedArticles;
  }

  async createArticle(article: {
    title: string;
    description: string;
    content: string;
    thumbnail: string;

    authorId: string;
    authorName: string;

    status: 'draft' | 'published' | 'scheduled';

    scheduledAt?: Date | null;

    views: number;
    featured: boolean;
    editorsPick: boolean;
  }): Promise<string> {
    const articlesRef = collection(firestore, 'articles');

    const document = await addDoc(articlesRef, {
      ...article,

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp(),

      publishedAt: article.status === 'published' ? serverTimestamp() : null,
    });

    return document.id;
  }

  async getArticleById(articleId: string): Promise<Article | null> {
    const articleRef = doc(firestore, 'articles', articleId);

    const snapshot = await getDoc(articleRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();

    return {
      id: snapshot.id,

      title: data['title'],
      description: data['description'],
      content: data['content'],
      thumbnail: data['thumbnail'],

      authorId: data['authorId'],
      authorName: data['authorName'],

      createdAt: data['createdAt']?.toDate?.(),

      updatedAt: data['updatedAt']?.toDate?.(),

      publishedAt: data['publishedAt'] ? data['publishedAt'].toDate() : null,

      scheduledAt: data['scheduledAt'] ? data['scheduledAt'].toDate() : null,

      status: data['status'] ?? 'published',

      views: data['views'] ?? 0,

      featured: data['featured'] ?? false,

      editorsPick: data['editorsPick'] ?? false,
    } as Article;
  }

  async getArticlesByAuthor(authorName: string): Promise<Article[]> {
    const articlesRef = collection(firestore, 'articles');

    const articleQuery = query(articlesRef, where('authorName', '==', authorName));

    const snapshot = await getDocs(articleQuery);

    return snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        title: data['title'],
        description: data['description'],
        content: data['content'],
        thumbnail: data['thumbnail'],
        authorId: data['authorId'],
        authorName: data['authorName'],
        publishedAt: data['publishedAt']?.toDate(),
        views: data['views'] ?? 0,
        featured: data['featured'] ?? false,
        editorsPick: data['editorsPick'] ?? false,
      } as Article;
    });
  }

  async getArticlesByAuthorId(authorId: string): Promise<Article[]> {
    const articlesRef = collection(firestore, 'articles');

    const q = query(articlesRef, where('authorId', '==', authorId));

    const snapshot = await getDocs(q);

    return snapshot.docs.map((document) => {
      const data = document.data();

      return {
        id: document.id,

        title: data['title'],

        description: data['description'],

        content: data['content'],

        thumbnail: data['thumbnail'],

        authorId: data['authorId'],

        authorName: data['authorName'],

        createdAt: data['createdAt']?.toDate?.(),

        updatedAt: data['updatedAt']?.toDate?.(),

        publishedAt: data['publishedAt'] ? data['publishedAt'].toDate() : null,

        scheduledAt: data['scheduledAt'] ? data['scheduledAt'].toDate() : null,

        status: data['status'] ?? 'published',

        views: data['views'] ?? 0,

        featured: data['featured'] ?? false,

        editorsPick: data['editorsPick'] ?? false,
      } as Article;
    });
  }

  async updateArticle(
    articleId: string,
    article: {
      title: string;
      description: string;
      content: string;
      thumbnail: string;

      authorId: string;
      authorName: string;

      status: 'draft' | 'published' | 'scheduled';

      scheduledAt?: Date | null;

      publishedAt?: Date | null;

      views: number;
      featured: boolean;
      editorsPick: boolean;
    },
  ): Promise<void> {
    const articleRef = doc(firestore, 'articles', articleId);

    await updateDoc(articleRef, {
      ...article,

      updatedAt: serverTimestamp(),
    });
  }
}
