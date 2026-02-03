import { Component, inject, signal, computed, ViewChild, ElementRef, effect, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, UserRole } from '../../services/auth.service';
import { SchoolService } from '../../services/school.service';
import { AdminViewComponent } from '../admin/admin.component';
import { TeacherViewComponent } from '../teacher/teacher.component';
import { StudentViewComponent } from '../student/student.component';
import { FinanceViewComponent } from '../finance/finance.component';
import { ProfileViewComponent } from '../profile/profile.component';
import * as d3 from 'd3';

type ViewType = 'HOME' | 'GRADES' | 'TEXTBOOK' | 'FINANCE' | 'ADMIN' | 'PROFILE' | 'ABSENCES';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AdminViewComponent, TeacherViewComponent, StudentViewComponent, FinanceViewComponent, ProfileViewComponent],
  template: `
    <div class="min-h-screen bg-[#f1f5f9] flex font-sans text-slate-600">
      <!-- Sidebar (Fond Sombre -> Texte Clair) -->
      <aside class="w-72 bg-[#0f172a] text-white flex-shrink-0 flex flex-col z-20 shadow-2xl transition-all duration-300 relative overflow-hidden hidden md:flex">
        <!-- Decoration -->
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
        
        <!-- Logo supprimé -->

        <nav class="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar pt-6">
          <p class="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu Principal</p>
          
          <button (click)="setView('HOME')" 
            [class]="navClass('HOME')"
            class="w-full text-left px-4 py-3.5 rounded-2xl flex items-center gap-3 transition-all duration-300 group font-medium hover:translate-x-1">
            <svg class="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            Tableau de bord
          </button>

          @if (isTeacher() || isStudent() || isDirector() || isAdminStaff()) {
            <p class="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-6">Pédagogie</p>
            <button (click)="setView('GRADES')" 
              [class]="navClass('GRADES')"
              class="w-full text-left px-4 py-3.5 rounded-2xl flex items-center gap-3 transition-all duration-300 group font-medium hover:translate-x-1">
              <svg class="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
              {{ isStudent() ? 'Mes Notes' : 'Notes & Bulletins' }}
            </button>

            <button (click)="setView('TEXTBOOK')" 
              [class]="navClass('TEXTBOOK')"
              class="w-full text-left px-4 py-3.5 rounded-2xl flex items-center gap-3 transition-all duration-300 group font-medium hover:translate-x-1">
              <svg class="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              Cahier de Texte
            </button>

            @if (isTeacher() || isDirector()) {
              <button (click)="setView('ABSENCES')" 
                [class]="navClass('ABSENCES')"
                class="w-full text-left px-4 py-3.5 rounded-2xl flex items-center gap-3 transition-all duration-300 group font-medium hover:translate-x-1">
                <svg class="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Gestion des Absences
              </button>
            }
          }

          @if (isDirector() || isAccountant() || isAdminStaff()) {
            <p class="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-6">Gestion</p>
             <button (click)="setView('FINANCE')" 
               [class]="navClass('FINANCE')"
               class="w-full text-left px-4 py-3.5 rounded-2xl flex items-center gap-3 transition-all duration-300 group font-medium hover:translate-x-1">
               <svg class="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
               Finances
             </button>
          }

          @if (isDirector() || isAdminStaff()) {
            <p class="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-6">Administration</p>
            <button (click)="setView('ADMIN')" 
              [class]="navClass('ADMIN')"
              class="w-full text-left px-4 py-3.5 rounded-2xl flex items-center gap-3 transition-all duration-300 group font-medium hover:translate-x-1">
              <svg class="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
              Administration
            </button>
          }
        </nav>

        <div class="p-4 mt-auto">
          <!-- User Profile Card -->
          <div (click)="setView('PROFILE')" 
               [class]="currentView() === 'PROFILE' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800'"
               class="rounded-2xl p-4 border mb-3 transition-all duration-300 cursor-pointer group relative overflow-hidden">
             
             <!-- Active Indicator -->
             @if (currentView() === 'PROFILE') {
                <div class="absolute right-3 top-3 w-2 h-2 bg-white rounded-full shadow-lg shadow-white/50 animate-pulse"></div>
             }

             <div class="flex items-center gap-3 mb-2">
                <div [class]="currentView() === 'PROFILE' ? 'bg-white/20 text-white border-white/30' : 'bg-slate-700 text-slate-300 border-slate-600'" class="w-10 h-10 rounded-full flex items-center justify-center font-bold border transition-colors">
                  {{ auth.currentUser()?.name?.charAt(0) }}
                </div>
                <div class="overflow-hidden">
                  <p class="font-bold text-sm text-white truncate">{{ auth.currentUser()?.name }}</p>
                  <p [class]="currentView() === 'PROFILE' ? 'text-indigo-200' : 'text-slate-400'" class="text-xs truncate transition-colors">{{ formatRole(auth.userRole()) }}</p>
                </div>
             </div>
             <p [class]="currentView() === 'PROFILE' ? 'text-indigo-200' : 'text-slate-500 group-hover:text-slate-400'" class="text-[10px] text-right mt-1 transition-colors">Voir mon profil →</p>
          </div>

          <button (click)="auth.logout()" class="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-2xl transition-all duration-200 py-3 text-sm font-medium hover:shadow-lg active:scale-95">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Déconnexion
          </button>
        </div>
      </aside>

      <!-- Main Content (Fond Clair -> Texte Sombre) -->
      <main class="flex-1 overflow-auto bg-[#f8fafc] p-6 md:p-12 h-screen w-full relative">
        <div class="max-w-7xl mx-auto h-full flex flex-col">
          
          @if (currentView() === 'HOME') {
            
            <!-- 1. HEADER IMMERSIF (Style cohérent avec Student View) -->
            <div class="relative overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl shadow-slate-900/20 mb-8 animate-slide-up">
              <!-- Background Gradients -->
              <div class="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-700 opacity-90"></div>
              <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none mix-blend-overlay"></div>
              <div class="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

              <div class="relative z-10 p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                 <div>
                    <h1 class="text-3xl md:text-5xl font-bold text-white tracking-tight mb-2">Bonjour, {{ auth.currentUser()?.name }}</h1>
                    <p class="text-indigo-100 font-medium text-lg opacity-90">Heureux de vous revoir sur votre espace {{ formatRole(auth.userRole()) }}.</p>
                 </div>

                 <!-- Date Widget Styled -->
                 <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4 min-w-[200px] shadow-lg">
                    <div class="bg-white text-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-inner font-bold text-xl">
                       {{ newDateObj.getDate() }}
                    </div>
                    <div>
                       <p class="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-0.5">{{ newDateObj.toLocaleDateString('fr-FR', { month: 'long' }) }}</p>
                       <p class="text-lg font-bold text-white capitalize leading-tight">{{ newDateObj.toLocaleDateString('fr-FR', { weekday: 'long' }) }}</p>
                    </div>
                 </div>
              </div>
            </div>

            <!-- 2. KPI CARDS (Section 4 cartes principales) -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-slide-up delay-100">
              
              @if (isStudent()) {
                 <!-- Moyenne Card -->
                 <div class="bg-white p-8 rounded-[2rem] shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100 group hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-48">
                    <div class="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                       <svg class="w-32 h-32 text-indigo-600 transform rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    </div>
                    <div class="relative z-10">
                       <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                       </div>
                       <!-- CONTRASTE AMÉLIORÉ: text-slate-500 -->
                       <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">Moyenne Générale</p>
                       <div class="flex items-baseline gap-1 mt-1">
                          <p class="text-4xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{{ getMyAverage() }}</p>
                          <span class="text-lg text-slate-500 font-bold">/20</span>
                       </div>
                    </div>
                 </div>

                 <!-- Rang Card -->
                 <div class="bg-white p-8 rounded-[2rem] shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100 group hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-900/5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-48">
                    <div class="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                       <svg class="w-32 h-32 text-amber-500 transform -rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82c-1.2-.48-2-1.63-2-2.82zm14 0c0 1.19-.8 2.34-2 2.82V7h2v1z"/></svg>
                    </div>
                    <div class="relative z-10">
                       <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
                       </div>
                       <!-- CONTRASTE AMÉLIORÉ: text-slate-500 -->
                       <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">Mon Classement</p>
                       <div class="flex items-baseline gap-1 mt-1">
                          <p class="text-4xl font-black text-slate-900 tracking-tight group-hover:text-amber-600 transition-colors">{{ getMyRank() }}</p>
                          <p class="text-sm font-bold text-slate-500">sur {{ getMyClassSize() }}</p>
                       </div>
                    </div>
                 </div>

                 <!-- Devoirs Card -->
                 <div class="bg-white p-8 rounded-[2rem] shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100 group hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-48">
                    <div class="relative z-10">
                       <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                       </div>
                       <!-- CONTRASTE AMÉLIORÉ: text-slate-500 -->
                       <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">Devoirs à faire</p>
                       <p class="text-4xl font-black text-slate-900 mt-1 tracking-tight group-hover:text-emerald-600 transition-colors">{{ getMyHomeworkCount() }}</p>
                    </div>
                     <!-- Progress bar decoration -->
                     <div class="absolute bottom-0 left-0 w-full h-1.5 bg-slate-50">
                        <div class="h-full bg-emerald-500 w-1/3 rounded-r-full"></div>
                     </div>
                 </div>

                 <!-- Class Info Card (Light) -->
                 <div class="bg-white p-8 rounded-[2rem] shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100 group hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-900/5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-48">
                    <div class="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                       <svg class="w-32 h-32 text-violet-500 transform rotate-6" fill="currentColor" viewBox="0 0 24 24"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>
                    </div>
                    <div class="relative z-10">
                       <div class="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                       </div>
                       <!-- CONTRASTE AMÉLIORÉ: text-slate-500 -->
                       <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">Ma Classe</p>
                       <p class="text-4xl font-black text-slate-900 mt-1 tracking-tight group-hover:text-violet-600 transition-colors">{{ auth.currentUser()?.classId }}</p>
                    </div>
                     <!-- Progress bar decoration -->
                     <div class="absolute bottom-0 left-0 w-full h-1.5 bg-slate-50">
                        <div class="h-full bg-violet-500 w-1/3 rounded-r-full"></div>
                     </div>
                 </div>

              } @else {
                 <!-- ADMIN / DIRECTOR / TEACHER CARDS (Standard View but polished) -->
                 <div class="bg-white p-8 rounded-[2rem] shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100 group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                    <div class="flex items-center gap-4">
                      <div class="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                        <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                      </div>
                      <div>
                        <!-- CONTRASTE AMÉLIORÉ -->
                        <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">Élèves Actifs</p>
                        <p class="text-3xl font-black text-slate-900">{{ formatNumber(school.students().length) }}</p>
                      </div>
                    </div>
                 </div>

                 <div class="bg-white p-8 rounded-[2rem] shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100 group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center gap-4">
                    <div class="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                      <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <div>
                      <!-- CONTRASTE AMÉLIORÉ -->
                      <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">Taux Réussite</p>
                      <p class="text-3xl font-black text-slate-900">98%</p>
                    </div>
                  </div>
                </div>

                 <div class="bg-white p-8 rounded-[2rem] shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100 group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center gap-4">
                    <div class="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                      <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <div>
                      <!-- CONTRASTE AMÉLIORÉ -->
                      <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">Impayés</p>
                      <p class="text-3xl font-black text-slate-900">{{ formatNumber(getUnpaidAmount()) }} €</p>
                    </div>
                  </div>
                </div>

                 <div class="bg-white p-8 rounded-[2rem] shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100 group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <div class="flex items-center gap-4">
                    <div class="w-14 h-14 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                      <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                    </div>
                    <div>
                      <!-- CONTRASTE AMÉLIORÉ -->
                      <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">Cours</p>
                      <p class="text-3xl font-black text-slate-900">{{ formatNumber(school.textbook().length) }}</p>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Chart Section (D3.js) - Only for Directors/Admins/Accountants -->
            @if (isDirector() || isAccountant() || isAdminStaff()) {
              <div class="bg-white rounded-[2rem] shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100 p-8 mb-10 animate-slide-up delay-150">
                 <div class="flex justify-between items-center mb-6">
                    <div>
                      <h3 class="text-xl font-bold text-slate-900">Évolution de la Trésorerie</h3>
                      <p class="text-sm text-slate-500 font-medium">Solde mensuel (Recettes - Dépenses) sur les 12 derniers mois</p>
                    </div>
                 </div>
                 <div class="w-full h-[300px]" #chartContainer></div>
              </div>
            }

            <!-- 3. ANNOUNCEMENTS SECTION (Announcements & News) -->
            <div class="animate-slide-up delay-200">
               <div class="flex items-center justify-between mb-6 px-2">
                  <div>
                    <h3 class="text-2xl font-bold text-slate-900 tracking-tight">Fil d'actualité</h3>
                    <p class="text-slate-500 font-medium text-sm mt-1">Aujourd'hui, le {{ newDateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}</p>
                  </div>
                  <button class="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-indigo-600">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                  </button>
               </div>

               <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  <!-- Feature Card (Dark) -->
                  <div class="group relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 shadow-2xl shadow-slate-900/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-slate-900/20">
                    <!-- Decor -->
                    <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-overlay blur-3xl opacity-20 -mr-16 -mt-16 group-hover:opacity-30 transition-opacity"></div>
                    <div class="absolute bottom-0 left-0 w-48 h-48 bg-blue-500 rounded-full mix-blend-overlay blur-3xl opacity-20 -ml-16 -mb-16"></div>
                    
                    <div class="relative z-10 flex flex-col h-full justify-between">
                       <div class="flex justify-between items-start mb-6">
                          <div class="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold text-white uppercase tracking-wider">
                            Mise à jour
                          </div>
                          <span class="text-slate-300 text-xs font-bold font-mono">{{ newDateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) }}</span>
                       </div>
                       
                       <div>
                          <h4 class="text-2xl font-bold text-white mb-3 leading-tight">Bienvenue sur ECAM v2.0</h4>
                          <p class="text-slate-300 font-medium leading-relaxed mb-6">
                            Découvrez une interface entièrement repensée pour faciliter votre gestion quotidienne. Facturation, notes, et suivi des élèves n'ont jamais été aussi simples.
                          </p>
                       </div>

                       <div class="flex items-center gap-3 pt-6 border-t border-white/10">
                          <div class="flex -space-x-2">
                             <div class="w-8 h-8 rounded-full bg-indigo-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white font-bold">IT</div>
                             <div class="w-8 h-8 rounded-full bg-blue-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white font-bold">AD</div>
                          </div>
                          <span class="text-xs font-bold text-slate-400">Publié par l'Administration</span>
                       </div>
                    </div>
                  </div>

                  <!-- Alert Card (Light with accent) -->
                  <div class="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-amber-200">
                     <!-- Accent Line -->
                     <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-orange-500"></div>
                     
                     <div class="pl-4 relative z-10 h-full flex flex-col">
                        <div class="flex items-center gap-4 mb-6">
                           <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                             <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                           </div>
                           <div>
                              <h4 class="text-xl font-bold text-slate-900 group-hover:text-amber-700 transition-colors">Période d'Examens</h4>
                              <p class="text-xs font-bold text-amber-600 uppercase tracking-wide">Action requise</p>
                           </div>
                        </div>

                        <p class="text-slate-600 font-medium leading-relaxed mb-6 flex-1">
                           Les coefficients des matières ont été mis à jour pour le trimestre en cours. Veuillez vérifier la saisie de vos notes avant la validation définitive par le Directeur prévue le 15 du mois.
                        </p>
                        
                        <div class="flex items-center justify-between pt-6 border-t border-slate-50">
                           <span class="text-xs font-bold text-slate-400">{{ newDateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) }}</span>
                           <button class="text-sm font-bold text-slate-900 flex items-center gap-2 group/btn">
                              Voir le planning
                              <svg class="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                           </button>
                        </div>
                     </div>
                  </div>

               </div>
            </div>
          }

          @if (currentView() === 'ADMIN' && (isDirector() || isAdminStaff())) {
            <app-admin-view class="animate-slide-up"></app-admin-view>
          }

          @if (currentView() === 'FINANCE' && (isDirector() || isAccountant() || isAdminStaff())) {
            <app-finance-view></app-finance-view>
          }

          @if ((currentView() === 'GRADES' || currentView() === 'TEXTBOOK' || currentView() === 'ABSENCES') && isTeacher()) {
             <app-teacher-view [mode]="currentView()" class="animate-slide-up"></app-teacher-view>
          }

          @if ((currentView() === 'GRADES' || currentView() === 'TEXTBOOK') && isStudent()) {
             <app-student-view [mode]="currentView()" class="animate-slide-up"></app-student-view>
          }
          
          @if (currentView() === 'PROFILE') {
            <app-profile-view class="animate-slide-up"></app-profile-view>
          }

          @if ((currentView() === 'GRADES' || currentView() === 'TEXTBOOK' || currentView() === 'ABSENCES') && (isDirector() || isAdminStaff())) {
             <div class="animate-slide-up bg-white p-12 rounded-3xl shadow-lg text-center border border-slate-100 max-w-2xl mx-auto mt-10">
                <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                  <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                </div>
                <h2 class="text-2xl font-bold mb-3 text-slate-900">Vue Administrative</h2>
                <p class="text-slate-500 mb-8 leading-relaxed">Pour gérer les notes ou le cahier de texte, veuillez utiliser le compte d'un enseignant ou passer par l'administration globale.</p>
                <button (click)="setView('ADMIN')" class="px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium shadow-lg shadow-slate-900/20 hover:scale-105 active:scale-95 duration-200">Aller à l'Administration</button>
             </div>
          }
        </div>
      </main>
    </div>
  `
})
export class DashboardComponent implements AfterViewInit {
  auth = inject(AuthService);
  school = inject(SchoolService);

