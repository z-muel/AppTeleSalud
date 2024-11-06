import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SQLiteService } from './sqlite.service';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private jsonServerUrl = 'http://localhost:3000'; // URL de tu json-server

  constructor(private http: HttpClient, private sqliteService: SQLiteService) {}

  async syncUsers() {
    const users = await this.sqliteService.getAllUsers();
    for (const user of users) {
      try {
        await this.http.post(`${this.jsonServerUrl}/users`, user).toPromise();
        await this.sqliteService.deleteUser(user.id); // Eliminar el usuario de SQLite
        console.log(`Usuario ${user.id} sincronizado y eliminado de SQLite.`);
      } catch (error) {
        console.error('Error al sincronizar usuario:', error);
      }
    }
  }

  // Métodos adicionales para sincronizar médicos, citas, etc., de forma similar
}
