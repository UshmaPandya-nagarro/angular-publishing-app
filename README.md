# OnlinePublishingPlatform

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.23.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

# Online Publishing Platform

A modern online publishing platform built using **Angular 21** and **Firebase**.

The application allows writers to create, edit, save, schedule, and publish rich-text articles, while readers can discover articles, explore authors, read content, comment, reply to comments, and interact with published posts.

## Live Application

**Deployed Application:**  
https://online-publishing-app.web.app

**GitHub Repository:**  
https://github.com/UshmaPandya-nagarro/angular-publishing-app

---

## Features

### Authentication

- Google Sign-In using Firebase Authentication
- Persistent authentication
- Protected application routes
- User profile information
- Logout functionality

### Article Feed

- Displays published articles
- Featured articles
- Article thumbnails
- Author and publication information
- Search articles
- Sort articles
- Client-side pagination
- Draft and future scheduled articles are excluded from the public feed

### Explore Authors

- Author directory
- Author profile pictures
- Author biography
- Specialization
- Article and follower information
- Search authors by name

### Article Details

- Full rich-text article rendering
- Article title and cover image
- Author information
- Publication date
- Author biography
- More articles from the same author
- Related article recommendations

### Comments

Readers can interact with articles using:

- Comments
- Threaded replies
- Comment likes
- Sort by newest
- Sort by oldest
- Sort by most liked
- User profile pictures
- Real-time comment updates using Firestore listeners

### Rich Text Article Editor

Articles are created using the open-source **Quill rich-text editor**.

The editor supports:

- Headings
- Bold
- Italic
- Underline
- Ordered lists
- Bullet lists
- Images

The editor also cleans pasted content to improve formatting and rendering consistency.

### Draft Management

Writers can save unfinished articles as drafts.

The first save creates the article in Firestore and subsequent saves update the same document rather than creating duplicate drafts.

Drafts can be reopened using:

`/write/:id`

The saved article is fetched from Firestore and automatically populated into the editor.

### My Posts

Writers can manage their content through the **My Posts** page.

Posts are categorized into:

- Drafts
- Published
- Scheduled

Writers can reopen drafts and scheduled posts for editing and view published articles.

### Scheduled Publishing

Writers can select a future publication date and time.

Scheduled articles remain hidden from the public article feed until their scheduled publication time is reached.

---

## Web Worker

The application uses a **Web Worker** for article-content analysis.

While the writer creates an article, the worker calculates:

- Word count
- Character count
- Estimated reading time

Example:

`1,245 words · 7,832 characters · 7 min read`

The calculation runs outside the browser's main UI thread.

This demonstrates the use of background processing for computational work without unnecessarily blocking Angular's main rendering thread.

---

## Technology Stack

### Frontend

- Angular 21
- TypeScript
- Angular Signals
- Reactive Forms
- SCSS
- Angular Router
- Quill
- ngx-quill

### Backend / Cloud Services

- Firebase Authentication
- Cloud Firestore
- Firebase Hosting

---

## Architecture

The project follows a feature-based Angular architecture.

```text
src/app
│
├── core
│   ├── firebase
│   ├── guards
│   └── services
│
├── features
│   ├── login
│   ├── home
│   ├── authors
│   ├── article-details
│   ├── create-article
│   └── my-posts
│
├── models
│
└── app.routes.ts
```

Reusable business logic and Firebase communication are handled through Angular services, while individual application features are separated into their own components.

---

## State Management

The application primarily uses **Angular Signals** for local and shared reactive state.

Examples include:

- Current authenticated user
- Article lists
- Search state
- Loading state
- Editor state
- Comment state
- Active My Posts tab
- Web Worker article statistics

A larger external state-management library such as NgRx was intentionally not introduced because the current application's state requirements can be handled cleanly using Angular Signals and services without unnecessary complexity.

---

## Performance Optimizations

Several techniques are used to improve application performance.

### Lazy Loaded Routes

Feature components are lazy loaded using Angular's standalone `loadComponent()` API.

Example:

```typescript
{
  path: 'write',
  loadComponent: () =>
    import('./features/create-article/create-article')
      .then(m => m.CreateArticle)
}
```

This prevents all feature components from being included in the initial application load.

### Web Worker

Article text analysis is performed using a Web Worker so that processing can occur outside the main browser UI thread.

### Angular Signals

Signals provide fine-grained reactive state updates without introducing unnecessary application-wide state-management overhead.

### Client-side Pagination

The article feed displays a limited number of articles per page to avoid rendering the complete article list simultaneously.

### Firestore Real-Time Listeners

Comments use Firestore listeners to update the UI when comment data changes without requiring manual page refreshes.

---

## Firebase Data Structure

The application primarily uses the following Firestore collections:

```text
articles
authors
```

Comments are stored as article subcollections:

```text
articles
   └── articleId
         └── comments
               └── commentId
```

Articles can have one of the following states:

```text
draft
published
scheduled
```

This allows drafts, published content, and scheduled content to share the same article model while application queries and business logic determine their visibility.

---

## Authentication

Authentication is handled using Firebase Authentication with the Google provider.

Users must authenticate before accessing protected functionality such as:

- Creating articles
- Saving drafts
- Managing posts
- Posting comments

---

## Installation

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Navigate to the project:

```bash
cd online-publishing-platform
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
ng serve
```

Open:

```text
http://localhost:4200
```

---

## Production Build

Create a production build using:

```bash
ng build
```

The production application is generated inside the Angular `dist` directory.

---

## Deployment

The application is deployed using **Firebase Hosting**.

Deployment command:

```bash
firebase deploy --only hosting
```

Live application:

https://online-publishing-app.web.app

---

## Testing

Run unit tests using:

```bash
ng test
```

Unit tests cover key application functionality including component behavior and service logic.

---

## User Credentials

The application uses **Google Authentication**, therefore no predefined username/password is required.

Users can sign in using their Google account.

---

## Author

Developed as a Frontend Development assignment using Angular 21 and Firebase.