  @ViewChild('chartContainer') chartContainer!: ElementRef;

  currentView = signal<ViewType>('HOME');
  
  // Date Object for dynamic display in template
  newDateObj = new Date();
  // Legacy string for backward compat if needed, but using newDateObj in template now
  todayDate = this.newDateObj.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  isDirector = computed(() => this.auth.userRole() === 'DIRECTEUR');
  isAdminStaff = computed(() => this.auth.userRole() === 'ADMINISTRATIF');
  isTeacher = computed(() => this.auth.userRole()?.startsWith('PROF'));
  isStudent = computed(() => this.auth.userRole() === 'ELEVE');
  isAccountant = computed(() => this.auth.userRole() === 'COMPTABLE');

  constructor() {
    effect(() => {
      // Re-render chart when data changes or view changes to HOME
      const finances = this.school.finances(); 
      const view = this.currentView();
      if (view === 'HOME' && (this.isDirector() || this.isAccountant() || this.isAdminStaff())) {
        // Small timeout to allow DOM to render
        setTimeout(() => this.renderChart(), 100);
      }
    });
  }

  ngAfterViewInit() {
    if (this.currentView() === 'HOME' && (this.isDirector() || this.isAccountant() || this.isAdminStaff())) {
      this.renderChart();
    }
  }

