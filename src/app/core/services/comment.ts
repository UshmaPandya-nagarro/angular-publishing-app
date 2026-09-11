import { Injectable } from '@angular/core';

import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import { firestore } from '../firebase/firebase.config';

import { ArticleComment } from '../models/comment.model';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  listenToComments(articleId: string, callback: (comments: ArticleComment[]) => void): () => void {
    const commentsRef = collection(firestore, 'articles', articleId, 'comments');

    const commentsQuery = query(commentsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const comments = snapshot.docs.map((document) => {
        const data = document.data();

        return {
          id: document.id,

          articleId,

          userId: data['userId'],

          userName: data['userName'],

          userPhoto: data['userPhoto'] ?? '',

          text: data['text'],

          createdAt: data['createdAt']?.toDate?.() ?? new Date(),

          likesCount: data['likesCount'] ?? 0,

          parentCommentId: data['parentCommentId'] ?? null,
        } as ArticleComment;
      });

      callback(comments);
    });

    return unsubscribe;
  }

  async addComment(
    articleId: string,
    comment: {
      userId: string;
      userName: string;
      userPhoto: string;
      text: string;
      parentCommentId: string | null;
    },
  ): Promise<void> {
    const commentsRef = collection(firestore, 'articles', articleId, 'comments');

    await addDoc(commentsRef, {
      ...comment,

      createdAt: serverTimestamp(),

      likesCount: 0,
    });
  }

  async likeComment(articleId: string, commentId: string): Promise<void> {
    const commentRef = doc(firestore, 'articles', articleId, 'comments', commentId);

    await updateDoc(commentRef, {
      likesCount: increment(1),
    });
  }
}
