import { Component, computed, inject, signal } from '@angular/core';

import { ArticleService } from '../../core/services/article';
import { Article } from '../../core/models/article.model';

type SortOption = 'latest' | 'popular' | 'editorsPick';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly articleService = inject(ArticleService);

  readonly articles = signal<Article[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  readonly searchTerm = signal('');
  readonly sortBy = signal<SortOption>('latest');

  readonly currentPage = signal(1);
  readonly pageSize = 5;

  readonly featuredArticle = computed(() => this.articles().find((article) => article.featured));

  readonly filteredArticles = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();

    let result = this.articles().filter((article) => {
      if (!search) {
        return true;
      }

      return (
        article.title?.toLowerCase().includes(search) ||
        article.description?.toLowerCase().includes(search) ||
        article.authorName?.toLowerCase().includes(search)
      );
    });

    switch (this.sortBy()) {
      case 'popular':
        result = [...result].sort((a, b) => b.views - a.views);
        break;

      case 'editorsPick':
        result = [...result].sort((a, b) => Number(b.editorsPick) - Number(a.editorsPick));
        break;

      default:
        result = [...result].sort((a, b) => {
          const dateA = a.publishedAt ? a.publishedAt.getTime() : 0;
          const dateB = b.publishedAt ? b.publishedAt.getTime() : 0;

          return dateB - dateA;
        });
    }

    return result;
  });

  readonly nonFeaturedArticles = computed(() => {
    const featuredId = this.featuredArticle()?.id;

    return this.filteredArticles().filter((article) => article.id !== featuredId);
  });

  readonly paginatedArticles = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize;

    return this.nonFeaturedArticles().slice(startIndex, startIndex + this.pageSize);
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.nonFeaturedArticles().length / this.pageSize)),
  );

  constructor() {
    this.loadArticles();
  }

  private async loadArticles(): Promise<void> {
    try {
      const articles = await this.articleService.getArticles();

      this.articles.set(articles);
    } catch (error) {
      console.error(error);

      this.errorMessage.set('Unable to load articles.');
    } finally {
      this.loading.set(false);
    }
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  onSortChange(value: string): void {
    this.sortBy.set(value as SortOption);
    this.currentPage.set(1);
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((page) => page + 1);
    }
  }
}
