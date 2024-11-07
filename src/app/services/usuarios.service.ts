import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  id?: number;
  rut: string;
  nombreCompleto: string;
  direccion: string;
  telefono: string;
  email: string;
  fechaNacimiento: string;
  contrasena: string;
  activo: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = 'http://localhost:3000/usuarios'; // URL de tu servidor JSON o API REST

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  addUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  updateUsuario(rut: string, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${rut}`, usuario);
  }

  deleteUsuario(rut: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${rut}`);
  }
}
