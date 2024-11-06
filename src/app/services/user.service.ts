import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private nombreUsuario: string = '';

  constructor() {
    // Recuperar el nombre de usuario al inicializar el servicio
    const nombreGuardado = localStorage.getItem('nombreUsuario');
    if (nombreGuardado) {
      this.nombreUsuario = nombreGuardado;
    }
  }

  setNombreUsuario(nombre: string) {
    this.nombreUsuario = nombre;
    localStorage.setItem('nombreUsuario', nombre); // Guardar en localStorage
  }

  getNombreUsuario(): string {
    return this.nombreUsuario;
  }

  clearNombreUsuario() {
    this.nombreUsuario = '';
    localStorage.removeItem('nombreUsuario'); // Limpiar de localStorage
  }
}
