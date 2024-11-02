import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private dbInstance: SQLiteObject | null = null;
  readonly dbName: string = 'app_db';
  readonly userTable: string = 'usuarios';

  constructor(private sqlite: SQLite) {
    this.initializeDatabase();
  }

  async initializeDatabase(): Promise<void> {
    try {
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
    const sql = `
      CREATE TABLE IF NOT EXISTS ${this.userTable} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rut TEXT UNIQUE,
        nombreCompleto TEXT,
        direccion TEXT,
        telefono TEXT,
        email TEXT,
        fechaNacimiento TEXT,
        contrasena TEXT
      )`;
    try {
      await this.dbInstance.executeSql(sql, []);
    } catch (error) {
      console.error('Error al crear la tabla de usuarios:', error);
    }
  }

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
    const sql = `INSERT INTO ${this.userTable} (rut, nombreCompleto, direccion, telefono, email, fechaNacimiento, contrasena) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const data = [
      rut,
      nombreCompleto,
      direccion,
      telefono,
      email,
      fechaNacimiento,
      contrasena
    ];
    try {
      await this.dbInstance.executeSql(sql, data);
      return true;
    } catch (error) {
      console.error('Error al agregar usuario:', error);
      return false;
    }
  }

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
      console.error('Error al obtener usuarios:', error);
      return [];
    }
  }

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
      console.error('Error al verificar si el usuario existe:', error);
      return false;
    }
  }
}
