import { Component, computed, inject, signal } from '@angular/core';

import { AuthorService } from '../../core/services/author';
import { Author } from '../../core/models/author.model';

@Component({
  selector: 'app-authors',
  imports: [],
  templateUrl: './authors.html',
  styleUrl: './authors.scss',
})
export class Authors {
  private readonly authorService = inject(AuthorService);

  readonly authors = signal<Author[]>([]);

  readonly searchTerm = signal('');

  readonly loading = signal(true);

  readonly errorMessage = signal('');

  readonly filteredAuthors = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();

    if (!search) {
      return this.authors();
    }

    return this.authors().filter((author) => author.name.toLowerCase().includes(search));
  });

  constructor() {
    this.loadAuthors();
  }

  private async loadAuthors(): Promise<void> {
    try {
      const authors = await this.authorService.getAuthors();

      this.authors.set(authors);
    } catch (error) {
      console.error(error);

      this.errorMessage.set('Unable to load authors.');
    } finally {
      this.loading.set(false);
    }
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
  }
}
