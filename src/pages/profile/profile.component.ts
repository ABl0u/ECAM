import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-6 animate-slide-up pb-10">
       
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Mon Profil</h2>
          <p class="text-slate-500 font-medium mt-1">Gérez vos informations personnelles et votre sécurité.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left Column: Identity Card (4 columns) -->
        <div class="lg:col-span-4 space-y-6">
          <div class="bg-white rounded-[2rem] shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative group transition-all hover:shadow-lg">
            <!-- Decorative Background -->
            <div class="h-32 bg-gradient-to-br from-indigo-600 to-violet-600 relative overflow-hidden">
               <div class="absolute inset-0 bg-white/10 opacity-30" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 20px 20px;"></div>
               <div class="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
            </div>
            
            <div class="px-8 pb-8 text-center relative">
               <!-- Avatar -->
               <div class="w-32 h-32 mx-auto -mt-16 rounded-[2rem] bg-white p-2 shadow-xl shadow-slate-900/5 transition-transform duration-500 group-hover:scale-105">
                 <div class="w-full h-full bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-5xl font-bold text-indigo-600 border border-slate-100">
                    {{ user()?.name?.charAt(0) }}
                 </div>
               </div>
               
               <div class="mt-5">
                 <h2 class="text-2xl font-bold text-slate-900">{{ user()?.name }}</h2>
                 <!-- CONTRASTE AMÉLIORÉ: text-slate-500 -->
                 <p class="text-slate-500 font-semibold text-sm mt-1">@ {{ user()?.username }}</p>
                 
                 <div class="mt-5 flex flex-wrap justify-center gap-2">
                    <span class="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wide border border-indigo-100">
                      {{ formatRole(user()?.role) }}
                    </span>
                 </div>
               </div>

               <div class="mt-8 pt-6 border-t border-slate-50 flex justify-between text-sm">
                  <div class="text-center flex-1 border-r border-slate-100">
                     <!-- CONTRASTE AMÉLIORÉ: text-slate-500 -->
                     <p class="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-1">ID Système</p>
                     <p class="font-mono font-bold text-slate-700">{{ user()?.id }}</p>
                  </div>
                  <div class="text-center flex-1">
                     <!-- CONTRASTE AMÉLIORÉ: text-slate-500 -->
                     <p class="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-1">Statut Compte</p>
                     <div class="flex items-center justify-center gap-1.5">
                       <span class="relative flex h-2.5 w-2.5">
                          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                       <span class="font-bold text-emerald-700 text-xs">Actif</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <!-- Quick Actions or Info (Optional) -->
          <div class="bg-indigo-900 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden">
             <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
             <h4 class="font-bold text-lg mb-2 relative z-10">Besoin d'aide ?</h4>
             <p class="text-indigo-200 text-sm mb-4 relative z-10 leading-relaxed">Contactez l'administration pour toute modification d'état civil ou de rôle.</p>
             <button class="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-colors border border-white/10 relative z-10">Contacter le support</button>
          </div>
        </div>

        <!-- Right Column: Details & Security (8 columns) -->
        <div class="lg:col-span-8 space-y-6">
          
          <!-- Contextual Info Card -->
          @if (user()?.classId || user()?.subject) {
            <div class="bg-white p-8 rounded-[2rem] shadow-[0_2px_20px_rgb(0,0,0,0.03)] border border-slate-100 animate-fade-in">
               <h3 class="font-bold text-xl text-slate-900 mb-6 flex items-center gap-3">
                 <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                 </div>
                 Informations Académiques
               </h3>
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  @if (user()?.classId) {
                     <div class="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-indigo-100 transition-colors">
                        <div>
                            <!-- CONTRASTE AMÉLIORÉ: text-slate-500 -->
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Classe Principale</p>
                            <p class="text-2xl font-bold text-slate-900">{{ user()?.classId }}</p>
                        </div>
                        <div class="text-slate-300 group-hover:text-indigo-400 transition-colors">
                            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                        </div>
                     </div>
                  }
                  @if (user()?.subject) {
                     <div class="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-indigo-100 transition-colors">
                        <div>
                            <!-- CONTRASTE AMÉLIORÉ: text-slate-500 -->
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Matière Enseignée</p>
                            <p class="text-2xl font-bold text-slate-900">{{ user()?.subject }}</p>
                        </div>
                        <div class="text-slate-300 group-hover:text-indigo-400 transition-colors">
                            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                        </div>
                     </div>
                  }
               </div>
            </div>
          }

          <!-- Security Section -->
          <div class="bg-white p-8 rounded-[2rem] shadow-[0_2px_20px_rgb(0,0,0,0.03)] border border-slate-100 relative overflow-hidden">
             <!-- Background Blur Element -->
             <div class="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

             <div class="relative z-10">
                <div class="flex items-start gap-4 mb-8">
                   <div class="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/10 flex-shrink-0">
                      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                   </div>
                   <div>
                      <h3 class="font-bold text-xl text-slate-900">Paramètres de Sécurité</h3>
                      <p class="text-slate-500 font-medium mt-1 leading-relaxed">Nous vous recommandons d'utiliser un mot de passe fort (lettres, chiffres et symboles) pour protéger votre compte.</p>
                   </div>
                </div>

                <form [formGroup]="passForm" (ngSubmit)="updatePassword()" class="space-y-6 max-w-xl">
                   <div class="space-y-4">
                       <div>
                          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 ml-1">Nouveau mot de passe</label>
                          <div class="relative group">
                              <input type="password" formControlName="newPass" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pl-4 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium group-hover:border-slate-300" placeholder="••••••••">
                              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                              </div>
                          </div>
                       </div>
                       <div>
                          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 ml-1">Confirmer le mot de passe</label>
                           <div class="relative group">
                              <input type="password" formControlName="confirmPass" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pl-4 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium group-hover:border-slate-300" placeholder="••••••••">
                           </div>
                       </div>
                   </div>

                   @if (message()) {
                     <div [class]="messageType() === 'SUCCESS' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'" class="px-5 py-4 rounded-xl text-sm font-bold border flex items-center gap-3 animate-fade-in shadow-sm">
                       <div [class]="messageType() === 'SUCCESS' ? 'bg-emerald-200 text-emerald-700' : 'bg-rose-200 text-rose-700'" class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                          @if (messageType() === 'SUCCESS') {
                             <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                          } @else {
                             <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
                          }
                       </div>
                       <div>
                         <p class="font-extrabold">{{ messageType() === 'SUCCESS' ? 'Succès' : 'Erreur' }}</p>
                         <p class="font-medium opacity-90">{{ message() }}</p>
                       </div>
                     </div>
                   }

                   <div class="pt-2 flex items-center gap-4">
                      <button type="submit" [disabled]="passForm.invalid" class="px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-xl shadow-slate-900/10 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        Mettre à jour
                      </button>
                      <button type="button" (click)="passForm.reset()" class="px-6 py-3.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">
                        Annuler
                      </button>
                   </div>
                </form>
             </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class ProfileViewComponent {
  auth = inject(AuthService);
  fb: FormBuilder = inject(FormBuilder);
  
  user = this.auth.currentUser;
  
  passForm = this.fb.group({
    newPass: ['', [Validators.required, Validators.minLength(4)]],
    confirmPass: ['', Validators.required]
  });

  message = signal('');
  messageType = signal<'SUCCESS' | 'ERROR'>('SUCCESS');

  updatePassword() {
    const { newPass, confirmPass } = this.passForm.value;
    
    if (newPass !== confirmPass) {
      this.message.set("Les mots de passe ne correspondent pas.");
      this.messageType.set('ERROR');
      return;
    }
    
    this.auth.changePassword(newPass!);
    this.message.set("Votre mot de passe a été mis à jour avec succès.");
    this.messageType.set('SUCCESS');
    this.passForm.reset();
    
    // Auto clear message after 3s
    setTimeout(() => this.message.set(''), 3000);
  }

  formatRole(role: string | undefined): string {
    switch(role) {
      case 'DIRECTEUR': return 'Directeur';
      case 'ADMINISTRATIF': return 'Admin.';
      case 'PROF_LYCEE': return 'Ens. Lycée';
      case 'PROF_PRIMAIRE': return 'Ens. Primaire';
      case 'ELEVE': return 'Élève';
      case 'COMPTABLE': return 'Comptable';
      default: return 'Utilisateur';
    }
  }
}