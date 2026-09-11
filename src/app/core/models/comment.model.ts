export interface ArticleComment {
  id?: string;

  articleId: string;

  userId: string;
  userName: string;
  userPhoto: string;

  text: string;

  createdAt: Date;

  likesCount: number;

  parentCommentId: string | null;
}
