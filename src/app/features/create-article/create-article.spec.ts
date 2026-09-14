import { ComponentFixture, TestBed } from '@angular/core/testing';

import { signal } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { User } from 'firebase/auth';

import { CreateArticle } from './create-article';

import { ArticleService } from '../../core/services/article';

import { AuthService } from '../../core/services/auth.service';

describe('CreateArticle', () => {
  let component: CreateArticle;
  let fixture: ComponentFixture<CreateArticle>;

  let articleServiceMock: {
    createArticle: ReturnType<typeof vi.fn>;

    updateArticle: ReturnType<typeof vi.fn>;

    getArticleById: ReturnType<typeof vi.fn>;
  };

  let routerMock: {
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    articleServiceMock = {
      createArticle: vi.fn(),
      updateArticle: vi.fn(),
      getArticleById: vi.fn(),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    const mockUser = {
      uid: 'user-1',
      displayName: 'Test User',
      email: 'test@example.com',
      photoURL: null,
    } as User;

    const authServiceMock = {
      currentUser: signal<User | null>(mockUser),

      authReady: Promise.resolve(mockUser),
    };

    await TestBed.configureTestingModule({
      imports: [CreateArticle],

      providers: [
        {
          provide: ArticleService,
          useValue: articleServiceMock,
        },

        {
          provide: AuthService,
          useValue: authServiceMock,
        },

        {
          provide: Router,
          useValue: routerMock,
        },

        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null,
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateArticle);

    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should not save draft when title is empty', async () => {
    component.articleForm.patchValue({
      title: '',
      description: 'Test description',
      content: '<p>Test content</p>',
    });

    await component.saveDraft();

    expect(articleServiceMock.createArticle).not.toHaveBeenCalled();

    expect(component.message()).toBe('Please enter a title first.');
  });

  it('should create a new draft', async () => {
    articleServiceMock.createArticle.mockResolvedValue('article-123');

    routerMock.navigate.mockResolvedValue(true);

    component.articleForm.patchValue({
      title: 'Angular Signals',
      description: 'Signals article',
      content: '<p>Angular Signals content</p>',
      thumbnail: '',
    });

    await component.saveDraft();

    expect(articleServiceMock.createArticle).toHaveBeenCalled();

    expect(component.articleId()).toBe('article-123');

    expect(routerMock.navigate).toHaveBeenCalledWith(['/write', 'article-123'], {
      replaceUrl: true,
    });

    expect(component.message()).toBe('Draft saved ✓');
  });

  it('should update an existing draft', async () => {
    component.articleId.set('existing-article');

    articleServiceMock.updateArticle.mockResolvedValue(undefined);

    component.articleForm.patchValue({
      title: 'Updated title',
      description: 'Updated description',
      content: '<p>Updated content</p>',
    });

    await component.saveDraft();

    expect(articleServiceMock.updateArticle).toHaveBeenCalled();

    expect(articleServiceMock.createArticle).not.toHaveBeenCalled();

    expect(component.message()).toBe('Draft saved ✓');
  });

  it('should not publish an invalid article', async () => {
    await component.publishArticle();

    expect(articleServiceMock.createArticle).not.toHaveBeenCalled();

    expect(component.message()).toBe('Please complete the article.');
  });

  it('should publish a valid article', async () => {
    articleServiceMock.createArticle.mockResolvedValue('published-123');

    routerMock.navigate.mockResolvedValue(true);

    component.articleForm.patchValue({
      title: 'Published article',
      description: 'Published description',
      content: '<p>Published content</p>',
      thumbnail: '',
      scheduledAt: '',
    });

    await component.publishArticle();

    expect(articleServiceMock.createArticle).toHaveBeenCalled();

    const article = articleServiceMock.createArticle.mock.calls[0][0];

    expect(article.status).toBe('published');

    expect(routerMock.navigate).toHaveBeenCalledWith(['/home']);
  });
});