  setView(view: ViewType) {
    this.currentView.set(view);
  }

  navClass(view: ViewType) {
    const isActive = this.currentView() === view;
    const base = "w-full text-left px-4 py-3.5 rounded-2xl flex items-center gap-3 transition-all duration-300 group font-medium hover:translate-x-1 ";
    return isActive 
      ? base + "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
      : base + "text-slate-400 hover:text-white hover:bg-white/5";
  }

  formatRole(role?: string) {
    if (!role) return '';
    switch(role) {
      case 'DIRECTEUR': return 'Directeur';
      case 'ADMINISTRATIF': return 'Administration';
      case 'PROF_LYCEE': return 'Professeur (Lycée)';
      case 'PROF_PRIMAIRE': return 'Professeur (Primaire)';
      case 'ELEVE': return 'Élève';
      case 'COMPTABLE': return 'Comptable';
      default: return role;
    }
  }

  formatNumber(num: number) {
    return num.toLocaleString('fr-FR');
  }

  getUnpaidAmount() {
    return this.school.finances()
      .filter(t => t.type === 'INCOME' && t.status !== 'PAID')
      .reduce((acc, t) => acc + (t.amount - (t.partialAmount || 0)), 0);
  }
  
  // --- Student Dashboard Helpers ---
  
  getMyAverage(): number {
    const uid = this.auth.currentUser()?.id;
    if (!uid) return 0;
    return this.school.getStudentAverage(uid);
  }

