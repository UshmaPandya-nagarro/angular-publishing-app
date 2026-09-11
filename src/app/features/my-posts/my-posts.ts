import { Component, computed, inject, signal } from '@angular/core';

import { Router } from '@angular/router';

import { DatePipe } from '@angular/common';

import { ArticleService } from '../../core/services/article';

import { AuthService } from '../../core/services/auth.service';

import { Article } from '../../core/models/article.model';

@Component({
  selector: 'app-my-posts',
  imports: [DatePipe],
  templateUrl: './my-posts.html',
  styleUrl: './my-posts.scss',
})
export class MyPosts {
  private readonly articleService = inject(ArticleService);

  private readonly authService = inject(AuthService);

  private readonly router = inject(Router);

  readonly articles = signal<Article[]>([]);

  readonly activeTab = signal<'draft' | 'published' | 'scheduled'>('draft');

  readonly loading = signal(true);

  readonly filteredArticles = computed(() => {
    return this.articles()
      .filter((article) => article.status === this.activeTab())
      .sort((a, b) => {
        const dateA = a.updatedAt?.getTime() ?? a.createdAt?.getTime() ?? 0;

        const dateB = b.updatedAt?.getTime() ?? b.createdAt?.getTime() ?? 0;

        return dateB - dateA;
      });
  });

  constructor() {
    this.loadPosts();
  }

  private async loadPosts(): Promise<void> {
    const user = this.authService.currentUser();

    if (!user) {
      this.loading.set(false);
      return;
    }

    try {
      const articles = await this.articleService.getArticlesByAuthorId(user.uid);

      this.articles.set(articles);
    } catch (error) {
      console.error('Unable to load posts', error);
    } finally {
      this.loading.set(false);
    }
  }

  setTab(tab: 'draft' | 'published' | 'scheduled'): void {
    this.activeTab.set(tab);
  }

  editArticle(article: Article): void {
    if (!article.id) {
      return;
    }

    this.router.navigate(['/write', article.id]);
  }

  viewArticle(article: Article): void {
    if (!article.id) {
      return;
    }

    this.router.navigate(['/articles', article.id]);
  }
}
