import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Medico {
  id?: number;
  nombres: string;
  apellidos: string;
  rut: string;
  direccion: string;
  correo: string;
  telefono: string;
  sexo: string;
  numColegiatura: string;
  fechaNacimiento: string;
  activo: number;
}

@Injectable({
  providedIn: 'root'
})
export class MedicosService {
  private apiUrl = 'http://localhost:3000/medicos';

  constructor(private http: HttpClient) {}

  // Obtener todos los médicos
  getMedicos(): Observable<Medico[]> {
    return this.http.get<Medico[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // Agregar un nuevo médico
  addMedico(medico: Medico): Observable<Medico> {
    return this.http.post<Medico>(this.apiUrl, medico).pipe(
      catchError(this.handleError)
    );
  }

  // Actualizar un médico existente
  updateMedico(id: number, medico: Medico): Observable<Medico> {
    return this.http.put<Medico>(`${this.apiUrl}/${id}`, medico).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar un médico
  deleteMedico(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Manejo de errores
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Ocurrió un error:', error);
    // Aquí puedes personalizar mensajes de error más específicos para tu aplicación.
    return throwError('Algo salió mal; por favor, inténtalo de nuevo más tarde.');
  }
}
