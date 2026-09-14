import { Component, inject, signal, OnDestroy } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { QuillModule } from 'ngx-quill';

import { ArticleService } from '../../core/services/article';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-create-article',
  imports: [ReactiveFormsModule, QuillModule],
  templateUrl: './create-article.html',
  styleUrl: './create-article.scss',
})
export class CreateArticle implements OnDestroy {
  private readonly fb = inject(FormBuilder);

  private readonly articleService = inject(ArticleService);

  private readonly authService = inject(AuthService);

  private readonly router = inject(Router);

  private readonly route = inject(ActivatedRoute);

  readonly articleId = signal<string | null>(null);

  readonly loading = signal(false);

  readonly saving = signal(false);

  readonly publishing = signal(false);

  readonly message = signal('');

  readonly wordCount = signal(0);

  readonly characterCount = signal(0);

  readonly readingTime = signal(0);

  private worker?: Worker;

  readonly articleForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],

    description: ['', [Validators.required, Validators.maxLength(300)]],

    thumbnail: [''],

    content: ['', Validators.required],

    scheduledAt: [''],
  });

  readonly editorModules = {
    toolbar: [
      [
        {
          header: [1, 2, 3, false],
        },
      ],

      ['bold', 'italic', 'underline'],

      [
        {
          list: 'ordered',
        },
        {
          list: 'bullet',
        },
      ],

      ['blockquote', 'code-block'],

      ['link', 'image', 'video'],

      ['clean'],
    ],
  };

  constructor() {
    this.loadArticleIfEditing();

    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(new URL('./article-analysis.worker', import.meta.url));

      this.worker.onmessage = ({ data }) => {
        this.wordCount.set(data.wordCount);

        this.characterCount.set(data.characterCount);

        this.readingTime.set(data.readingTime);
      };

      this.articleForm.controls.content.valueChanges.subscribe((content) => {
        this.worker?.postMessage(content);
      });
    }
  }

  private async loadArticleIfEditing(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    try {
      this.loading.set(true);

      const article = await this.articleService.getArticleById(id);

      if (!article) {
        this.message.set('Draft not found.');

        return;
      }

      this.articleId.set(id);

      this.articleForm.patchValue({
        title: article.title ?? '',

        description: article.description ?? '',

        thumbnail: article.thumbnail ?? '',

        content: article.content ?? '',

        scheduledAt: article.scheduledAt ? this.formatDateForInput(article.scheduledAt) : '',
      });

      this.message.set(article.status === 'draft' ? 'Draft loaded' : 'Article loaded');
    } catch (error) {
      console.error('Unable to load article', error);

      this.message.set('Unable to load draft.');
    } finally {
      this.loading.set(false);
    }
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, '0');

    const day = String(date.getDate()).padStart(2, '0');

    const hours = String(date.getHours()).padStart(2, '0');

    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private cleanArticleContent(content: string): string {
    return content.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ');
  }

  async saveDraft(): Promise<void> {
    const user = this.authService.currentUser();

    if (!user) {
      return;
    }

    const formValue = this.articleForm.getRawValue();

    if (!formValue.title.trim()) {
      this.message.set('Please enter a title first.');

      return;
    }

    const articleData = {
      title: formValue.title,

      description: formValue.description,

      content: this.cleanArticleContent(formValue.content),

      thumbnail: formValue.thumbnail,

      authorId: user.uid,

      authorName: user.displayName ?? user.email ?? 'Anonymous',

      status: 'draft' as const,

      scheduledAt: null,

      publishedAt: null,

      views: 0,

      featured: false,

      editorsPick: false,
    };

    try {
      this.saving.set(true);

      if (this.articleId()) {
        await this.articleService.updateArticle(this.articleId()!, articleData);
      } else {
        const id = await this.articleService.createArticle(articleData);

        this.articleId.set(id);

        await this.router.navigate(['/write', id], {
          replaceUrl: true,
        });
      }

      this.message.set('Draft saved ✓');
    } catch (error) {
      console.error(error);

      this.message.set('Unable to save draft');
    } finally {
      this.saving.set(false);
    }
  }

  async publishArticle(): Promise<void> {
    const user = this.authService.currentUser();

    if (!user) {
      return;
    }

    if (this.articleForm.invalid) {
      this.articleForm.markAllAsTouched();

      this.message.set('Please complete the article.');

      return;
    }

    const formValue = this.articleForm.getRawValue();

    const scheduledDate = formValue.scheduledAt ? new Date(formValue.scheduledAt) : null;

    const isFutureDate = !!scheduledDate && scheduledDate.getTime() > Date.now();

    const status: 'published' | 'scheduled' = isFutureDate ? 'scheduled' : 'published';

    const articleData = {
      title: formValue.title,

      description: formValue.description,

      content: this.cleanArticleContent(formValue.content),

      thumbnail: formValue.thumbnail,

      authorId: user.uid,

      authorName: user.displayName ?? user.email ?? 'Anonymous',

      status,

      scheduledAt: isFutureDate ? scheduledDate : null,

      publishedAt: status === 'published' ? new Date() : null,

      views: 0,

      featured: false,

      editorsPick: false,
    };

    try {
      this.publishing.set(true);

      if (this.articleId()) {
        await this.articleService.updateArticle(this.articleId()!, articleData);
      } else {
        const id = await this.articleService.createArticle(articleData);

        this.articleId.set(id);
      }

      await this.router.navigate(['/home']);
    } catch (error) {
      console.error(error);

      this.message.set('Unable to publish article.');
    } finally {
      this.publishing.set(false);
    }
  }

  ngOnDestroy(): void {
    this.worker?.terminate();
  }
}
