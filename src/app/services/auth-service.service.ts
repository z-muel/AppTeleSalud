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

        // Verifica si el usuario es administrador basado en un RUT o una propiedad
        this.isAdmin = user.isAdmin === 1;  // Considera agregar la propiedad 'isAdmin' a la tabla de usuarios

        return true;
      } else {
        // Agregar mensajes de error detallados (opcional)
        console.error('Autenticación fallida: credenciales incorrectas o usuario inactivo.');
      }
    } catch (error) {
      console.error('Error al autenticar al usuario:', error);
    }

    this.isAuthenticated = false;
    return false;
  }

  logout() {
    this.isAuthenticated = false;
    this.isAdmin = false;  // Reiniciar el estado de administrador
    this.router.navigate(['/login']);
  }

  isAuthenticatedUser(): boolean {
    return this.isAuthenticated;
  }

  isAdminUser(): boolean {
    return this.isAdmin;
  }
}
