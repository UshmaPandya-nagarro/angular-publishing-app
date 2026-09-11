import { Injectable } from '@angular/core';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';

import { firestore } from '../firebase/firebase.config';
import { Author } from '../models/author.model';

@Injectable({
  providedIn: 'root',
})
export class AuthorService {
  async getAuthors(): Promise<Author[]> {
    const authorsRef = collection(firestore, 'authors');

    const snapshot = await getDocs(authorsRef);

    return snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        name: data['name'],
        email: data['email'],
        photoURL: data['photoURL'],
        bio: data['bio'],
        specialization: data['specialization'] ?? '',
        followers: data['followers'] ?? 0,
        articleCount: data['articleCount'] ?? 0,
      } as Author;
    });
  }

  async addSampleAuthors(): Promise<void> {
    const authors: Omit<Author, 'id'>[] = [
      {
        name: 'Aarav Shah',
        email: 'aarav.shah@example.com',
        photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
        bio: 'Technology writer exploring artificial intelligence, digital culture and the future of work.',
        specialization: 'Technology',
        followers: 1250,
        articleCount: 12,
      },

      {
        name: 'Riya Mehta',
        email: 'riya.mehta@example.com',
        photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
        bio: 'Writer focused on productivity, habits and practical ideas for creating a more balanced life.',
        specialization: 'Lifestyle',
        followers: 980,
        articleCount: 8,
      },

      {
        name: 'Neel Patel',
        email: 'neel.patel@example.com',
        photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        bio: 'Frontend engineer and UX enthusiast writing about web development, design systems and product thinking.',
        specialization: 'Web Development',
        followers: 2100,
        articleCount: 18,
      },

      {
        name: 'Kavya Joshi',
        email: 'kavya.joshi@example.com',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
        bio: 'Lifestyle writer sharing thoughtful perspectives on slow living, mindfulness and meaningful routines.',
        specialization: 'Wellness',
        followers: 760,
        articleCount: 6,
      },

      {
        name: 'Dev Sharma',
        email: 'dev.sharma@example.com',
        photoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
        bio: 'Software engineer writing about modern frontend architecture, JavaScript and emerging web technologies.',
        specialization: 'Engineering',
        followers: 3200,
        articleCount: 24,
      },

      {
        name: 'Anaya Desai',
        email: 'anaya.desai@example.com',
        photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
        bio: 'Creative thinker and storyteller writing about creativity, culture and finding inspiration in everyday life.',
        specialization: 'Creativity',
        followers: 1150,
        articleCount: 10,
      },
    ];

    const authorsRef = collection(firestore, 'authors');

    for (const author of authors) {
      await addDoc(authorsRef, author);
    }
  }

  async getAuthorByName(authorName: string): Promise<Author | null> {
    const authorsRef = collection(firestore, 'authors');

    const authorQuery = query(authorsRef, where('name', '==', authorName));

    const snapshot = await getDocs(authorQuery);

    if (snapshot.empty) {
      return null;
    }

    const document = snapshot.docs[0];

    const data = document.data();

    return {
      id: document.id,
      name: data['name'],
      email: data['email'],
      photoURL: data['photoURL'],
      bio: data['bio'],
      specialization: data['specialization'] ?? '',
      followers: data['followers'] ?? 0,
      articleCount: data['articleCount'] ?? 0,
    } as Author;
  }
}
