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

  private async ensureDatabaseInitialized(): Promise<void> {
    if (!this.dbInstance) {
      await this.initializeDatabase();
    }
  }

  async initializeDatabase(): Promise<void> {
    if (this.dbInstance) {
      return; // Evita la inicialización duplicada
    }

    try {
      console.log('Inicializando la base de datos...');
      this.dbInstance = await this.sqlite.create({
        name: this.dbName,
        location: 'default'
      });
      await this.createTables();
      await this.createDefaultAdminUser(); // Crear usuario administrador si no existe
      console.log('Base de datos inicializada correctamente.');
    } catch (error) {
      console.error('Error al inicializar la base de datos:', error);
    }
  }

  async createTables(): Promise<void> {
    await this.ensureDatabaseInitialized();

    // Crear tabla de usuarios
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

    // Crear tabla de médicos
    const doctorTableSql = `
      CREATE TABLE IF NOT EXISTS ${this.doctorTable} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rut TEXT UNIQUE,
        nombres TEXT,
        apellidos TEXT,
        especialidad TEXT,
        areaSalud TEXT,
        telefono TEXT,
        correo TEXT,
        activo INTEGER DEFAULT 1 
      )`;

    try {
      console.log('Creando tablas de usuarios y médicos...');
      await this.dbInstance?.executeSql(userTableSql, []);
      await this.dbInstance?.executeSql(doctorTableSql, []);
    } catch (error) {
      console.error('Error al crear las tablas:', error);
    }
  }

  async createDefaultAdminUser(): Promise<void> {
    const adminRut = 'adminRut'; // Reemplaza con el RUT deseado para el administrador
    const adminUser = await this.getUserByRut(adminRut);

    if (!adminUser) {
      const adminData = {
        rut: adminRut,
        nombreCompleto: 'Administrador',
        direccion: 'Oficina Principal',
        telefono: '123456789',
        email: 'admin@ejemplo.com',
        fechaNacimiento: '2000-01-01',
        contrasena: 'AdminPassword123#',
        activo: 1
      };

      const success = await this.addUser(adminData);
      if (success) {
        console.log('Usuario administrador creado exitosamente.');
      } else {
        console.error('Error al crear el usuario administrador.');
      }
    } else {
      console.log('El usuario administrador ya existe.');
    }
  }

  // Métodos CRUD para usuarios
  async getAllUsers(): Promise<any[]> {
    await this.ensureDatabaseInitialized();
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

  async updateUserStatus(rut: string, activo: number): Promise<boolean> {
    await this.ensureDatabaseInitialized();
    if (!this.dbInstance) {
      console.error('Database not initialized!');
      return false;
    }
    const sql = `UPDATE ${this.userTable} SET activo = ? WHERE rut = ?`;
    try {
      await this.dbInstance.executeSql(sql, [activo, rut]);
      console.log(`Usuario con RUT ${rut} actualizado a estado ${activo}`);
      return true;
    } catch (error) {
      console.error('Error al actualizar el estado del usuario:', error);
      return false;
    }
  }

  async deleteUser(rut: string): Promise<boolean> {
    await this.ensureDatabaseInitialized();
    if (!this.dbInstance) {
      console.error('Database not initialized!');
      return false;
    }
    const sql = `DELETE FROM ${this.userTable} WHERE rut = ?`;
    try {
      await this.dbInstance.executeSql(sql, [rut]);
      console.log(`Usuario con RUT ${rut} eliminado exitosamente`);
      return true;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      return false;
    }
  }

  async checkUserExists(rut: string): Promise<boolean> {
    await this.ensureDatabaseInitialized();
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

  async addUser(user: any): Promise<boolean> {
    await this.ensureDatabaseInitialized();
    if (!this.dbInstance) {
      console.error('Database not initialized!');
      return false;
    }
    const sql = `INSERT INTO ${this.userTable} (rut, nombreCompleto, direccion, telefono, email, fechaNacimiento, contrasena, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const data = [
      user.rut,
      user.nombreCompleto,
      user.direccion,
      user.telefono,
      user.email,
      user.fechaNacimiento,
      user.contrasena,
      1
    ];
    try {
      await this.dbInstance.executeSql(sql, data);
      console.log('Usuario añadido exitosamente');
      return true;
    } catch (error) {
      console.error('Error al agregar usuario:', error);
      return false;
    }
  }

  async getUserByRut(rut: string): Promise<any | null> {
    await this.ensureDatabaseInitialized();
    if (!this.dbInstance) {
      console.error('Database not initialized!');
      return null;
    }
    const sql = `SELECT * FROM ${this.userTable} WHERE rut = ?`;
    try {
      const res = await this.dbInstance.executeSql(sql, [rut]);
      return res.rows.length > 0 ? res.rows.item(0) : null;
    } catch (error) {
      console.error('Error al obtener usuario por RUT:', error);
      return null;
    }
  }

  // Métodos CRUD para médicos
  async getAllDoctors(): Promise<any[]> {
    await this.ensureDatabaseInitialized();
    if (!this.dbInstance) {
      console.error('Database not initialized!');
      return [];
    }
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

  async addDoctor(doctor: any): Promise<boolean> {
    await this.ensureDatabaseInitialized();
    if (!this.dbInstance) {
      console.error('Database not initialized!');
      return false;
    }
    const sql = `INSERT INTO ${this.doctorTable} (rut, nombres, apellidos, especialidad, areaSalud, telefono, correo, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const data = [
      doctor.rut,
      doctor.nombres,
      doctor.apellidos,
      doctor.especialidad,
      doctor.areaSalud,
      doctor.telefono,
      doctor.correo,
      1
    ];
    try {
      await this.dbInstance.executeSql(sql, data);
      console.log('Médico añadido exitosamente');
      return true;
    } catch (error) {
      console.error('Error al agregar médico:', error);
      return false;
    }
  }

  async updateDoctor(rut: string, doctor: any): Promise<boolean> {
    await this.ensureDatabaseInitialized();
    if (!this.dbInstance) {
      console.error('Database not initialized!');
      return false;
    }
    const sql = `UPDATE ${this.doctorTable} SET nombres = ?, apellidos = ?, especialidad = ?, areaSalud = ?, telefono = ?, correo = ?, activo = ? WHERE rut = ?`;
    const data = [
      doctor.nombres,
      doctor.apellidos,
      doctor.especialidad,
      doctor.areaSalud,
      doctor.telefono,
      doctor.correo,
      doctor.activo,
      rut
    ];
    try {
      await this.dbInstance.executeSql(sql, data);
      console.log('Médico actualizado exitosamente');
      return true;
    } catch (error) {
      console.error('Error al actualizar médico:', error);
      return false;
    }
  }

  async deleteDoctor(rut: string): Promise<boolean> {
    await this.ensureDatabaseInitialized();
    if (!this.dbInstance) {
      console.error('Database not initialized!');
      return false;
    }
    const sql = `DELETE FROM ${this.doctorTable} WHERE rut = ?`;
    try {
      await this.dbInstance.executeSql(sql, [rut]);
      console.log(`Médico con RUT ${rut} eliminado exitosamente`);
      return true;
    } catch (error) {
      console.error('Error al eliminar médico:', error);
      return false;
    }
  }
}
