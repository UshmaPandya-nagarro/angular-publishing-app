import { Injectable } from '@angular/core';
import { addDoc, collection, getDocs, serverTimestamp, query } from 'firebase/firestore';

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

  async addSampleArticles(): Promise<void> {
    const articles: Omit<Article, 'id' | 'publishedAt'>[] = [
      {
        title: 'The Future of Artificial Intelligence',
        description:
          'How artificial intelligence is changing the way we work, create and solve everyday problems.',
        content: 'Artificial intelligence is transforming industries across the world...',
        thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
        authorId: 'author_1',
        authorName: 'Aarav Shah',
        views: 1250,
        featured: true,
        editorsPick: true,
      },
      {
        title: 'Building Better Habits in a Busy World',
        description: 'Simple strategies for creating habits that actually last.',
        content: 'Building good habits does not require changing everything overnight...',
        thumbnail: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b',
        authorId: 'author_2',
        authorName: 'Riya Mehta',
        views: 870,
        featured: false,
        editorsPick: true,
      },
      {
        title: 'Why Great User Experience Matters',
        description:
          'A practical look at how thoughtful design can make digital products easier and more enjoyable to use.',
        content: 'Great user experience starts with understanding the people using the product...',
        thumbnail: 'https://images.unsplash.com/photo-1559028012-481c04fa702d',
        authorId: 'author_3',
        authorName: 'Neel Patel',
        views: 2100,
        featured: false,
        editorsPick: false,
      },
      {
        title: 'The Art of Slow Living',
        description: 'Why slowing down can sometimes help us achieve more and live better.',
        content: 'Modern life encourages us to constantly move faster...',
        thumbnail: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
        authorId: 'author_4',
        authorName: 'Kavya Joshi',
        views: 640,
        featured: false,
        editorsPick: false,
      },
      {
        title: 'Modern Web Development in 2026',
        description:
          'Exploring the tools, frameworks and techniques shaping modern frontend development.',
        content: 'Frontend development continues to evolve rapidly...',
        thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
        authorId: 'author_5',
        authorName: 'Dev Sharma',
        views: 3250,
        featured: false,
        editorsPick: true,
      },
      {
        title: 'Finding Creativity in Everyday Life',
        description:
          'Creative thinking is not limited to artists. Small changes can help anyone become more creative.',
        content: 'Creativity often begins with curiosity...',
        thumbnail: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f',
        authorId: 'author_6',
        authorName: 'Anaya Desai',
        views: 920,
        featured: false,
        editorsPick: false,
      },
    ];

    for (const article of articles) {
      await this.createArticle(article);
    }
  }
}
