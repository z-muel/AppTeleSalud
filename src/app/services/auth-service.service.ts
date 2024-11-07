import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  public isAdmin = false;

  constructor(private router: Router, private dbService: DatabaseService) {}

  async authenticate(rut: string, password: string): Promise<boolean> {
    try {
      const user = await this.dbService.getUserByRut(rut);
      if (user && user.contrasena === password && user.activo === 1) {
        this.isAuthenticated = true;
        this.isAdmin = user.isAdmin === 1; // Asegúrate de que los usuarios tengan esta propiedad en tu DB
        return true;
      }
    } catch (error) {
      console.error('Error al autenticar al usuario:', error);
    }
    this.isAuthenticated = false;
    return false;
  }

  logout() {
    this.isAuthenticated = false;
    this.isAdmin = false;
    this.router.navigate(['/login']);
  }

  isAuthenticatedUser(): boolean {
    return this.isAuthenticated;
  }

  isAdminUser(): boolean {
    return this.isAdmin;
  }
}
