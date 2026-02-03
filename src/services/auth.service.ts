import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

export type UserRole = 'DIRECTEUR' | 'ADMINISTRATIF' | 'PROF_LYCEE' | 'PROF_PRIMAIRE' | 'ELEVE' | 'COMPTABLE';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  passwordHash: string; // Mock hash
  mustChangePassword: boolean;
  classId?: string; // For students or primary teachers
  subject?: string; // For teachers
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Mock Users Database
  private _users: User[] = [
    { id: 'u1', username: 'directeur', name: 'M. Le Directeur', role: 'DIRECTEUR', passwordHash: 'admin123', mustChangePassword: true },
    { id: 'u_adm', username: 'resp.admin', name: 'Mme. Martin (Admin)', role: 'ADMINISTRATIF', passwordHash: 'admin123', mustChangePassword: true },
    { id: 'u2', username: 'prof.math', name: 'Mme. Curie (Maths)', role: 'PROF_LYCEE', passwordHash: 'admin123', mustChangePassword: true, subject: 'Mathématiques' },
    { id: 'u3', username: 'prof.fr', name: 'M. Hugo (Français)', role: 'PROF_LYCEE', passwordHash: 'admin123', mustChangePassword: true, subject: 'Français' },
    { id: 'u4', username: 'prof.prim', name: 'Mme. Montessori', role: 'PROF_PRIMAIRE', passwordHash: 'admin123', mustChangePassword: true, classId: 'CM2' },
    { id: 'u5', username: 'eleve1', name: 'Jean Dupont', role: 'ELEVE', passwordHash: 'admin123', mustChangePassword: true, classId: 'Term' },
    { id: 'u6', username: 'comptable', name: 'M. Picsou', role: 'COMPTABLE', passwordHash: 'admin123', mustChangePassword: true }
  ];

  currentUser = signal<User | null>(null);
  
  // Helpers
  isLoggedIn = computed(() => !!this.currentUser());
  isFirstLogin = computed(() => this.currentUser()?.mustChangePassword ?? false);
  userRole = computed(() => this.currentUser()?.role);

  constructor(private router: Router) {
    // Attempt to restore session from local storage (mock)
    const stored = localStorage.getItem('ecoGestUser');
    if (stored) {
      this.currentUser.set(JSON.parse(stored));
    }
  }

  login(username: string, password: string): boolean {
    const user = this._users.find(u => u.username === username && u.passwordHash === password);
    if (user) {
      this.currentUser.set(user);
      this.saveSession();
      return true;
    }
    return false;
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('ecoGestUser');
    this.router.navigate(['/login']);
  }

  changePassword(newPass: string) {
    const user = this.currentUser();
    if (user) {
      // In a real app, we would hash this.
      // We update the local instance and the "database"
      const updatedUser = { ...user, passwordHash: newPass, mustChangePassword: false };
      
      // Update in "DB"
      const idx = this._users.findIndex(u => u.id === user.id);
      if (idx !== -1) this._users[idx] = updatedUser;

      this.currentUser.set(updatedUser);
      this.saveSession();
      this.router.navigate(['/dashboard']);
    }
  }

  skipPasswordChange() {
    const user = this.currentUser();
    if (user) {
      // We mark mustChangePassword as false so they are not prompted again for this "Demo" context
      // In a strict security env, we might not update this flag, just navigate.
      const updatedUser = { ...user, mustChangePassword: false };
      
      const idx = this._users.findIndex(u => u.id === user.id);
      if (idx !== -1) this._users[idx] = updatedUser;

      this.currentUser.set(updatedUser);
      this.saveSession();
      this.router.navigate(['/dashboard']);
    }
  }

  private saveSession() {
    localStorage.setItem('ecoGestUser', JSON.stringify(this.currentUser()));
  }

  getUsers() {
    return this._users;
  }
}