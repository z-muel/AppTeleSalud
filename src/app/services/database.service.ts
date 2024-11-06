import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private dbInstance: SQLiteObject | null = null;
  readonly dbName: string = 'app_db';
  readonly userTable: string = 'usuarios';
  readonly doctorTable: string = 'medicos';
  readonly jsonServerUrl: string = 'http://localhost:3000'; // URL de JSON-server

  constructor(private sqlite: SQLite, private http: HttpClient) {
    this.initializeDatabase();
  }

  async initializeDatabase(): Promise<void> {
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

  async createTables(): Promise<void> {
    if (!this.dbInstance) {
      console.error('Database not initialized!');
      return;
    }

    const userTableSql = `
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
    const doctorTableSql = `
      CREATE TABLE IF NOT EXISTS ${this.doctorTable} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rut TEXT UNIQUE,
        nombreCompleto TEXT,
        especialidad TEXT,
        areaSalud TEXT,
        telefono TEXT,
        email TEXT,
        activo INTEGER DEFAULT 1 
      )`;

    try {
      console.log('Creando tablas de usuarios y médicos...');
      await this.dbInstance.executeSql(userTableSql, []);
      await this.dbInstance.executeSql(doctorTableSql, []);
    } catch (error) {
      console.error('Error al crear las tablas:', error);
    }
  }

  // CRUD MÉTODOS PARA MÉDICOS
  async addDoctor(doctor: any): Promise<boolean> {
    if (!this.dbInstance) return false;
    const sql = `INSERT INTO ${this.doctorTable} (rut, nombreCompleto, especialidad, areaSalud, telefono, email, activo) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const data = [doctor.rut, doctor.nombreCompleto, doctor.especialidad, doctor.areaSalud, doctor.telefono, doctor.email, 1];
    try {
      await this.dbInstance.executeSql(sql, data);
      return true;
    } catch (error) {
      console.error('Error al agregar médico:', error);
      return false;
    }
  }

  async getAllDoctors(): Promise<any[]> {
    if (!this.dbInstance) return [];
    const sql = `SELECT * FROM ${this.doctorTable}`;
    try {
      const res = await this.dbInstance.executeSql(sql, []);
      const doctors = [];
      for (let i = 0; i < res.rows.length; i++) {
        doctors.push(res.rows.item(i));
      }
      return doctors;
    } catch (error) {
      console.error('Error al obtener médicos:', error);
      return [];
    }
  }

  async updateDoctor(rut: string, doctor: any): Promise<boolean> {
    if (!this.dbInstance) return false;
    const sql = `UPDATE ${this.doctorTable} SET nombreCompleto = ?, especialidad = ?, areaSalud = ?, telefono = ?, email = ?, activo = ? WHERE rut = ?`;
    const data = [doctor.nombreCompleto, doctor.especialidad, doctor.areaSalud, doctor.telefono, doctor.email, doctor.activo, rut];
    try {
      await this.dbInstance.executeSql(sql, data);
      return true;
    } catch (error) {
      console.error('Error al actualizar médico:', error);
      return false;
    }
  }

  async deleteDoctor(rut: string): Promise<boolean> {
    if (!this.dbInstance) return false;
    const sql = `DELETE FROM ${this.doctorTable} WHERE rut = ?`;
    try {
      await this.dbInstance.executeSql(sql, [rut]);
      return true;
    } catch (error) {
      console.error('Error al eliminar médico:', error);
      return false;
    }
  }

  // MÉTODO DE SINCRONIZACIÓN CON JSON-SERVER
  async syncWithJsonServer(): Promise<void> {
    if (!this.dbInstance) return;

    try {
      const users = await this.getAllUsers();
      const doctors = await this.getAllDoctors();

      // Sincronizar usuarios
      for (const user of users) {
        try {
          await lastValueFrom(this.http.post(`${this.jsonServerUrl}/usuarios`, user));
          await this.deleteUser(user.rut);
        } catch (error) {
          console.error('Error al sincronizar usuario:', error);
        }
      }

      // Sincronizar médicos
      for (const doctor of doctors) {
        try {
          await lastValueFrom(this.http.post(`${this.jsonServerUrl}/medicos`, doctor));
          await this.deleteDoctor(doctor.rut);
        } catch (error) {
          console.error('Error al sincronizar médico:', error);
        }
      }
    } catch (error) {
      console.error('Error al sincronizar con JSON-server:', error);
    }
  }

  // CRUD PARA USUARIOS (similar a médicos)
  async getAllUsers(): Promise<any[]> { /* Método para obtener todos los usuarios */ }
  async deleteUser(rut: string): Promise<boolean> { /* Método para eliminar usuario */ }
}
