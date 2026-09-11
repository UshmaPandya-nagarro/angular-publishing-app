import { Component, inject, signal } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { ArticleService } from '../../core/services/article';

import { AuthorService } from '../../core/services/author';

import { Article } from '../../core/models/article.model';

import { Author } from '../../core/models/author.model';
import { Comments } from './comments/comments';

@Component({
  selector: 'app-article-details',
  imports: [Comments],
  templateUrl: './article-details.html',
  styleUrl: './article-details.scss',
})
export class ArticleDetails {
  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly articleService = inject(ArticleService);

  private readonly authorService = inject(AuthorService);

  readonly article = signal<Article | null>(null);

  readonly author = signal<Author | null>(null);

  readonly authorArticles = signal<Article[]>([]);

  readonly relatedArticles = signal<Article[]>([]);

  readonly loading = signal(true);

  readonly errorMessage = signal('');

  constructor() {
    const articleId = this.route.snapshot.paramMap.get('id');

    if (!articleId) {
      this.errorMessage.set('Article not found.');

      this.loading.set(false);

      return;
    }

    this.loadArticle(articleId);
  }

  private async loadArticle(articleId: string): Promise<void> {
    try {
      const article = await this.articleService.getArticleById(articleId);

      if (!article) {
        this.errorMessage.set('Article not found.');

        return;
      }

      this.article.set(article);

      // Author details
      const author = await this.authorService.getAuthorByName(article.authorName);

      this.author.set(author);

      // Other articles by same author
      const authorArticles = await this.articleService.getArticlesByAuthor(article.authorName);

      this.authorArticles.set(authorArticles.filter((item) => item.id !== article.id));

      // Related articles
      const allArticles = await this.articleService.getPublishedArticles();

      this.relatedArticles.set(
        allArticles
          .filter((item) => item.id !== article.id && item.authorName !== article.authorName)
          .slice(0, 3),
      );
    } catch (error) {
      console.error(error);

      this.errorMessage.set('Unable to load article.');
    } finally {
      this.loading.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  openArticle(articleId?: string): void {
    if (!articleId) {
      return;
    }

    this.router.navigate(['/articles', articleId]).then(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      window.location.reload();
    });
  }
}
