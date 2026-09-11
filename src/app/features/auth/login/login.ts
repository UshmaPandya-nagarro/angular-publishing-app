import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  errorMessage = '';

  async loginWithGoogle(): Promise<void> {
    try {
      this.loading = true;
      this.errorMessage = '';
      await this.authService.loginWithGoogle();
      await this.router.navigate(['/home']);
    } catch (error) {
      console.error('Google login failed:', error);
      this.errorMessage = 'Google sign-in failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}
