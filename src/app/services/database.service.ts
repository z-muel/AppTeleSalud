import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private dbInstance: SQLiteObject | null = null;
  readonly dbName: string = 'app_db';
  readonly userTable: string = 'usuarios';
  readonly serverUrl: string = 'http://localhost:3000/usuarios'; // URL de json-server

  constructor(private sqlite: SQLite, private platform: Platform, private http: HttpClient) {
    this.platform.ready().then(() => {
      this.initializeDatabase();
    });
  }

  // Inicializa la base de datos SQLite
  async initializeDatabase(): Promise<void> {
    if (!this.platform.is('cordova') && !this.platform.is('capacitor')) {
      console.warn('SQLite no está disponible en el navegador. Usando LocalStorage.');
      return;
    }

    try {
      console.log('Inicializando la base de datos...');
      this.dbInstance = await this.sqlite.create({
        name: this.dbName,
        location: 'default'
      });
      await this.createTables();
    } catch (error) {
      console.error('Error al inicializar la base de datos:', error);
    }
  }

  // Crear tablas en SQLite
  async createTables(): Promise<void> {
    if (!this.dbInstance) {
      console.error('Database not initialized!');
      return;
    }
    const sql = `
      CREATE TABLE IF NOT EXISTS ${this.userTable} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rut TEXT UNIQUE,
        nombreCompleto TEXT,
        direccion TEXT,
        telefono TEXT,
        email TEXT,
        fechaNacimiento TEXT,
        contrasena TEXT,
        activo INTEGER DEFAULT 1 
      )`;
    try {
      console.log('Creando la tabla de usuarios...');
      await this.dbInstance.executeSql(sql, []);
    } catch (error) {
      console.error('Error al crear la tabla de usuarios:', error);
    }
  }

  // Agregar usuario localmente en SQLite
  async addUser(
    rut: string,
    nombreCompleto: string,
    direccion: string,
    telefono: string,
    email: string,
    fechaNacimiento: string,
    contrasena: string
  ): Promise<boolean> {
    if (!this.dbInstance) {
      console.error('Database not initialized!');
      return false;
    }
    const sql = `INSERT INTO ${this.userTable} (rut, nombreCompleto, direccion, telefono, email, fechaNacimiento, contrasena, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const data = [rut, nombreCompleto, direccion, telefono, email, fechaNacimiento, contrasena, 1];
    try {
      console.log('Añadiendo usuario en SQLite:', data);
      await this.dbInstance.executeSql(sql, data);
      return true;
    } catch (error) {
      console.error('Error al agregar usuario en SQLite:', error);
      return false;
    }
  }

  // Obtener todos los usuarios en SQLite
  async getAllUsers(): Promise<any[]> {
    if (!this.dbInstance) {
      console.error('Database not initialized!');
      return [];
    }
    const sql = `SELECT * FROM ${this.userTable}`;
    try {
      const res = await this.dbInstance.executeSql(sql, []);
      const users = [];
      for (let i = 0; i < res.rows.length; i++) {
        users.push(res.rows.item(i));
      }
      return users;
    } catch (error) {
      console.error('Error al obtener usuarios de SQLite:', error);
      return [];
    }
  }

  // Verificar si un usuario existe en SQLite
  async checkUserExists(rut: string): Promise<boolean> {
    if (!this.dbInstance) {
      console.error('Database not initialized!');
      return false;
    }
    const sql = `SELECT * FROM ${this.userTable} WHERE rut = ?`;
    try {
      const res = await this.dbInstance.executeSql(sql, [rut]);
      return res.rows.length > 0;
    } catch (error) {
      console.error('Error al verificar si el usuario existe en SQLite:', error);
      return false;
    }
  }

  // Sincronizar usuarios con el servidor y eliminar de SQLite si ya fueron enviados
  async syncUsersWithServer(): Promise<void> {
    const users = await this.getAllUsers();
    if (users.length === 0) {
      console.log('No hay usuarios para sincronizar.');
      return;
    }

    const syncTasks = users.map(user =>
      this.http.post(this.serverUrl, user).pipe(
        catchError(error => {
          console.error('Error al enviar usuario al servidor:', error);
          return of(null);
        })
      ).toPromise()
    );

    const results = await Promise.all(syncTasks);
    const successfulSyncs = results.filter(result => result !== null);

    // Eliminar usuarios que se sincronizaron exitosamente de SQLite
    for (const user of successfulSyncs) {
      if (user && typeof user === 'object' && 'rut' in user) {
        await this.deleteUserFromSQLite((user as any).rut as string);
      }
    }
  }

  // Eliminar usuario de SQLite por RUT
  async deleteUserFromSQLite(rut: string): Promise<boolean> {
    if (!this.dbInstance) {
      console.error('Database not initialized!');
      return false;
    }
    const sql = `DELETE FROM ${this.userTable} WHERE rut = ?`;
    try {
      await this.dbInstance.executeSql(sql, [rut]);
      console.log(`Usuario con RUT ${rut} eliminado de SQLite después de sincronización.`);
      return true;
    } catch (error) {
      console.error('Error al eliminar usuario de SQLite:', error);
      return false;
    }
  }
}
