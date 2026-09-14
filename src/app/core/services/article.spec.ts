import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TestBed } from '@angular/core/testing';

import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';

import { ArticleService } from './article';

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual<typeof import('firebase/firestore')>('firebase/firestore');

  return {
    ...actual,

    collection: vi.fn(),

    addDoc: vi.fn(),

    doc: vi.fn(),

    updateDoc: vi.fn(),

    serverTimestamp: vi.fn(() => 'mock-timestamp'),
  };
});

describe('ArticleService', () => {
  let service: ArticleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ArticleService],
    });

    service = TestBed.inject(ArticleService);

    vi.clearAllMocks();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should create a new article and return document id', async () => {
    vi.mocked(collection).mockReturnValue('articles-collection' as never);

    vi.mocked(addDoc).mockResolvedValue({
      id: 'article-123',
    } as never);

    const articleData = {
      title: 'Angular Signals',

      description: 'Test description',

      content: '<p>Test content</p>',

      thumbnail: '',

      authorId: 'user-1',

      authorName: 'Test User',

      status: 'draft' as const,

      scheduledAt: null,

      views: 0,

      featured: false,

      editorsPick: false,
    };

    const result = await service.createArticle(articleData);

    expect(collection).toHaveBeenCalled();

    expect(addDoc).toHaveBeenCalled();

    expect(result).toBe('article-123');
  });

  it('should update an existing article', async () => {
    vi.mocked(doc).mockReturnValue('article-document' as never);

    vi.mocked(updateDoc).mockResolvedValue(undefined);

    const articleData = {
      title: 'Updated article',

      description: 'Updated description',

      content: '<p>Updated content</p>',

      thumbnail: '',

      authorId: 'user-1',

      authorName: 'Test User',

      status: 'draft' as const,

      scheduledAt: null,

      publishedAt: null,

      views: 0,

      featured: false,

      editorsPick: false,
    };

    await service.updateArticle('article-123', articleData);

    expect(doc).toHaveBeenCalled();

    expect(updateDoc).toHaveBeenCalled();

    expect(serverTimestamp).toHaveBeenCalled();
  });
});
