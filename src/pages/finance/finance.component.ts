import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchoolService, Transaction } from '../../services/school.service';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule, AbstractControl } from '@angular/forms';

// Custom validator to handle strings with spaces (e.g. "1 200")
function minAmountValidator(min: number) {
  return (control: AbstractControl) => {
    if (!control.value) return null;
    const numericValue = parseInt(control.value.toString().replace(/\s/g, ''), 10);
    return !isNaN(numericValue) && numericValue >= min ? null : { min: true };
  };
}

@Component({
  selector: 'app-finance-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <!-- Create Transaction Modal -->
    @if (showModal()) {
      <div class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in" role="dialog" aria-modal="true">
        <!-- Card Container -->
        <div class="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl animate-scale-in relative overflow-hidden flex flex-col max-h-[90vh]">
          
          <!-- Header (Minimalist) -->
          <div class="pt-8 px-8 pb-4 flex justify-between items-start">
             <div>
                <h3 class="font-bold text-2xl text-slate-900 tracking-tight">Nouvelle Opération</h3>
                <p class="text-slate-500 text-sm font-medium mt-1">Remplissez les détails ci-dessous</p>
             </div>
             <button (click)="closeModal()" class="w-9 h-9 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
             </button>
          </div>

          <div class="p-8 pt-2 overflow-y-auto custom-scrollbar space-y-8">
             <form [formGroup]="form" (ngSubmit)="saveTransaction()">
                
                <!-- Type Switcher (Segmented Control) -->
                <div class="bg-slate-100/80 p-1.5 rounded-2xl flex relative mb-8">
                   <div class="absolute inset-y-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
                        [style.left]="form.value.type === 'INCOME' ? '6px' : 'calc(50%)'"></div>
                   
                   <button type="button" (click)="setTransactionType('INCOME')" 
                      [class]="form.value.type === 'INCOME' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'"
                      class="flex-1 relative z-10 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/></svg>
                      RECETTE
                   </button>
                   <button type="button" (click)="setTransactionType('EXPENSE')"
                      [class]="form.value.type === 'EXPENSE' ? 'text-rose-700' : 'text-slate-500 hover:text-slate-700'"
                      class="flex-1 relative z-10 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"/></svg>
                      DÉPENSE
                   </button>
                </div>

                <!-- Amount (Hero Input) -->
                <div class="mb-8 text-center">
                   <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Montant Total de la transaction</label>
                   <!-- Increased max-width from 200px to 350px to accommodate billions -->
                   <div class="relative inline-block w-full max-w-[350px]">
                      <input type="text" inputmode="numeric" formControlName="amount" placeholder="0" 
                         (input)="formatMoneyInput($event, 'amount')"
                         class="w-full bg-transparent text-5xl font-bold text-slate-900 text-center outline-none placeholder:text-slate-300 border-b-2 border-slate-100 focus:border-indigo-500 transition-colors pb-2">
                      <span class="absolute top-0 -right-4 text-2xl text-slate-400 font-medium mt-2">€</span>
                   </div>
                </div>

                <!-- Context Switch -->
                <div class="grid grid-cols-2 gap-4 mb-6">
                   <button type="button" (click)="setContext(true)"
                      [class]="form.value.isStudentLinked 
                         ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-200' 
                         : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'"
                      class="p-4 rounded-2xl border text-left transition-all duration-200 group">
                      <div class="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1">Cible</div>
                      <div class="font-bold flex items-center gap-2">
                         <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                         Élève
                      </div>
                   </button>

                   <button type="button" (click)="setContext(false)"
                       [class]="!form.value.isStudentLinked 
                         ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-200' 
                         : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'"
                      class="p-4 rounded-2xl border text-left transition-all duration-200 group">
                      <div class="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1">Cible</div>
                      <div class="font-bold flex items-center gap-2">
                         <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                         Autre / Activité
                      </div>
                   </button>
                </div>

                <!-- Dynamic Fields -->
                <div class="space-y-5 animate-slide-up">
                   @if (form.value.isStudentLinked) {
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div class="bg-slate-50 rounded-2xl p-2.5 focus-within:bg-white focus-within:shadow-[0_0_0_2px_rgba(99,102,241,0.1)] transition-all">
                            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 px-2">Classe</label>
                            <select formControlName="filterClassId" class="w-full bg-transparent border-none text-sm font-semibold text-slate-800 focus:ring-0 cursor-pointer">
                               <option value="">-- Toutes --</option>
                               @for(c of school.classes(); track c.id) {
                                  <option [value]="c.id">{{ c.name }}</option>
                               }
                            </select>
                         </div>
                         <div class="bg-slate-50 rounded-2xl p-2.5 focus-within:bg-white focus-within:shadow-[0_0_0_2px_rgba(99,102,241,0.1)] transition-all">
                            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 px-2">Élève</label>
                            <select formControlName="studentId" class="w-full bg-transparent border-none text-sm font-semibold text-slate-800 focus:ring-0 cursor-pointer">
                               <option value="">-- Sélectionner --</option>
                               @for(s of filteredStudentList(); track s.id) {
                                  <option [value]="s.id">{{ s.name }}</option>
                               }
                            </select>
                         </div>
                      </div>
                   } @else {
                      <div class="bg-slate-50 rounded-2xl p-3 focus-within:bg-white focus-within:shadow-[0_0_0_2px_rgba(99,102,241,0.1)] transition-all">
                         <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 px-1">Catégorie</label>
                         <input type="text" formControlName="category" placeholder="Ex: Matériel, Subvention..." class="w-full bg-transparent border-none p-0 text-slate-800 font-semibold focus:ring-0 placeholder:font-normal">
                      </div>
                   }

                   <div class="bg-slate-50 rounded-2xl p-3 focus-within:bg-white focus-within:shadow-[0_0_0_2px_rgba(99,102,241,0.1)] transition-all">
                      <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 px-1">Description</label>
                      <input type="text" formControlName="description" placeholder="Détails de l'opération..." class="w-full bg-transparent border-none p-0 text-slate-800 font-semibold focus:ring-0 placeholder:font-normal">
                   </div>

                   <!-- Status Selector (Visual) -->
                   <div>
                      <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Statut du paiement</label>
                      <div class="flex gap-3 overflow-x-auto pb-1">
                         <label class="cursor-pointer">
                            <input type="radio" formControlName="status" value="PAID" class="peer sr-only">
                            <div class="px-4 py-2 rounded-xl bg-slate-50 border border-transparent text-slate-500 text-xs font-bold transition-all peer-checked:bg-emerald-50 peer-checked:text-emerald-700 peer-checked:border-emerald-200 flex items-center gap-2">
                               <div class="w-2 h-2 rounded-full bg-emerald-500 opacity-0 peer-checked:opacity-100"></div> Payé
                            </div>
                         </label>
                          <label class="cursor-pointer">
                            <input type="radio" formControlName="status" value="PENDING" class="peer sr-only">
                            <div class="px-4 py-2 rounded-xl bg-slate-50 border border-transparent text-slate-500 text-xs font-bold transition-all peer-checked:bg-amber-50 peer-checked:text-amber-700 peer-checked:border-amber-200 flex items-center gap-2">
                               <div class="w-2 h-2 rounded-full bg-amber-500 opacity-0 peer-checked:opacity-100"></div> En attente
                            </div>
                         </label>
                          <label class="cursor-pointer">
                            <input type="radio" formControlName="status" value="PARTIAL" class="peer sr-only">
                            <div class="px-4 py-2 rounded-xl bg-slate-50 border border-transparent text-slate-500 text-xs font-bold transition-all peer-checked:bg-orange-50 peer-checked:text-orange-700 peer-checked:border-orange-200 flex items-center gap-2">
                               <div class="w-2 h-2 rounded-full bg-orange-500 opacity-0 peer-checked:opacity-100"></div> Partiel
                            </div>
                         </label>
                      </div>

                      <!-- Partial Amount Input (Appears only if PARTIAL is selected) -->
                      @if (form.value.status === 'PARTIAL') {
                         <div class="mt-4 animate-slide-up bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                            <label class="block text-[10px] font-bold text-orange-700 uppercase tracking-widest mb-2">Montant versé aujourd'hui</label>
                            <div class="relative">
                               <input type="text" inputmode="numeric" formControlName="partialPaymentAmount" placeholder="0" 
                                  (input)="formatMoneyInput($event, 'partialPaymentAmount')"
                                  class="w-full bg-white border border-orange-200 rounded-xl p-3 text-orange-900 font-bold outline-none focus:ring-2 focus:ring-orange-500/20 shadow-sm">
                               <span class="absolute right-4 top-3 text-orange-400 font-bold">€</span>
                            </div>
                            <p class="text-[10px] text-orange-600/70 mt-2 font-medium">Ce montant sera noté comme acompte.</p>
                         </div>
                      }
                   </div>
                </div>

                <!-- Footer Actions -->
                <div class="pt-6 mt-6 border-t border-slate-50 flex gap-4">
                   <button type="button" (click)="closeModal()" class="flex-1 py-3.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                      Annuler
                   </button>
                   <button type="submit" [disabled]="form.invalid" class="flex-[2] py-3.5 rounded-2xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100">
                      Confirmer
                   </button>
                </div>
             </form>
          </div>

        </div>
      </div>
    }

    <!-- Settle Payment Modal -->
    @if (showSettleModal() && selectedTransaction()) {
      <div class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in" role="dialog" aria-modal="true">
        <div class="bg-white rounded-[2rem] w-full max-w-md shadow-2xl animate-scale-in relative overflow-hidden flex flex-col p-8">
           
           <div class="flex justify-between items-start mb-6">
              <div>
                 <h3 class="font-bold text-xl text-slate-900">Règlement</h3>
                 <p class="text-slate-500 text-sm">Encaisser un paiement pour cette transaction</p>
              </div>
              <button (click)="closeSettleModal()" class="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
           </div>

           <div class="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
              <div class="flex justify-between text-sm mb-2">
                 <span class="text-slate-500 font-medium">Total Facture</span>
                 <span class="font-bold text-slate-800">{{ formatMoney(selectedTransaction()!.amount) }} €</span>
              </div>
              <div class="flex justify-between text-sm mb-2">
                 <span class="text-slate-500 font-medium">Déjà réglé</span>
                 <span class="font-bold text-emerald-600">{{ formatMoney(selectedTransaction()!.partialAmount || 0) }} €</span>
              </div>
              <div class="border-t border-slate-200 my-2"></div>
              <div class="flex justify-between text-base">
                 <span class="text-slate-500 font-bold">Reste à payer</span>
                 <span class="font-extrabold text-rose-600">{{ formatMoney(remainingToPay()) }} €</span>
              </div>
           </div>

           <div class="mb-6">
              <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Montant à encaisser maintenant</label>
              <div class="relative">
                  <input type="text" inputmode="numeric" [ngModel]="settleAmount()" (ngModelChange)="settleAmount.set($event)" (input)="formatSettleInput($event)"
                     placeholder="0" 
                     class="w-full bg-white border border-indigo-100 rounded-xl p-4 text-2xl font-bold text-indigo-900 outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm text-center">
                  <span class="absolute right-4 top-5 text-indigo-300 font-bold text-xl">€</span>
              </div>
           </div>

           <div class="flex gap-3">
              <button (click)="payFullRemaining()" class="flex-1 py-3 rounded-xl font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors border border-indigo-100">
                 Tout régler
              </button>
              <button (click)="submitPayment()" class="flex-[2] py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                 Encaisser
              </button>
           </div>

        </div>
      </div>
    }

    <!-- Content (Wrapped in relative animate-slide-up for isolation) -->
    <div class="space-y-8 relative animate-slide-up">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-3xl font-bold text-slate-800 tracking-tight">Finances & Facturation</h2>
          <p class="text-slate-500 mt-1">Gestion des factures, écolages et dépenses</p>
        </div>
        <div class="flex gap-3">
          <button (click)="exportFinanceCSV()" class="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Export CSV
          </button>
          <button (click)="openCreateModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Nouvelle Facture
          </button>
        </div>
      </div>

      <!-- Stats (Fond Sombre = Texte Clair) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg">
           <div class="absolute top-0 right-0 p-4 opacity-5">
             <svg class="w-24 h-24 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
           </div>
           <p class="text-slate-500 text-sm font-bold uppercase tracking-wide mb-1">Recettes Encaissées</p>
           <p class="text-3xl font-extrabold text-emerald-600 tracking-tight">+ {{ formatMoney(totalIncome()) }} €</p>
        </div>
        <div class="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg">
           <div class="absolute top-0 right-0 p-4 opacity-5">
             <svg class="w-24 h-24 text-rose-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
           </div>
           <p class="text-slate-500 text-sm font-bold uppercase tracking-wide mb-1">Total Dépenses</p>
           <p class="text-3xl font-extrabold text-rose-600 tracking-tight">- {{ formatMoney(totalExpense()) }} €</p>
        </div>
        <div class="bg-slate-900 p-6 rounded-3xl shadow-xl shadow-slate-900/10 text-white relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-slate-900/20">
           <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full blur-[60px] opacity-30"></div>
           <!-- CONTRASTE CORRIGE: Label clair (slate-300) sur fond sombre -->
           <p class="text-slate-300 text-sm font-bold uppercase tracking-wide mb-1">Impayés</p>
           <p class="text-4xl font-extrabold tracking-tight text-white">{{ formatMoney(pendingAmount()) }} €</p>
        </div>
      </div>

      <!-- List -->
      <div class="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden delay-100">
        <table class="w-full text-left">
          <!-- Correction contraste: En-têtes plus sombres (slate-500) sur fond clair -->
          <thead class="bg-slate-50/50 text-xs uppercase text-slate-500 font-bold tracking-wider border-b border-slate-50">
            <tr>
              <th class="p-6">Date / Ref</th>
              <th class="p-6">Type</th>
              <th class="p-6">Description</th>
              <th class="p-6">Élève</th>
              <th class="p-6 text-right">Montant</th>
              <th class="p-6 text-center">Statut</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            @for (t of sortedTransactions(); track t.id) {
              <tr class="hover:bg-slate-50/80 transition-colors duration-200">
                <td class="p-6">
                   <div class="font-medium text-slate-700">{{ t.date }}</div>
                   <div class="text-xs text-slate-400 font-mono mt-1">{{ t.invoiceNumber ?? '-' }}</div>
                </td>
                <td class="p-6">
                  <span [class]="t.type === 'INCOME' ? 'text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100' : 'text-rose-700 bg-rose-50 px-3 py-1 rounded-full text-xs font-bold border border-rose-100'">
                    {{ t.type === 'INCOME' ? 'RECETTE' : 'DÉPENSE' }}
                  </span>
                </td>
                <td class="p-6 text-slate-600">{{ t.description }}</td>
                <td class="p-6 font-semibold text-slate-700">
                  {{ getStudentName(t.studentId) }}
                </td>
                <td [class]="'p-6 text-right font-mono font-bold text-lg ' + (t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600')">
                  {{ t.type === 'INCOME' ? '+' : '-' }}{{ formatMoney(t.amount) }} €
                  <!-- Display Partial Amount -->
                  @if(t.status === 'PARTIAL' && t.partialAmount) {
                     <div class="text-[10px] text-slate-400 font-sans font-medium mt-0.5">
                        Reglé: {{ formatMoney(t.partialAmount) }} €
                     </div>
                  }
                </td>
                 <td class="p-6 text-center">
                   <div class="flex justify-center items-center gap-2">
                      <span 
                        (click)="openSettleModal(t)"
                        [class]="getStatusBadgeClass(t.status) + (t.status !== 'PAID' ? ' cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-indigo-300' : '')">
                        @if(t.status === 'PARTIAL') {
                           <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        }
                        @if(t.status === 'PAID') {
                           <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        }
                        @if(t.status === 'PENDING') {
                           <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        }
                        {{ t.status === 'PAID' ? 'PAYÉ' : (t.status === 'PARTIAL' ? 'PARTIEL' : 'EN ATTENTE') }}
                      </span>
                   </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class FinanceViewComponent {
  school = inject(SchoolService);
  fb: FormBuilder = inject(FormBuilder);
  
  showModal = signal(false);
  
  // Logic for Settle Modal
  showSettleModal = signal(false);
  selectedTransaction = signal<Transaction | null>(null);
  settleAmount = signal<string>('0');

  // Formulaire complet pour la nouvelle modale
  form = this.fb.group({
    type: ['INCOME' as 'INCOME' | 'EXPENSE', Validators.required],
    isStudentLinked: [true], // Switch: Vrai = Eleve, Faux = Autre
    filterClassId: [''], // Filtre UI seulement
    studentId: [''], // ID réel
    category: ['Scolarité'], // Si pas élève
    // Change initial value to string '0' for text input handling
    amount: ['0', [Validators.required, minAmountValidator(0.01)]], 
    description: ['', Validators.required],
    status: ['PAID' as 'PAID' | 'PENDING' | 'PARTIAL', Validators.required],
    partialPaymentAmount: ['0'] // Champ pour le montant de l'acompte (string)
  });

  // Liste filtrée des élèves pour le dropdown
  filteredStudentList = computed(() => {
    const classId = this.form.get('filterClassId')?.value; 
    return this.school.students().filter(s => !this.currentClassFilter() || s.classId === this.currentClassFilter());
  });

  // Signal pour suivre le filtre de classe manuellement car formGroup n'est pas un signal
  currentClassFilter = signal('');

  constructor() {
     // Synchro du filtre classe
     this.form.get('filterClassId')?.valueChanges.subscribe(val => {
        this.currentClassFilter.set(val || '');
     });

     // Reset category if student is linked
     this.form.get('isStudentLinked')?.valueChanges.subscribe(isLinked => {
        if (isLinked) {
            this.form.patchValue({ category: 'Scolarité' });
            this.form.get('studentId')?.setValidators(Validators.required);
            this.form.get('category')?.clearValidators();
        } else {
            this.form.patchValue({ studentId: '', filterClassId: '' });
            this.form.get('studentId')?.clearValidators();
            this.form.get('category')?.setValidators(Validators.required);
        }
        this.form.get('studentId')?.updateValueAndValidity();
        this.form.get('category')?.updateValueAndValidity();
     });
  }

  sortedTransactions = computed(() => {
    return [...this.school.finances()].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  totalIncome = computed(() => this.school.finances().filter(t => t.type === 'INCOME' && t.status === 'PAID').reduce((acc, t) => acc + t.amount, 0));
  totalExpense = computed(() => this.school.finances().filter(t => t.type === 'EXPENSE' && t.status === 'PAID').reduce((acc, t) => acc + t.amount, 0));
  
  // Correction: Calcul du reste à payer réel (Total - acomptes)
  pendingAmount = computed(() => this.school.finances().filter(t => t.type === 'INCOME' && t.status !== 'PAID').reduce((acc, t) => acc + (t.amount - (t.partialAmount || 0)), 0));
  
  openCreateModal() {
    this.form.reset({
        type: 'INCOME',
        isStudentLinked: true,
        amount: '0',
        description: '',
        status: 'PAID',
        category: 'Scolarité',
        filterClassId: '',
        studentId: '',
        partialPaymentAmount: '0'
    });
    this.currentClassFilter.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  // Helper to format money with thousands separators
  formatMoney(amount: number | undefined | null): string {
    if (amount === undefined || amount === null) return '0';
    return amount.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  // --- Settle Logic ---
  remainingToPay = computed(() => {
    const t = this.selectedTransaction();
    if (!t) return 0;
    const paid = t.partialAmount || 0;
    return Math.round(t.amount - paid);
  });

  openSettleModal(t: Transaction) {
    if (t.status === 'PAID') return;
    this.selectedTransaction.set(t);
    this.settleAmount.set('0');
    this.showSettleModal.set(true);
  }

  closeSettleModal() {
    this.showSettleModal.set(false);
    this.selectedTransaction.set(null);
  }

  payFullRemaining() {
     const remaining = this.remainingToPay();
     // Manual format
     const formatted = remaining.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
     this.settleAmount.set(formatted);
  }

  formatSettleInput(event: any) {
    let inputVal = event.target.value;
    inputVal = inputVal.replace(/[^0-9]/g, '');
    if (inputVal.length > 3) {
      inputVal = inputVal.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    this.settleAmount.set(inputVal);
  }

  submitPayment() {
    const t = this.selectedTransaction();
    if (!t) return;

    const amountToPay = this.parseAmount(this.settleAmount());
    if (amountToPay <= 0) return;
    if (amountToPay > this.remainingToPay()) {
        alert("Le montant ne peut pas dépasser le reste à payer.");
        return;
    }

    const currentPaid = t.partialAmount || 0;
    const newPaidTotal = currentPaid + amountToPay;
    
    // Determine new status
    const newStatus = newPaidTotal >= t.amount ? 'PAID' : 'PARTIAL';

    const updatedTrans: Transaction = {
        ...t,
        partialAmount: newPaidTotal,
        status: newStatus
    };

    this.school.updateTransaction(updatedTrans);
    this.closeSettleModal();
  }

  // --- End Settle Logic ---

  setTransactionType(type: 'INCOME' | 'EXPENSE') {
      this.form.patchValue({ type });
  }

  setContext(isStudent: boolean) {
      this.form.patchValue({ isStudentLinked: isStudent });
  }

  formatMoneyInput(event: any, controlName: string) {
    let inputVal = event.target.value;
    
    // Remove non-digits
    inputVal = inputVal.replace(/[^0-9]/g, '');

    // Add thousands separator (space)
    if (inputVal.length > 3) {
      inputVal = inputVal.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    
    // Update form control without emitting event to avoid loop
    this.form.get(controlName)?.setValue(inputVal, { emitEvent: false });
  }

  // Helper to parse "1 200" to 1200
  parseAmount(value: any): number {
    if (!value) return 0;
    return parseInt(value.toString().replace(/\s/g, ''), 10) || 0;
  }

  saveTransaction() {
    if (this.form.valid) {
      const val = this.form.value;
      const isIncome = val.type === 'INCOME';
      
      const parsedAmount = this.parseAmount(val.amount);
      const parsedPartial = this.parseAmount(val.partialPaymentAmount);

      const newTrans: Transaction = {
        id: 't' + Date.now(),
        invoiceNumber: isIncome ? 'FAC-' + Date.now().toString().slice(-6) : undefined,
        type: val.type!,
        category: val.isStudentLinked ? 'Scolarité' : (val.category || 'Autre'),
        studentId: val.isStudentLinked ? val.studentId! : undefined,
        amount: parsedAmount, // Use parsed amount
        description: val.description!,
        date: new Date().toISOString().split('T')[0],
        status: val.status!,
        // Mapped to partialAmount if applicable
        partialAmount: (val.status === 'PARTIAL' && parsedPartial > 0) ? parsedPartial : undefined
      };
      
      this.school.addTransaction(newTrans);
      this.closeModal();
    }
  }

  getStudentName(id?: string) {
    if (!id) return '-';
    return this.school.students().find(s => s.id === id)?.name ?? id;
  }

  getStatusBadgeClass(status: string) {
    const base = "px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105 ";
    if (status === 'PAID') return base + "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (status === 'PARTIAL') return base + "bg-orange-50 text-orange-700 border-orange-200 ring-2 ring-orange-100 ring-opacity-50"; 
    return base + "bg-red-50 text-red-700 border-red-100";
  }

  exportFinanceCSV() {
    const data = this.sortedTransactions().map(t => ({
      Date: t.date,
      Ref: t.invoiceNumber || '',
      Type: t.type,
      Categorie: t.category,
      Description: t.description,
      Montant: t.amount,
      Eleve: this.getStudentName(t.studentId),
      Statut: t.status,
      // Optional: Add Paid amount to CSV if needed
      'Montant Regle': t.partialAmount || ''
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
    link.download = `finance_export_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}