  getMyRank(): string {
    const uid = this.auth.currentUser()?.id;
    if (!uid) return '-';

    // 1. Find Current Student to get Class ID
    // In our mock, auth user ID matches student ID roughly, but let's be safe
    // The auth service has 'classId' on the User object for students.
    const classId = this.auth.currentUser()?.classId;
    if (!classId) return '-';

    // 2. Get all students in this class
    const classStudents = this.school.students().filter(s => s.classId === classId);

    // 3. Calculate Average for everyone
    const averages = classStudents.map(s => ({
      id: s.id,
      avg: this.school.getStudentAverage(s.id)
    }));

    // 4. Sort Descending
    averages.sort((a, b) => b.avg - a.avg);

    // 5. Find Index
    const index = averages.findIndex(a => a.id === uid);
    if (index === -1) return '-';

    const rank = index + 1;
    return rank === 1 ? '1er' : `${rank}ème`;
  }

  getMyClassSize(): number {
     const classId = this.auth.currentUser()?.classId;
     if (!classId) return 0;
     return this.school.students().filter(s => s.classId === classId).length;
  }

  getMyHomeworkCount(): number {
    const classId = this.auth.currentUser()?.classId;
    if (!classId) return 0;
    // Count textbook entries for this class that have homework text
    return this.school.textbook().filter(t => t.classId === classId && t.homework && t.homework.length > 0).length;
  }

