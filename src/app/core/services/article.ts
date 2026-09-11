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
} from 'firebase/firestore';

import { firestore } from '../firebase/firebase.config';
import { Article } from '../models/article.model';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  async getArticles(): Promise<Article[]> {
    const articlesRef = collection(firestore, 'articles');

    const articlesQuery = query(articlesRef);

    const snapshot = await getDocs(articlesQuery);

    console.log(
      'Fetched articles:',
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
    );

    const articles = snapshot.docs.map((doc) => {
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

    return articles;
    //   .sort((a, b) => {
    //   console.log('Comparing articles:', a, b);
    //   return b.publishedAt.getTime() - a.publishedAt.getTime();
    // });
  }

  async createArticle(article: Omit<Article, 'id' | 'publishedAt'>): Promise<string> {
    const articlesRef = collection(firestore, 'articles');

    const docRef = await addDoc(articlesRef, {
      ...article,
      publishedAt: serverTimestamp(),
    });

    return docRef.id;
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
      publishedAt: data['publishedAt']?.toDate(),
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
}
