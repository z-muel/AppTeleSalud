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
    const user = await this.dbService.getUserByRut(rut);
    if (user && user.contrasena === password && user.activo === 1) {
      this.isAuthenticated = true;
      this.isAdmin = rut === 'adminRut';  // Cambia 'adminRut' por el RUT del administrador
      return true;
    }
    this.isAuthenticated = false;
    return false;
  }

  logout() {
    this.isAuthenticated = false;
    this.router.navigate(['/login']);
  }

  isAuthenticatedUser() {
    return this.isAuthenticated;
  }
}
