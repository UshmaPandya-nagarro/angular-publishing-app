import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'authors',
    canActivate: [authGuard],
    loadComponent: () => import('./features/authors/authors').then((m) => m.Authors),
  },
  {
    path: 'articles/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/article-details/article-details').then((m) => m.ArticleDetails),
  },
  {
    path: 'write',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/create-article/create-article').then((m) => m.CreateArticle),
  },
  {
    path: 'write/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/create-article/create-article').then((m) => m.CreateArticle),
  },
  {
    path: 'my-posts',
    canActivate: [authGuard],
    loadComponent: () => import('./features/my-posts/my-posts').then((m) => m.MyPosts),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
