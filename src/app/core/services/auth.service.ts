import { Injectable, signal } from '@angular/core';
import {
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

import { firebaseAuth } from '../firebase/firebase.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly currentUser = signal<User | null>(null);

  readonly authReady: Promise<User | null>;

  constructor() {
    this.authReady = new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        this.currentUser.set(user);

        resolve(user);

        unsubscribe();
      });
    });

    // Continue listening after initial restoration
    onAuthStateChanged(firebaseAuth, (user) => {
      this.currentUser.set(user);
    });
  }

  async loginWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();

    const result = await signInWithPopup(firebaseAuth, provider);

    this.currentUser.set(result.user);

    return result.user;
  }

  async logout(): Promise<void> {
    await signOut(firebaseAuth);

    this.currentUser.set(null);
  }
}
