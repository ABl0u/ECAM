import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { SchoolService, Student, SubjectConfig } from '../../services/school.service';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="space-y-8 relative">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Administration</h2>
           <p class="text-slate-500 mt-1">Gérez les élèves, les classes et les matières</p>
        </div>
        <div class="flex p-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto max-w-full">
           <button (click)="activeTab.set('STUDENTS')" [class]="tabClass('STUDENTS')">Élèves</button>
           <button (click)="activeTab.set('CLASSES')" [class]="tabClass('CLASSES')">Classes</button>
           <button (click)="activeTab.set('SUBJECTS')" [class]="tabClass('SUBJECTS')">Matières</button>
        </div>
      </div>

      <!-- Students Tab -->
      @if (activeTab() === 'STUDENTS') {
        <div class="space-y-6 animate-slide-up">
           
           <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <!-- Class Filter -->
              <div class="relative min-w-[200px]">
                  <select [ngModel]="selectedClassFilter()" (ngModelChange)="selectedClassFilter.set($event)" 
                      class="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2.5 pl-4 pr-10 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium shadow-sm cursor-pointer hover:border-indigo-200 transition-colors">
                      <option value="">Toutes les classes</option>
                      @for (c of classes(); track c.id) {
                          <option [value]="c.id">{{ c.name }}</option>
                      }
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                  </div>
              </div>

              <div class="flex gap-3 w-full sm:w-auto">
                  <button (click)="exportStudentsCSV()" class="flex-1 sm:flex-none justify-center bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
                     <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                     <span>Exporter CSV</span>
                  </button>
                  <button (click)="openStudentForm()" class="flex-1 sm:flex-none justify-center bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2">
                     <span>+ Nouvel Élève</span>
                  </button>
              </div>
           </div>

           @if (showStudentForm()) {
              <div class="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 animate-scale-in">
                 <h3 class="font-bold text-xl text-slate-800 mb-6">Fiche Élève (Cahier des charges §4)</h3>
                 <form [formGroup]="studentForm" (ngSubmit)="saveStudent()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label class="block text-xs font-bold text-slate-600 uppercase mb-2">Matricule</label>
                      <input type="text" formControlName="matricule" class="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 outline-none text-slate-700" readonly>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-600 uppercase mb-2">Nom et Prénom</label>
                      <input type="text" formControlName="name" class="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-600 uppercase mb-2">Classe</label>
                      <select formControlName="classId" class="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white text-slate-700">
                        @for (c of classes(); track c.id) {
                           <option [value]="c.id">{{ c.name }}</option>
                        }
                      </select>
                    </div>
                    
                    <div>
                      <label class="block text-xs font-bold text-slate-600 uppercase mb-2">Date de naissance</label>
                      <input type="date" formControlName="dob" class="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-600 uppercase mb-2">Lieu de naissance</label>
                      <input type="text" formControlName="pob" class="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700">
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-600 uppercase mb-2">Sexe</label>
                      <select formControlName="sex" class="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white text-slate-700">
                         <option value="M">Masculin</option>
                         <option value="F">Féminin</option>
                      </select>
                    </div>

                    <div class="lg:col-span-2">
                       <label class="block text-xs font-bold text-slate-600 uppercase mb-2">Adresse</label>
                       <input type="text" formControlName="address" class="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700">
                    </div>
                    <div>
                       <label class="block text-xs font-bold text-slate-600 uppercase mb-2">Statut</label>
                        <select formControlName="status" class="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white text-slate-700">
                         <option value="ACTIF">Actif</option>
                         <option value="SUSPENDU">Suspendu</option>
                         <option value="SORTI">Sorti</option>
                      </select>
                    </div>

                    <div class="lg:col-span-3 border-t border-slate-100 pt-4 mt-2">
                       <h4 class="font-bold text-slate-700 mb-4">Responsable Légal</h4>
                       <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label class="block text-xs font-bold text-slate-600 uppercase mb-2">Nom du Responsable</label>
                            <input type="text" formControlName="guardianName" class="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700">
                          </div>
                          <div>
                            <label class="block text-xs font-bold text-slate-600 uppercase mb-2">Année Scolaire</label>
                            <input type="text" formControlName="academicYear" class="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 text-slate-700" readonly>
                          </div>
                       </div>
                    </div>

                    <div class="lg:col-span-3 flex justify-end gap-3 mt-4">
                       <button type="button" (click)="showStudentForm.set(false)" class="px-6 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium">Annuler</button>
                       <button type="submit" [disabled]="studentForm.invalid" class="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 disabled:opacity-50">Enregistrer</button>
                    </div>
                 </form>
              </div>
           }

           <div class="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
             <table class="w-full text-left">
               <thead class="bg-slate-50/50 text-xs uppercase text-slate-500 font-bold tracking-wider border-b border-slate-50">
                 <tr>
                   <th class="p-4">Matricule</th>
                   <th class="p-4">Élève</th>
                   <th class="p-4">Classe</th>
                   <th class="p-4">Responsable</th>
                   <th class="p-4">Statut</th>
                 </tr>
               </thead>
               <tbody class="divide-y divide-slate-50">
                 @for (s of filteredStudents(); track s.id) {
                   <tr class="hover:bg-slate-50/80 transition-colors">
                     <td class="p-4 font-mono text-slate-500 text-sm">{{ s.matricule }}</td>
                     <td class="p-4 font-semibold text-slate-700">
                        {{ s.name }}
                        <div class="text-xs text-slate-500 font-normal">{{ s.dob }} ({{ s.sex }})</div>
                     </td>
                     <td class="p-4"><span class="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold">{{ s.classId }}</span></td>
                     <td class="p-4 text-sm text-slate-600">{{ s.guardianName }}</td>
                     <td class="p-4">
                       <span [class]="'px-2 py-1 rounded text-xs font-bold ' + (s.status === 'ACTIF' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')">
                         {{ s.status }}
                       </span>
                     </td>
                   </tr>
                 }
                 @if (filteredStudents().length === 0) {
                     <tr>
                        <td colspan="5" class="p-8 text-center text-slate-500">Aucun élève trouvé.</td>
                     </tr>
                 }
               </tbody>
             </table>
           </div>
        </div>
      }

      <!-- Classes Tab -->
      @if (activeTab() === 'CLASSES') {
         <div class="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden animate-slide-up">
          <div class="p-6 border-b border-slate-50">
            <h3 class="font-bold text-lg text-slate-800">Structure des classes</h3>
          </div>
          <div class="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (cls of classes(); track cls.id) {
              <div class="p-6 border border-slate-100 rounded-2xl hover:shadow-xl hover:border-indigo-100 transition-all duration-300 bg-white group cursor-default hover:-translate-y-1">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h4 class="font-bold text-xl text-slate-800 group-hover:text-indigo-600 transition-colors">{{ cls.name }}</h4>
                    <p class="text-sm text-slate-400 font-medium">{{ cls.level }}</p>
                  </div>
                  <div class="bg-slate-50 text-slate-600 text-xs font-bold px-2 py-1 rounded uppercase group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    {{ cls.id }}
                  </div>
                </div>
                <div class="pt-4 border-t border-slate-50 flex flex-col gap-2 text-sm text-slate-500">
                  <div class="flex items-center gap-2">
                     <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                     <span class="font-medium">{{ getStudentCount(cls.id) }} élèves inscrits</span>
                  </div>
                  @if (cls.mainTeacherId) {
                     <div class="flex items-center gap-2 text-indigo-600">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <span>Prof. Principal assigné</span>
                     </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Subjects Tab -->
      @if (activeTab() === 'SUBJECTS') {
         <div class="animate-slide-up space-y-6">
            <div class="flex justify-end">
               <button (click)="openSubjectModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  Nouvelle Matière
               </button>
            </div>

            <div class="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                <div class="p-6 border-b border-slate-50">
                  <h3 class="font-bold text-lg text-slate-800">Gestion des Matières (Coefficients)</h3>
                </div>
                <div class="p-0">
                  <table class="w-full text-left">
                      <thead class="bg-slate-50/50 text-xs uppercase text-slate-500 font-bold tracking-wider border-b border-slate-50">
                        <tr>
                            <th class="p-6">Matière</th>
                            <th class="p-6">Coefficient</th>
                            <th class="p-6">Enseignant Responsable</th>
                            <th class="p-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-50">
                        @for (sub of subjects(); track sub.id) {
                            <tr class="hover:bg-slate-50/50 transition-colors">
                              <td class="p-6 font-bold text-slate-700">{{ sub.name }}</td>
                              <td class="p-6">
                                  <span class="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold text-sm">{{ sub.coef }}</span>
                              </td>
                              <td class="p-6 text-slate-500">
                                  {{ getTeacherName(sub.teacherId) }}
                              </td>
                              <td class="p-6 text-right">
                                  <button (click)="openSubjectModal(sub)" class="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                                    Modifier
                                  </button>
                              </td>
                            </tr>
                        }
                      </tbody>
                  </table>
                </div>
            </div>
         </div>
      }
    </div>

    <!-- SUBJECT MODAL -->
    @if (showSubjectModal()) {
      <div class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in" role="dialog" aria-modal="true">
         <div class="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl animate-scale-in relative overflow-hidden flex flex-col">
            
            <div class="pt-8 px-8 pb-2 flex justify-between items-start">
              <div>
                  <h3 class="font-bold text-2xl text-slate-900 tracking-tight">{{ isEditingSubject() ? 'Modifier la Matière' : 'Nouvelle Matière' }}</h3>
                  <p class="text-slate-400 text-sm font-medium mt-1">Configuration pédagogique</p>
              </div>
              <button (click)="closeSubjectModal()" class="w-9 h-9 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-colors">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form [formGroup]="subjectForm" (ngSubmit)="saveSubject()" class="p-8 space-y-6">
                <!-- Name -->
                <div class="bg-slate-50 rounded-2xl p-3 focus-within:bg-white focus-within:shadow-[0_0_0_2px_rgba(99,102,241,0.1)] transition-all border border-transparent focus-within:border-indigo-100">
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 px-1">Intitulé de la matière</label>
                  <input type="text" formControlName="name" placeholder="Ex: Mathématiques" class="w-full bg-transparent border-none p-0 text-slate-800 font-bold text-lg focus:ring-0 placeholder:font-normal placeholder:text-slate-400">
                </div>

                <div class="flex gap-4">
                   <!-- Coef -->
                   <div class="flex-1 bg-slate-50 rounded-2xl p-3 focus-within:bg-white focus-within:shadow-[0_0_0_2px_rgba(99,102,241,0.1)] transition-all border border-transparent focus-within:border-indigo-100">
                      <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 px-1">Coefficient</label>
                      <input type="number" formControlName="coef" min="1" placeholder="1" class="w-full bg-transparent border-none p-0 text-slate-800 font-bold text-lg focus:ring-0">
                   </div>
                   
                   <!-- Teacher Select -->
                   <div class="flex-[2] bg-slate-50 rounded-2xl p-3 focus-within:bg-white focus-within:shadow-[0_0_0_2px_rgba(99,102,241,0.1)] transition-all border border-transparent focus-within:border-indigo-100">
                      <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 px-1">Responsable</label>
                      <select formControlName="teacherId" class="w-full bg-transparent border-none p-0 text-slate-800 font-bold text-sm focus:ring-0 cursor-pointer py-1">
                        <option value="">-- Aucun --</option>
                        @for (t of teacherList(); track t.id) {
                           <option [value]="t.id">{{ t.name }}</option>
                        }
                      </select>
                   </div>
                </div>

                <div class="pt-4 flex gap-4">
                   <button type="button" (click)="closeSubjectModal()" class="flex-1 py-3.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                      Annuler
                   </button>
                   <button type="submit" [disabled]="subjectForm.invalid" class="flex-[2] py-3.5 rounded-2xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100">
                      {{ isEditingSubject() ? 'Mettre à jour' : 'Créer la matière' }}
                   </button>
                </div>
            </form>
         </div>
      </div>
    }
  `
})
export class AdminViewComponent {
  auth = inject(AuthService);
  school = inject(SchoolService);
  fb: FormBuilder = inject(FormBuilder);
  
  activeTab = signal<'STUDENTS' | 'CLASSES' | 'SUBJECTS'>('STUDENTS');
  showStudentForm = signal(false);
  
  // Subject Modal State
  showSubjectModal = signal(false);
  isEditingSubject = signal(false);
  editingSubjectId = signal<string | null>(null);

  // Filters
  selectedClassFilter = signal<string>('');

  classes = this.school.classes;
  subjects = this.school.subjects;
  students = this.school.students;

  // Helpers
  teacherList = computed(() => {
    return this.auth.getUsers().filter(u => u.role.startsWith('PROF'));
  });
  
  filteredStudents = computed(() => {
    const filter = this.selectedClassFilter();
    const list = this.students();
    if (!filter) return list;
    return list.filter(s => s.classId === filter);
  });

  studentForm = this.fb.group({
    matricule: [''],
    name: ['', Validators.required],
    dob: ['', Validators.required],
    pob: ['', Validators.required],
    sex: ['M', Validators.required],
    address: ['', Validators.required],
    classId: ['', Validators.required],
    guardianName: ['', Validators.required],
    status: ['ACTIF', Validators.required],
    academicYear: ['2023-2024', Validators.required]
  });

  subjectForm = this.fb.group({
    name: ['', Validators.required],
    coef: [1, [Validators.required, Validators.min(1)]],
    teacherId: ['']
  });

  tabClass(tab: string) {
    const base = "px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ";
    return this.activeTab() === tab 
      ? base + "bg-indigo-600 text-white shadow-md" 
      : base + "text-slate-500 hover:text-slate-800 hover:bg-slate-50";
  }

  getStudentCount(classId: string) {
    return this.school.students().filter(s => s.classId === classId).length;
  }

  getTeacherName(id?: string) {
    if (!id) return 'Non assigné';
    const t = this.auth.getUsers().find(u => u.id === id);
    return t ? t.name : id;
  }

  // --- Student Logic ---
  openStudentForm() {
    this.studentForm.reset({
      matricule: 'MAT' + (Date.now() % 10000), // Auto-gen mock matricule
      sex: 'M',
      status: 'ACTIF',
      academicYear: '2023-2024'
    });
    this.showStudentForm.set(true);
  }

  saveStudent() {
    if (this.studentForm.valid) {
      const formVal = this.studentForm.value;
      const newStudent: Student = {
        id: 's' + Date.now(),
        matricule: formVal.matricule!,
        name: formVal.name!,
        dob: formVal.dob!,
        pob: formVal.pob!,
        sex: formVal.sex as 'M'|'F',
        address: formVal.address!,
        guardianName: formVal.guardianName!,
        classId: formVal.classId!,
        status: formVal.status as any,
        academicYear: formVal.academicYear!
      };
      this.school.addStudent(newStudent);
      this.showStudentForm.set(false);
    }
  }

  exportStudentsCSV() {
    const data = this.filteredStudents().map(s => ({
      Matricule: s.matricule,
      Nom: s.name,
      'Date Naissance': s.dob,
      'Lieu Naissance': s.pob,
      Sexe: s.sex,
      Adresse: s.address,
      Classe: s.classId,
      Responsable: s.guardianName,
      Statut: s.status,
      'Annee Scolaire': s.academicYear
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
    link.download = `liste_eleves_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // --- Subject Logic ---
  
  openSubjectModal(subject?: SubjectConfig) {
    if (subject) {
      this.isEditingSubject.set(true);
      this.editingSubjectId.set(subject.id);
      this.subjectForm.patchValue({
        name: subject.name,
        coef: subject.coef,
        teacherId: subject.teacherId || ''
      });
    } else {
      this.isEditingSubject.set(false);
      this.editingSubjectId.set(null);
      this.subjectForm.reset({ coef: 1, teacherId: '' });
    }
    this.showSubjectModal.set(true);
  }

  closeSubjectModal() {
    this.showSubjectModal.set(false);
    this.isEditingSubject.set(false);
    this.editingSubjectId.set(null);
  }

  saveSubject() {
    if (this.subjectForm.valid) {
      const val = this.subjectForm.value;
      const newSub: SubjectConfig = {
        id: this.isEditingSubject() ? this.editingSubjectId()! : 'sub_' + Date.now(),
        name: val.name!,
        coef: val.coef!,
        teacherId: val.teacherId || undefined
      };

      this.school.updateSubject(newSub);
      this.closeSubjectModal();
    }
  }
}