  // --- Chart Logic ---

  renderChart() {
    if (!this.chartContainer) return;
    
    const element = this.chartContainer.nativeElement;
    d3.select(element).selectAll('*').remove(); // Clear previous

    const data = this.prepareChartData();
    if (data.length === 0) return;

    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const width = element.offsetWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale
    const x = d3.scaleBand()
      .range([0, width])
      .padding(0.3)
      .domain(data.map(d => d.month));

    // Y Scale
    const yMax = d3.max(data, d => Math.abs(d.value)) || 1000;
    const y = d3.scaleLinear()
      .range([height, 0])
      .domain([-yMax, yMax]); // Center zero

    // Add X Axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`) // Move to bottom
      // But we actually want the labels at the bottom, but the axis line at y=0?
      // For simplicity, let's put axis at bottom, but draw a zero line.
      .call(d3.axisBottom(x).tickSize(0).tickPadding(10))
      .attr('class', 'text-xs text-slate-400 font-bold')
      .select('.domain').remove();

    // Add Y Axis
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => d + ' €'))
      .attr('class', 'text-xs text-slate-400')
      .select('.domain').remove(); // remove axis line

    // Add Grid lines
    svg.selectAll('line.grid')
      .data(y.ticks(5))
      .enter()
      .append('line')
      .attr('class', 'grid')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d))
      .attr('stroke', '#e2e8f0')
      .attr('stroke-dasharray', '4');

    // Zero Line
    svg.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', y(0))
      .attr('y2', y(0))
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1);

    // Bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.month)!)
      .attr('width', x.bandwidth())
      .attr('y', d => d.value >= 0 ? y(d.value) : y(0))
      .attr('height', d => Math.abs(y(d.value) - y(0)))
      .attr('fill', d => d.value >= 0 ? '#10b981' : '#f43f5e') // Emerald for + , Rose for -
      .attr('rx', 4) // Rounded corners
      .attr('ry', 4);
  }

  prepareChartData() {
    const transactions = this.school.finances();
    const data: { month: string, value: number, sortDate: Date }[] = [];
    const today = new Date();
    
    // Logic for last 12 months based on TODAY
    for (let i = 11; i >= 0; i--) {
       const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
       const monthLabel = d.toLocaleString('fr-FR', { month: 'short' });
       // Start of month
       const start = new Date(d.getFullYear(), d.getMonth(), 1);
       // End of month
       const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);

       // Filter transactions in this range
       const monthlyTrans = transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate >= start && tDate <= end;
       });

       // Calc Net
       let net = 0;
       monthlyTrans.forEach(t => {
          // Simplification: Cash flow based on status.
          // If PAID: full amount. If PARTIAL: partialAmount.
          let cashMoved = 0;
          if (t.status === 'PAID') cashMoved = t.amount;
          else if (t.status === 'PARTIAL') cashMoved = t.partialAmount || 0;
          
          if (t.type === 'INCOME') net += cashMoved;
          else net -= cashMoved;
       });

       data.push({ month: monthLabel, value: net, sortDate: d });
    }

    return data;
  }
}