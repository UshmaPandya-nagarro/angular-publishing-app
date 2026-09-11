import { Component, Input, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';

import { ArticleComment } from '../../../core/models/comment.model';

import { CommentService } from '../../../core/services/comment';

import { AuthService } from '../../../core/services/auth.service';

type CommentSort = 'newest' | 'oldest' | 'liked';

@Component({
  selector: 'app-comments',
  imports: [],
  templateUrl: './comments.html',
  styleUrl: './comments.scss',
})
export class Comments implements OnInit, OnDestroy {
  @Input({ required: true })
  articleId!: string;

  private readonly commentService = inject(CommentService);

  readonly authService = inject(AuthService);

  readonly avatarLoadFailed = signal(false);

  readonly comments = signal<ArticleComment[]>([]);

  readonly commentText = signal('');

  readonly sortBy = signal<CommentSort>('newest');

  readonly replyingTo = signal<ArticleComment | null>(null);

  readonly replyText = signal('');

  readonly posting = signal(false);

  private unsubscribeComments?: () => void;

  readonly topLevelComments = computed(() => {
    let comments = this.comments().filter((comment) => !comment.parentCommentId);

    switch (this.sortBy()) {
      case 'oldest':
        comments = [...comments].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        break;

      case 'liked':
        comments = [...comments].sort((a, b) => b.likesCount - a.likesCount);

        break;

      default:
        comments = [...comments].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return comments;
  });

  ngOnInit(): void {
    console.log('Current Firebase user:', this.authService.currentUser());

    console.log('Photo URL:', this.authService.currentUser()?.photoURL);

    this.unsubscribeComments = this.commentService.listenToComments(this.articleId, (comments) => {
      this.comments.set(comments);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeComments?.();
  }

  onAvatarError(): void {
    this.avatarLoadFailed.set(true);
  }

  getReplies(commentId?: string): ArticleComment[] {
    if (!commentId) {
      return [];
    }

    return this.comments()
      .filter((comment) => comment.parentCommentId === commentId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  onCommentInput(value: string): void {
    this.commentText.set(value);
  }

  onReplyInput(value: string): void {
    this.replyText.set(value);
  }

  changeSort(value: string): void {
    this.sortBy.set(value as CommentSort);
  }

  startReply(comment: ArticleComment): void {
    this.replyingTo.set(comment);

    this.replyText.set('');
  }

  cancelReply(): void {
    this.replyingTo.set(null);

    this.replyText.set('');
  }

  async postComment(): Promise<void> {
    const text = this.commentText().trim();

    const user = this.authService.currentUser();

    if (!text || !user) {
      return;
    }

    try {
      this.posting.set(true);

      await this.commentService.addComment(this.articleId, {
        userId: user.uid,

        userName: user.displayName ?? user.email ?? 'Anonymous',

        userPhoto: user.photoURL ?? '',

        text,

        parentCommentId: null,
      });

      this.commentText.set('');
    } catch (error) {
      console.error('Unable to post comment', error);
    } finally {
      this.posting.set(false);
    }
  }

  async postReply(): Promise<void> {
    const parent = this.replyingTo();

    const user = this.authService.currentUser();

    const text = this.replyText().trim();

    if (!parent?.id || !user || !text) {
      return;
    }

    await this.commentService.addComment(this.articleId, {
      userId: user.uid,

      userName: user.displayName ?? user.email ?? 'Anonymous',

      userPhoto: user.photoURL ?? '',

      text,

      parentCommentId: parent.id,
    });

    this.cancelReply();
  }

  async likeComment(comment: ArticleComment): Promise<void> {
    if (!comment.id) {
      return;
    }

    await this.commentService.likeComment(this.articleId, comment.id);
  }
}
