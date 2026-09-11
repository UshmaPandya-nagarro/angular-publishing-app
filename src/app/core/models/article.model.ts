export interface Article {
  id?: string;
  title: string;
  description: string;
  content: string;
  thumbnail: string;
  authorId: string;
  authorName: string;
  publishedAt: Date;
  views: number;
  featured: boolean;
  editorsPick: boolean;
}
