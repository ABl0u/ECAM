import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden">
      <!-- Decorational Gradients -->
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/30 blur-[100px]"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-200/30 blur-[100px]"></div>

      <div class="bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-[420px] border border-white relative z-10">
        
        <div class="text-center mb-8">
          <!-- Logo Image via URL Supabase -->
          <div class="flex justify-center items-center mb-6">
             <img src="https://jxlwtljgztyilntjxapm.supabase.co/storage/v1/object/sign/ECAM/ecamlogo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lMDgxOTE4ZS02NWM3LTRjYTMtOWQxMy1lNDY5YjU0ZDA3OGYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJFQ0FNL2VjYW1sb2dvLnBuZyIsImlhdCI6MTc3MDE0ODQ1NCwiZXhwIjoxODAxNjg0NDU0fQ.ErPjqLYmQjhcr9kGtLADdpacDztqLQtB2yNbpEZsfQE" alt="Logo ECAM" class="w-auto h-48 object-contain drop-shadow-sm">
          </div>
          <h1 class="text-2xl font-bold text-slate-800">Bienvenue</h1>
          <p class="text-slate-500 text-sm mt-2">Connectez-vous à votre espace scolaire</p>
        </div>

        @if (!showChangePassword()) {
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-5">
            @if (error()) {
              <div class="bg-red-50/50 text-red-600 px-4 py-3 rounded-xl text-sm text-center border border-red-100 flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {{ error() }}
              </div>
            }

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 ml-1">Identifiant</label>
                <input type="text" formControlName="username" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-slate-800 placeholder:text-slate-400" placeholder="Votre identifiant">
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 ml-1">Mot de passe</label>
                <input type="password" formControlName="password" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-slate-800 placeholder:text-slate-400" placeholder="••••••••">
              </div>
            </div>

            <button type="submit" [disabled]="loginForm.invalid" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3.5 rounded-2xl transition-all duration-200 shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              Se connecter
            </button>
            
            <div class="mt-8 pt-6 border-t border-slate-100 text-center">
              <p class="text-xs text-slate-400">Comptes démo disponibles :</p>
              <div class="flex flex-wrap justify-center gap-2 mt-2 text-xs text-blue-600 font-medium">
                <span class="bg-blue-50 px-2 py-1 rounded-lg cursor-help" title="Pass: admin123">directeur</span>
                <span class="bg-blue-50 px-2 py-1 rounded-lg cursor-help" title="Pass: admin123">prof.math</span>
                <span class="bg-blue-50 px-2 py-1 rounded-lg cursor-help" title="Pass: admin123">eleve1</span>
              </div>
            </div>
          </form>
        } @else {
          <!-- Change Password Form -->
          <div class="space-y-6 animate-scale-in">
            <div class="bg-amber-50 text-amber-900 p-4 rounded-2xl text-sm border border-amber-100 flex gap-3">
              <svg class="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              <div>
                <p class="font-bold mb-1">Sécurité du compte</p>
                <p class="text-amber-800/80">Veuillez définir votre mot de passe personnel pour continuer.</p>
              </div>
            </div>

            <form [formGroup]="changePassForm" (ngSubmit)="onChangePassword()" class="space-y-6">
               <div>
                <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 ml-1">Nouveau mot de passe</label>
                <input type="password" formControlName="newPassword" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200">
              </div>
              
              <div class="space-y-3">
                <button type="submit" [disabled]="changePassForm.invalid" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-600/20">
                  Enregistrer et continuer
                </button>
                <button type="button" (click)="onSkip()" class="w-full text-slate-500 hover:text-slate-800 text-sm font-medium py-2 transition-colors">
                  Passer pour le moment
                </button>
              </div>
            </form>
          </div>
        }
      </div>
    </div>
  `
})
export class LoginComponent {
  auth = inject(AuthService);
  router: Router = inject(Router);
  fb: FormBuilder = inject(FormBuilder);

  error = signal<string>('');
  showChangePassword = signal(false);

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  changePassForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(4)]]
  });

  constructor() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onLogin() {
    this.error.set('');
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      const success = this.auth.login(username!, password!);
      
      if (success) {
        if (this.auth.isFirstLogin()) {
          this.showChangePassword.set(true);
        } else {
          this.router.navigate(['/dashboard']);
        }
      } else {
        this.error.set('Identifiant ou mot de passe incorrect');
      }
    }
  }

  onChangePassword() {
    if (this.changePassForm.valid) {
      const { newPassword } = this.changePassForm.value;
      this.auth.changePassword(newPassword!);
    }
  }

  onSkip() {
    this.auth.skipPasswordChange();
  }
}