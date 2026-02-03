import { Component, inject, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { SchoolService } from '../../services/school.service';

@Component({
  selector: 'app-student-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-slide-up pb-10">
       
       <!-- Header Section -->
       <div class="relative overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl shadow-slate-900/20">
          <!-- Background Gradients -->
          <div class="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-700 opacity-90"></div>
          <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none mix-blend-overlay"></div>
          <div class="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
          
          <div class="relative z-10 p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
             <div class="flex items-center gap-6">
                <div class="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                   @if(mode() === 'GRADES') {
                      <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                   } @else {
                      <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                   }
                </div>
                <div>
                   <h2 class="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">{{ mode() === 'GRADES' ? 'Résultats Scolaires' : 'Cahier de Texte' }}</h2>
                   <div class="flex flex-wrap items-center gap-3 text-indigo-100 font-medium text-sm">
                      <span class="px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm">Classe {{ myClassId() }}</span>
                      <span class="hidden md:inline">•</span>
                      <span>Année {{ school.currentAcademicYear() }}</span>
                   </div>
                </div>
             </div>

             @if (mode() === 'GRADES') {
               <div class="flex flex-col items-end gap-1">
                  <div class="text-right">
                    <p class="text-xs text-indigo-200 uppercase font-bold tracking-widest mb-1">Moyenne Générale</p>
                    <div class="flex items-baseline gap-1">
                        <span class="text-6xl font-black text-white tracking-tighter shadow-sm">{{ globalAverage() }}</span>
                        <span class="text-2xl text-indigo-200 font-medium">/20</span>
                    </div>
                  </div>
                  <div class="flex gap-3 mt-2">
                     <button (click)="printBulletin()" class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                        Imprimer
                     </button>
                     <button (click)="exportBulletinCSV()" class="px-4 py-2 rounded-xl bg-white text-indigo-900 text-xs font-bold transition-all hover:bg-indigo-50 flex items-center gap-2 shadow-lg shadow-black/5">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                        CSV
                     </button>
                  </div>
               </div>
             }
          </div>
       </div>

       <!-- Content Section -->
       @if (mode() === 'GRADES') {
         <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-slide-up delay-100 print:grid-cols-2 print:gap-4">
           @for (sub of subjects(); track sub) {
             <div class="group bg-white rounded-[2rem] shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] hover:border-indigo-100 transition-all duration-300 relative flex flex-col h-full">
               
               <!-- Card Header with Average -->
               <div class="p-6 pb-2 relative z-10 flex justify-between items-start">
                 <div class="flex-1 pr-2">
                    <div class="flex items-center gap-2 mb-1">
                        <h3 class="font-bold text-slate-800 text-lg group-hover:text-indigo-700 transition-colors leading-tight">{{ sub }}</h3>
                        @if(getSubjectConfig(sub); as conf) {
                           <span class="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase border border-indigo-100 whitespace-nowrap">
                              Coef. {{ conf.coef }}
                           </span>
                        }
                    </div>
                    <!-- CONTRASTE AMÉLIORÉ -->
                    <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">{{ getGradesForSubject(sub).length }} notes enregistrées</p>
                 </div>
                 
                 <div class="flex flex-col items-end">
                    <div class="bg-slate-50 border border-slate-100 text-slate-900 font-black px-4 py-2 rounded-2xl shadow-sm text-2xl group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 group-hover:shadow-indigo-600/30 transition-all duration-300 min-w-[80px] text-center">
                        {{ getSubjectAverage(sub) }}
                    </div>
                    <!-- CONTRASTE AMÉLIORÉ -->
                    <span class="text-[10px] text-slate-500 font-bold mt-1 pr-1 group-hover:text-indigo-300 transition-colors">MOYENNE</span>
                 </div>
               </div>

               <!-- Divider -->
               <div class="h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent mx-6 my-4"></div>

               <!-- Grades List -->
               <div class="p-6 pt-0 flex-1 space-y-3">
                 @for (g of getGradesForSubject(sub); track g.id) {
                   <div class="flex justify-between items-center p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors group/item">
                     <div class="flex flex-col">
                        <!-- CONTRASTE AMÉLIORÉ -->
                        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">{{ g.date }}</span>
                        <div class="flex items-center gap-2">
                           <span class="text-xs font-bold text-slate-700">{{ g.type }}</span>
                        </div>
                     </div>
                     <div class="flex items-center gap-3">
                        <span class="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-lg">Coef. {{g.coef}}</span>
                        <span class="font-bold text-slate-800 text-lg">{{ g.value }}<span class="text-xs text-slate-400 font-normal">/20</span></span>
                     </div>
                   </div>
                 }
               </div>
               
               <!-- Bottom Decoration -->
               <div class="h-1.5 w-full bg-slate-50 group-hover:bg-indigo-500 transition-colors duration-500 mt-auto"></div>
             </div>
           }
         </div>
       }

       @if (mode() === 'TEXTBOOK') {
         <div class="max-w-4xl mx-auto space-y-10 animate-slide-up delay-100 pb-12 px-4 md:px-0">
            @for (entry of myTextbook(); track entry.id) {
              <div class="relative pl-8 md:pl-0">
                 <!-- Timeline Connector (Desktop) -->
                 <div class="hidden md:block absolute left-[148px] top-8 bottom-[-56px] w-0.5 bg-slate-100 z-0 last:hidden"></div>
                 
                 <div class="flex flex-col md:flex-row gap-6 md:gap-10 relative z-10">
                    <!-- Date Column -->
                    <div class="md:w-32 flex-shrink-0 pt-1 flex md:flex-col items-center md:items-end gap-1">
                       <div class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest text-right hidden md:block">{{ formatDateDay(entry.date) }}</div>
                       <div class="text-3xl font-black text-slate-800 text-right hidden md:block">{{ formatDateNum(entry.date) }}</div>
                       <div class="text-sm font-bold text-slate-400 uppercase tracking-wide text-right hidden md:block">{{ formatDateMonth(entry.date) }}</div>
                       
                       <!-- Mobile Date Badge -->
                       <div class="md:hidden flex items-baseline gap-2 mb-2">
                          <span class="text-2xl font-black text-slate-900">{{ formatDateNum(entry.date) }}</span>
                          <span class="text-sm font-bold text-slate-500 uppercase">{{ formatDateMonth(entry.date) }}</span>
                       </div>

                       <!-- Dot -->
                       <div class="hidden md:block w-4 h-4 rounded-full border-[3px] border-white shadow-md absolute left-[142px] top-8 transition-transform hover:scale-125"
                            [class]="entry.homework ? 'bg-amber-500' : 'bg-indigo-500'"></div>
                    </div>

                    <!-- Content Card -->
                    <div class="flex-1 bg-white p-6 md:p-8 rounded-[2.5rem] rounded-tl-none shadow-[0_2px_20px_rgb(0,0,0,0.03)] border border-slate-100 group hover:border-indigo-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-all duration-300">
                       
                       <div class="flex justify-between items-start mb-6">
                          <div>
                             <h4 class="font-bold text-xl text-slate-900 group-hover:text-indigo-700 transition-colors">{{ entry.subject }}</h4>
                             <p class="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                {{ entry.teacherName }}
                             </p>
                          </div>
                          @if (entry.homework) {
                             <div class="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border border-amber-100 flex items-center gap-1.5 shadow-sm">
                                <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                Devoir
                             </div>
                          }
                       </div>

                       <div class="prose prose-sm text-slate-600 font-medium leading-relaxed mb-8">
                          {{ entry.content }}
                       </div>

                       @if (entry.homework) {
                          <div class="relative overflow-hidden rounded-2xl bg-amber-50/80 p-5 border border-amber-100 transition-all hover:bg-amber-50">
                             <!-- Icon bg decoration -->
                             <div class="absolute -right-4 -bottom-4 text-amber-100 opacity-50 transform rotate-12">
                                <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                             </div>
                             
                             <div class="relative z-10 flex gap-4">
                                <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                                   <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                                </div>
                                <div>
                                   <p class="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1.5">Pour le prochain cours</p>
                                   <p class="text-sm font-bold text-slate-800 leading-snug">{{ entry.homework }}</p>
                                </div>
                             </div>
                          </div>
                       }
                    </div>
                 </div>
              </div>
            }
         </div>
       }
    </div>
  `
})
export class StudentViewComponent {
  mode = input.required<'GRADES' | 'TEXTBOOK'>();
  auth = inject(AuthService);
  school = inject(SchoolService);

  user = computed(() => this.auth.currentUser());
  myClassId = computed(() => this.user()?.classId);

  // Grades Logic
  myGrades = computed(() => {
    const uid = this.user()?.id;
    if (!uid) return [];
    // Sort by date desc
    return this.school.grades().filter(g => g.studentId === uid).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  subjects = computed(() => {
    const subjects = new Set(this.myGrades().map(g => g.subject));
    return Array.from(subjects);
  });

  getGradesForSubject(subject: string) {
    return this.myGrades().filter(g => g.subject === subject);
  }

  // Retrieve subject config to find the Global Coefficient for the subject
  getSubjectConfig(subjectName: string) {
    return this.school.subjects().find(s => s.name === subjectName);
  }

  getSubjectAverage(subject: string) {
    const grades = this.getGradesForSubject(subject);
    if (grades.length === 0) return '-';
    const total = grades.reduce((acc, g) => acc + (g.value * g.coef), 0);
    const coefs = grades.reduce((acc, g) => acc + g.coef, 0);
    return coefs === 0 ? '-' : (total / coefs).toFixed(2);
  }

  globalAverage = computed(() => {
     const uid = this.user()?.id;
     if (!uid) return '0.00';
     const avg = this.school.getStudentAverage(uid);
     return avg.toFixed(2);
  });

  // Textbook Logic
  myTextbook = computed(() => {
    const cid = this.myClassId();
    if (!cid) return [];
    return this.school.textbook().filter(t => t.classId === cid).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  // Date Format Helpers
  formatDateDay(dateStr: string) {
     const d = new Date(dateStr);
     return d.toLocaleDateString('fr-FR', { weekday: 'long' });
  }
  formatDateNum(dateStr: string) {
     const d = new Date(dateStr);
     return d.getDate();
  }
  formatDateMonth(dateStr: string) {
     const d = new Date(dateStr);
     return d.toLocaleDateString('fr-FR', { month: 'short' });
  }

  printBulletin() {
     window.print();
  }

  exportBulletinCSV() {
    const data = this.myGrades().map(g => ({
       Date: g.date,
       Matiere: g.subject,
       Type: g.type,
       Note: g.value,
       Coef: g.coef
    }));

    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bulletin_${this.user()?.name}_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}