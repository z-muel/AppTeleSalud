import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteDBConnection, SQLiteConnection } from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root'
})
export class SQLiteService {
  private sqliteConnection: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;

  constructor() {
    this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
    this.initializeDatabase();
  }

  // Inicializar la base de datos
  async initializeDatabase() {
    if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
      await this.createConnection();
      await this.createTables();
    } else {
      console.warn('SQLite solo está disponible en dispositivos nativos.');
    }
  }

  // Crear conexión con la base de datos
  async createConnection() {
    try {
      this.db = await this.sqliteConnection.createConnection('app_db', false, 'no-encryption', 1, false);
      await this.db.open();
      console.log('Conexión a la base de datos SQLite establecida.');
    } catch (error) {
      console.error('Error al establecer la conexión a SQLite:', error);
    }
  }

  // Crear tablas basadas en el esquema
  async createTables() {
    if (this.db) {
      const sqlQueries = [
        `CREATE TABLE IF NOT EXISTS ESPECIALIDADES (ID INTEGER PRIMARY KEY AUTOINCREMENT, NOMBRE TEXT, DESCRIPCION TEXT, FECHAREGISTRO TEXT, FECHAMODIFICACION TEXT, USUARIOREGISTRO TEXT, USUARIOMODIFICACION TEXT, ACTIVO INTEGER DEFAULT 1);`,
        `CREATE TABLE IF NOT EXISTS MEDICOS (ID INTEGER PRIMARY KEY AUTOINCREMENT, NOMBRES TEXT, APELLIDOS TEXT, RUT TEXT UNIQUE, DIRECCION TEXT, CORREO TEXT, TELEFONO TEXT, SEXO TEXT, NUMCOLEGIATURA TEXT, FECHANACIMIENTO TEXT, FECHAREGISTRO TEXT, FECHAMODIFICACION TEXT, USUARIOREGISTRO TEXT, USUARIOMODIFICACION TEXT, ACTIVO INTEGER DEFAULT 1);`,
        `CREATE TABLE IF NOT EXISTS PACIENTES (ID INTEGER PRIMARY KEY AUTOINCREMENT, NOMBRES TEXT, APELLIDOS TEXT, RUT TEXT UNIQUE, DIRECCION TEXT, TELEFONO TEXT, SEXO TEXT, FECHANACIMIENTO TEXT, FECHAREGISTRO TEXT, FECHAMODIFICACION TEXT, USUARIOREGISTRO TEXT, USUARIOMODIFICACION TEXT, ACTIVO INTEGER DEFAULT 1);`,
        `CREATE TABLE IF NOT EXISTS CITAS (ID INTEGER PRIMARY KEY AUTOINCREMENT, MEDICOID INTEGER, PACIENTEID INTEGER, FECHAATENCION TEXT, INICIOATENCION TEXT, FINATENCION TEXT, ESTADO TEXT, OBSERVACIONES TEXT, ACTIVO INTEGER DEFAULT 1, FECHAREGISTRO TEXT, USUARIOREGISTRO TEXT, FECHAMODIFICACION TEXT, USUARIOMODIFICACION TEXT, FOREIGN KEY (MEDICOID) REFERENCES MEDICOS(ID), FOREIGN KEY (PACIENTEID) REFERENCES PACIENTES(ID));`
      ];

      for (const query of sqlQueries) {
        await this.db.execute(query);
      }
      console.log('Tablas creadas correctamente en SQLite.');
    }
  }

  // CRUD Ejemplo para Usuarios
  async addUser(user: any) {
    if (this.db) {
      const query = `INSERT INTO PACIENTES (NOMBRES, APELLIDOS, RUT, DIRECCION, TELEFONO, SEXO, FECHANACIMIENTO, ACTIVO) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      const values = [user.nombres, user.apellidos, user.rut, user.direccion, user.telefono, user.sexo, user.fechaNacimiento, 1];
      await this.db.run(query, values);
    }
  }

  async getAllUsers() {
    if (this.db) {
      const query = `SELECT * FROM PACIENTES WHERE ACTIVO = 1`;
      const res = await this.db.query(query);
      return res.values ? res.values : [];
    }
    return [];
  }

  async deleteUser(id: number) {
    if (this.db) {
      const query = `DELETE FROM PACIENTES WHERE ID = ?`;
      await this.db.run(query, [id]);
    }
  }

  // Cerrar conexión con SQLite
  async closeConnection() {
    if (this.db) {
      await this.sqliteConnection.closeConnection('app_db');
      console.log('Conexión a la base de datos SQLite cerrada.');
    }
  }
}
