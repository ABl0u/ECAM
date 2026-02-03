import { Component, inject, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchoolService, Grade, TextbookEntry, GradeType, Absence, AbsenceDuration } from '../../services/school.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-teacher-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">
      
      <!-- DIRECTOR SPECIFIC VIEW FOR ABSENCES -->
      @if (isDirector() && mode() === 'ABSENCES') {
         <div class="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 animate-slide-up">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
               <div>
                  <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Registre Général des Absences</h2>
                  <p class="text-slate-500 font-medium mt-1">Vue d'ensemble de tous les élèves</p>
               </div>
               
               <div class="flex flex-wrap items-center gap-3">
                  <!-- Class Filter Dropdown -->
                  <div class="relative">
                     <select [ngModel]="absenceClassFilter()" (ngModelChange)="absenceClassFilter.set($event)" 
                             class="appearance-none bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 hover:border-indigo-200 cursor-pointer shadow-sm transition-colors">
                        <option value="">Toutes les classes</option>
                        @for (c of school.classes(); track c.id) {
                           <option [value]="c.id">{{ c.name }}</option>
                        }
                     </select>
                     <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                     </div>
                  </div>

                  <div class="bg-indigo-50 text-indigo-800 px-4 py-2.5 rounded-xl border border-indigo-200 font-bold text-sm shadow-sm">
                     Total: {{ allAbsencesSorted().length }} incidents
                  </div>
               </div>
            </div>

            <div class="overflow-hidden rounded-2xl border border-slate-200">
               <table class="w-full text-left text-sm">
                  <thead class="bg-slate-50 text-xs uppercase text-slate-500 font-bold tracking-wider">
                     <tr>
                        <th class="p-4">Date</th>
                        <th class="p-4">Élève</th>
                        <th class="p-4">Classe</th>
                        <th class="p-4">Durée</th>
                        <th class="p-4">Motif</th>
                        <th class="p-4">Signalé par</th>
                     </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 bg-white">
                     @for (abs of allAbsencesSorted(); track abs.id) {
                        <tr class="hover:bg-slate-50 transition-colors">
                           <td class="p-4 font-bold text-slate-700 whitespace-nowrap">{{ abs.date }}</td>
                           <td class="p-4 font-bold text-slate-900">
                              {{ getStudent(abs.studentId)?.name || 'Inconnu' }}
                           </td>
                           <td class="p-4">
                              <span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold border border-slate-200">
                                 {{ getStudent(abs.studentId)?.classId || '-' }}
                              </span>
                           </td>
                           <td class="p-4">
                              @switch (abs.duration) {
                                 @case ('FULL_DAY') { <span class="bg-rose-50 text-rose-700 px-2 py-1 rounded text-xs font-bold border border-rose-100">Journée</span> }
                                 @case ('MORNING') { <span class="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs font-bold border border-orange-100">Matin</span> }
                                 @case ('AFTERNOON') { <span class="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs font-bold border border-orange-100">Après-midi</span> }
                                 @case ('HOURS') { <span class="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold border border-indigo-100">{{ abs.hours }}h</span> }
                              }
                           </td>
                           <td class="p-4 text-slate-600 font-medium italic">"{{ abs.reason }}"</td>
                           <td class="p-4 text-slate-400 text-xs">{{ abs.declaredBy }}</td>
                        </tr>
                     }
                     @if (allAbsencesSorted().length === 0) {
                        <tr>
                           <td colspan="6" class="p-12 text-center text-slate-400 font-medium">Aucune absence trouvée pour cette sélection.</td>
                        </tr>
                     }
                  </tbody>
               </table>
            </div>
         </div>
      } 
      
      <!-- TEACHER / STANDARD VIEW (Logic for adding grades/absences per class) -->
      @else {
         <div class="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">
             @if(mode() === 'GRADES') { Gestion des Notes }
             @if(mode() === 'TEXTBOOK') { Cahier de Texte }
             @if(mode() === 'ABSENCES') { Gestion des Absences }
          </h2>
          <p class="text-sm text-slate-600 font-semibold mt-1">
            <span class="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-lg border border-indigo-200">
              {{ isPrimary() ? 'Classe : ' + myClassId() : 'Matière : ' + mySubject() }}
            </span>
          </p>
        </div>
        
         <!-- Selection Context for Lycee -->
        @if (!isPrimary()) {
           <div class="flex items-center gap-3 mt-4 md:mt-0">
            <span class="text-slate-700 text-sm font-bold uppercase tracking-wide">Classe</span>
            <select [ngModel]="selectedClassId()" (ngModelChange)="selectedClassId.set($event)" class="border border-slate-300 rounded-xl p-2.5 bg-slate-50 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer transition-shadow">
              <option value="">-- Choisir --</option>
              @for (cls of school.classes(); track cls.id) {
                 @if (cls.level === 'Lycée') {
                   <option [value]="cls.id">{{ cls.name }}</option>
                 }
              }
            </select>
          </div>
        }
      </div>

      @if (activeClassId()) {
        
        @if (mode() === 'GRADES' || mode() === 'ABSENCES') {
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-slide-up">
            <!-- Student List (Shared for Grades and Absences) -->
            <div class="lg:col-span-4 bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-200 overflow-hidden flex flex-col h-[500px]">
               <div class="p-5 bg-slate-100 border-b border-slate-200 font-bold text-slate-700 uppercase text-xs tracking-wider">
                 Élèves de {{ activeClassId() }}
               </div>
               <div class="overflow-y-auto flex-1 p-2 space-y-1">
                 @for (student of classStudents(); track student.id) {
                    <button (click)="selectedStudentId.set(student.id)" 
                      [class]="selectedStudentId() === student.id ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' : 'hover:bg-slate-50 border-transparent'"
                      class="w-full text-left p-3 rounded-xl border transition-all duration-200 flex justify-between items-center group">
                      <div>
                        <p class="font-bold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors">{{ student.name }}</p>
                        <p class="text-xs text-slate-500 font-medium">{{ student.matricule }}</p>
                      </div>
                      @if(mode() === 'GRADES') {
                        <div class="w-9 h-9 rounded-full bg-white flex items-center justify-center text-sm font-bold text-indigo-700 shadow-sm border border-slate-200">
                           {{ getStudentAverage(student.id) }}
                        </div>
                      }
                    </button>
                 }
               </div>
            </div>

            <!-- Main Content Area -->
            <div class="lg:col-span-8 space-y-6">
               @if (selectedStudentId()) {
                 
                 <!-- GRADES VIEW -->
                 @if (mode() === 'GRADES') {
                   <div class="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-200 animate-fade-in">
                      <h3 class="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
                        <svg class="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        Ajouter une note
                      </h3>
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                         <div>
                           <label class="block text-xs font-bold text-slate-600 uppercase mb-2">Note /20</label>
                           <input type="number" [ngModel]="newGradeValue()" (ngModelChange)="newGradeValue.set($event)" min="0" max="20" class="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 font-bold bg-slate-50 focus:bg-white">
                         </div>
                         
                         @if (isPrimary()) {
                            <div>
                               <label class="block text-xs font-bold text-slate-600 uppercase mb-2">Matière</label>
                               <select [ngModel]="newGradeSubject()" (ngModelChange)="newGradeSubject.set($event)" class="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 focus:bg-white text-slate-900 font-bold">
                                 @for (sub of school.subjects(); track sub.id) {
                                   <option [value]="sub.name">{{ sub.name }}</option>
                                 }
                               </select>
                            </div>
                         } @else {
                            <div>
                               <label class="block text-xs font-bold text-slate-600 uppercase mb-2">Coef</label>
                               <input type="number" [ngModel]="newGradeCoef()" (ngModelChange)="newGradeCoef.set($event)" min="1" class="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 font-bold bg-slate-50 focus:bg-white">
                            </div>
                         }

                         <div class="col-span-2 md:col-span-1">
                            <label class="block text-xs font-bold text-slate-600 uppercase mb-2">Type</label>
                            <select [ngModel]="newGradeType()" (ngModelChange)="newGradeType.set($event)" class="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 focus:bg-white text-slate-900 font-bold">
                               <option value="CONTROLE">{{ isPrimary() ? 'Évaluation' : 'Contrôle' }}</option>
                               <option value="DEVOIR">Devoir</option>
                               <option value="EXAMEN">Examen</option>
                            </select>
                         </div>
                         <div class="col-span-2 md:col-span-1">
                            <button (click)="addGrade()" [disabled]="!canAddGrade()" class="w-full bg-indigo-700 text-white font-bold py-3 rounded-xl hover:bg-indigo-800 transition-colors shadow-lg shadow-indigo-700/20 disabled:opacity-50 disabled:cursor-not-allowed">Ajouter</button>
                         </div>
                      </div>
                   </div>

                   <div class="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-200 overflow-hidden">
                      <div class="p-6 border-b border-slate-100 flex justify-between items-center">
                         <h3 class="font-bold text-slate-900">Historique des notes ({{ isPrimary() ? 'Classe entière' : mySubject() }})</h3>
                         <button (click)="exportGradesCSV()" class="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors border border-indigo-200">
                            Export CSV
                         </button>
                      </div>
                      <table class="w-full text-left text-sm">
                        <thead class="bg-slate-100 text-xs uppercase text-slate-600 font-bold tracking-wider">
                          <tr>
                            <th class="p-4">Date</th>
                            @if (isPrimary()) {
                               <th class="p-4">Matière</th>
                               <th class="p-4">Type</th>
                            } @else {
                               <th class="p-4">Type</th>
                            }
                            <th class="p-4">Note</th>
                            @if (!isPrimary()) {
                               <th class="p-4">Coef</th>
                            }
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                          @for (g of currentStudentGrades(); track g.id) {
                             <tr class="hover:bg-slate-50">
                               <td class="p-4 text-slate-700 font-medium">{{ g.date }}</td>
                               
                               @if (isPrimary()) {
                                  <td class="p-4 font-bold text-slate-800">{{ g.subject }}</td>
                                  <td class="p-4 font-medium text-slate-600 uppercase text-xs">
                                     <span class="bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100">{{ g.type === 'CONTROLE' ? 'ÉVALUATION' : g.type }}</span>
                                  </td>
                               } @else {
                                  <td class="p-4 font-bold text-slate-800">
                                     {{ g.type }}
                                     <div class="text-[10px] text-slate-400 font-normal uppercase">{{ g.subject }}</div>
                                  </td>
                               }

                               <td class="p-4 font-extrabold text-slate-900">{{ g.value }}/20</td>
                               
                               @if (!isPrimary()) {
                                  <td class="p-4 text-slate-600 font-medium">{{ g.coef }}</td>
                               }
                             </tr>
                          }
                          @if (currentStudentGrades().length === 0) {
                             <tr><td [attr.colspan]="isPrimary() ? 4 : 4" class="p-8 text-center text-slate-500">Aucune note pour le moment</td></tr>
                          }
                        </tbody>
                      </table>
                   </div>
                 }

                 <!-- ABSENCES VIEW -->
                 @if (mode() === 'ABSENCES') {
                   <div class="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-200 animate-fade-in">
                      <h3 class="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
                        <svg class="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Signaler une absence
                      </h3>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label class="block text-xs font-bold text-slate-600 uppercase mb-2">Date</label>
                            <input type="date" [ngModel]="newAbsenceDate()" (ngModelChange)="newAbsenceDate.set($event)" class="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 font-bold bg-slate-50 focus:bg-white">
                         </div>
                         <div>
                            <label class="block text-xs font-bold text-slate-600 uppercase mb-2">Durée</label>
                            <select [ngModel]="newAbsenceDuration()" (ngModelChange)="newAbsenceDuration.set($event)" class="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 focus:bg-white text-slate-900 font-bold">
                               <option value="FULL_DAY">Journée complète</option>
                               <option value="MORNING">Matinée</option>
                               <option value="AFTERNOON">Après-midi</option>
                               <option value="HOURS">Heures spécifiques</option>
                            </select>
                         </div>
                         
                         @if (newAbsenceDuration() === 'HOURS') {
                           <div class="animate-fade-in">
                              <label class="block text-xs font-bold text-slate-600 uppercase mb-2">Nombre d'heures</label>
                              <input type="number" [ngModel]="newAbsenceHours()" (ngModelChange)="newAbsenceHours.set($event)" min="1" max="8" class="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 font-bold bg-slate-50 focus:bg-white">
                           </div>
                         }

                         <div class="md:col-span-2">
                            <label class="block text-xs font-bold text-slate-600 uppercase mb-2">Motif</label>
                            <input type="text" [ngModel]="newAbsenceReason()" (ngModelChange)="newAbsenceReason.set($event)" placeholder="Maladie, Rendez-vous..." class="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 font-medium bg-slate-50 focus:bg-white">
                         </div>
                         
                         <div class="md:col-span-2">
                            <button (click)="addAbsence()" [disabled]="!canAddAbsence()" class="w-full bg-indigo-700 text-white font-bold py-3 rounded-xl hover:bg-indigo-800 transition-colors shadow-lg shadow-indigo-700/20 disabled:opacity-50 disabled:cursor-not-allowed">
                               Enregistrer l'absence
                            </button>
                         </div>
                      </div>
                   </div>

                   <div class="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-200 overflow-hidden">
                      <div class="p-6 border-b border-slate-100">
                         <h3 class="font-bold text-slate-900">Historique des absences</h3>
                      </div>
                      <table class="w-full text-left text-sm">
                        <thead class="bg-slate-100 text-xs uppercase text-slate-600 font-bold tracking-wider">
                          <tr>
                            <th class="p-4">Date</th>
                            <th class="p-4">Durée</th>
                            <th class="p-4">Motif</th>
                            <th class="p-4">Signalé par</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                          @for (abs of currentStudentAbsences(); track abs.id) {
                             <tr class="hover:bg-slate-50">
                               <td class="p-4 text-slate-700 font-medium">{{ abs.date }}</td>
                               <td class="p-4 font-bold text-slate-800">
                                  @switch (abs.duration) {
                                     @case ('FULL_DAY') { <span class="text-rose-600">Journée</span> }
                                     @case ('MORNING') { <span class="text-orange-600">Matin</span> }
                                     @case ('AFTERNOON') { <span class="text-orange-600">Après-midi</span> }
                                     @case ('HOURS') { <span class="text-indigo-600">{{ abs.hours }}h</span> }
                                  }
                               </td>
                               <td class="p-4 text-slate-600 font-medium">{{ abs.reason }}</td>
                               <td class="p-4 text-slate-500 text-xs">{{ abs.declaredBy }}</td>
                             </tr>
                          }
                          @if (currentStudentAbsences().length === 0) {
                             <tr><td colspan="4" class="p-8 text-center text-slate-500">Aucune absence enregistrée</td></tr>
                          }
                        </tbody>
                      </table>
                   </div>
                 }

               } @else {
                  <div class="h-full flex items-center justify-center text-slate-500 flex-col gap-4 border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50 min-h-[300px]">
                     <svg class="w-12 h-12 opacity-40 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                     <p class="font-medium">Sélectionnez un élève pour gérer ses {{ mode() === 'ABSENCES' ? 'absences' : 'notes' }}</p>
                  </div>
               }
            </div>
          </div>
        }

        @if (mode() === 'TEXTBOOK') {
           <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
              <!-- Form -->
              <div class="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-200 lg:col-span-1 h-fit">
                 <h3 class="font-bold text-lg text-slate-900 mb-6">Nouveau contenu</h3>
                 <div class="space-y-4">
                    <div>
                      <label class="block text-xs font-bold text-slate-600 uppercase mb-2">Contenu de la séance</label>
                      <textarea [ngModel]="tbContent()" (ngModelChange)="tbContent.set($event)" rows="4" class="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm text-slate-900 bg-slate-50 focus:bg-white placeholder:text-slate-400 font-medium"></textarea>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-600 uppercase mb-2">Devoirs à faire</label>
                      <textarea [ngModel]="tbHomework()" (ngModelChange)="tbHomework.set($event)" rows="2" class="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm text-slate-900 bg-slate-50 focus:bg-white placeholder:text-slate-400 font-medium"></textarea>
                    </div>
                    <button (click)="addTextbook()" [disabled]="!tbContent()" class="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 disabled:opacity-50 cursor-pointer">Enregistrer</button>
                 </div>
              </div>

              <!-- Timeline -->
              <div class="lg:col-span-2 space-y-6">
                 @for (entry of classTextbook(); track entry.id) {
                    <div class="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-200 relative group hover:border-indigo-200 transition-colors">
                       <div class="flex justify-between items-start mb-3">
                          <div>
                             <p class="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <span class="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">{{ entry.date }}</span>
                                <span class="text-slate-400">•</span>
                                <span class="text-indigo-700">{{ entry.subject }}</span>
                             </p>
                             <p class="text-slate-900 mt-3 leading-relaxed text-lg font-medium">{{ entry.content }}</p>
                          </div>
                          @if(entry.homework) {
                             <div class="bg-amber-50 text-amber-900 text-xs font-bold px-3 py-2 rounded-xl border border-amber-200 max-w-[200px] shadow-sm">
                                <span class="block text-amber-600 text-[10px] uppercase mb-1">Pour la prochaine fois</span>
                                {{ entry.homework }}
                             </div>
                          }
                       </div>
                    </div>
                 }
              </div>
           </div>
        }

      } @else {
         @if (!isPrimary()) {
            <div class="text-center py-20 animate-fade-in bg-white rounded-3xl border border-dashed border-slate-300 m-8">
              <p class="text-slate-600 font-bold text-lg">Veuillez sélectionner une classe ci-dessus.</p>
            </div>
         }
      }
      } 
    </div>
  `
})
export class TeacherViewComponent {
  mode = input.required<'GRADES' | 'TEXTBOOK' | 'ABSENCES'>();

  auth = inject(AuthService);
  school = inject(SchoolService);

  user = computed(() => this.auth.currentUser());
  isPrimary = computed(() => this.auth.userRole() === 'PROF_PRIMAIRE');
  isDirector = computed(() => this.auth.userRole() === 'DIRECTEUR');
  
  // For Director View
  allAbsences = this.school.absences;
  absenceClassFilter = signal<string>(''); // Filter state

  allAbsencesSorted = computed(() => {
    let list = this.allAbsences();
    const filter = this.absenceClassFilter();

    // Apply Filter if selected
    if (filter) {
      list = list.filter(abs => {
        const student = this.school.students().find(s => s.id === abs.studentId);
        return student?.classId === filter;
      });
    }

    // Sort Descending
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  getStudent(id: string) {
    return this.school.students().find(s => s.id === id);
  }

  // For Primary: class is fixed from user profile. For Lycee: selected via dropdown
  myClassId = computed(() => this.user()?.classId); 
  selectedClassId = signal('');
  
  activeClassId = computed(() => {
    return this.isPrimary() ? this.myClassId() : this.selectedClassId();
  });

  mySubject = computed(() => this.user()?.subject ?? 'Général');

  // Grades Logic
  selectedStudentId = signal('');
  classStudents = computed(() => {
    const cid = this.activeClassId();
    if (!cid) return [];
    return this.school.students().filter(s => s.classId === cid);
  });

  currentStudentGrades = computed(() => {
    const sid = this.selectedStudentId();
    const sub = this.mySubject();
    if (!sid) return [];
    // Primary teachers manage all subjects technically
    return this.school.grades().filter(g => g.studentId === sid && (this.isPrimary() ? true : g.subject === sub));
  });

  // Absence Logic
  currentStudentAbsences = computed(() => {
    const sid = this.selectedStudentId();
    if (!sid) return [];
    return this.school.absences().filter(a => a.studentId === sid);
  });

  newAbsenceDate = signal<string>(new Date().toISOString().split('T')[0]);
  newAbsenceDuration = signal<AbsenceDuration>('FULL_DAY');
  newAbsenceHours = signal<number>(1);
  newAbsenceReason = signal<string>('');

  canAddAbsence = computed(() => {
      return this.selectedStudentId() && this.newAbsenceDate() && this.newAbsenceReason();
  });

  addAbsence() {
      if (this.canAddAbsence()) {
          const newAbs: Absence = {
              id: 'abs_' + Date.now(),
              studentId: this.selectedStudentId(),
              date: this.newAbsenceDate(),
              duration: this.newAbsenceDuration(),
              hours: this.newAbsenceDuration() === 'HOURS' ? this.newAbsenceHours() : undefined,
              reason: this.newAbsenceReason(),
              declaredBy: this.user()?.name ?? 'Professeur'
          };
          this.school.addAbsence(newAbs);
          
          // Reset fields
          this.newAbsenceReason.set('');
          this.newAbsenceDuration.set('FULL_DAY');
      }
  }

  // New Grade Form
  newGradeValue = signal<number | undefined>(undefined);
  newGradeCoef = signal<number>(1);
  newGradeType = signal<GradeType>('CONTROLE');
  newGradeSubject = signal<string>('Français'); // Default for primary

  canAddGrade = computed(() => this.newGradeValue() !== undefined && this.selectedStudentId());

  getStudentAverage(studentId: string) {
    return this.school.getStudentAverage(studentId);
  }

  addGrade() {
    if (this.canAddGrade()) {
       // Primary: Coef is 1, Subject is selected. HighSchool: Coef is selected, Subject is user's subject.
       const subject = this.isPrimary() ? this.newGradeSubject() : this.mySubject();
       const coef = this.isPrimary() ? 1 : this.newGradeCoef();

       const newGrade: Grade = {
         id: 'g' + Date.now(),
         studentId: this.selectedStudentId(),
         subject: subject,
         value: this.newGradeValue()!,
         coef: coef,
         type: this.newGradeType(),
         date: new Date().toISOString().split('T')[0],
         teacherId: this.user()?.id ?? 'unknown'
       };
       this.school.addGrade(newGrade);
       this.newGradeValue.set(undefined);
    }
  }

  exportGradesCSV() {
    const studentName = this.school.students().find(s => s.id === this.selectedStudentId())?.name || 'Eleve';
    const data = this.currentStudentGrades().map(g => ({
      Date: g.date,
      Matiere: g.subject,
      Type: g.type,
      Note: g.value,
      Coef: g.coef,
      Professeur: this.user()?.name
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
    link.download = `notes_${studentName}_${this.mySubject()}_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Textbook Logic
  tbContent = signal('');
  tbHomework = signal('');

  classTextbook = computed(() => {
    const cid = this.activeClassId();
    return this.school.textbook().filter(t => t.classId === cid);
  });

  addTextbook() {
    if (this.tbContent() && this.activeClassId()) {
      const entry: TextbookEntry = {
        id: 'tb' + Date.now(),
        classId: this.activeClassId()!,
        date: new Date().toISOString().split('T')[0],
        content: this.tbContent(),
        homework: this.tbHomework(),
        teacherName: this.user()?.name ?? 'Prof',
        subject: this.mySubject()
      };
      this.school.addTextbookEntry(entry);
      this.tbContent.set('');
      this.tbHomework.set('');
    }
  }
}