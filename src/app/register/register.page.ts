import { Component } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';
import { UsuariosService } from '../services/usuarios.service';

@Component({
  selector: 'app-registro',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  // Definición de los campos de usuario
  rut: string = '';
  nombreCompleto: string = '';
  direccion: string = '';
  telefono: string = '';
  email: string = '';
  fechaNacimiento: string = '';
  contrasena: string = '';
  recontrasena: string = '';

  // Definición de variables para errores
  rutError: string = '';
  nombreCompletoError: string = '';
  direccionError: string = '';
  telefonoError: string = '';
  emailError: string = '';
  fechaError: string = '';
  contrasenaError: string = '';
  error: string = '';

  // Control de visibilidad de las contraseñas
  mostrarContrasena: boolean = false;
  mostrarRecontrasena: boolean = false;

  constructor(
    private navCtrl: NavController,
    private toastController: ToastController,
    private dbService: DatabaseService,
    private usuariosService: UsuariosService // Inyecta el UsuariosService
  ) {}

  async enviarRegistro() {
    // Limpiar mensajes de error al inicio
    this.rutError = '';
    this.nombreCompletoError = '';
    this.direccionError = '';
    this.telefonoError = '';
    this.emailError = '';
    this.fechaError = '';
    this.contrasenaError = '';
    this.error = '';

    // Validaciones para cada campo
    // (aquí va la lógica de validación de cada campo como la tienes en tu código)

    if (
      this.error || this.rutError || this.nombreCompletoError || this.direccionError || 
      this.telefonoError || this.emailError || this.fechaError || this.contrasenaError
    ) {
      return;
    }

    const userExists = await this.dbService.checkUserExists(this.rut);
    if (userExists) {
      this.rutError = 'El usuario ya existe.';
      return;
    }

    // Crear objeto de usuario
    const newUser = {
      rut: this.rut,
      nombreCompleto: this.nombreCompleto,
      direccion: this.direccion,
      telefono: this.telefono,
      email: this.email,
      fechaNacimiento: this.fechaNacimiento,
      contrasena: this.contrasena,
      activo: 1 // Añadir la propiedad activo con valor predeterminado
    };

    // Almacenar el usuario en SQLite
    const usuarioGuardado = await this.dbService.addUser(newUser);

    if (!usuarioGuardado) {
      this.error = 'Error al registrar usuario localmente.';
      console.error('Error al registrar usuario localmente.');
      return;
    }

    // Almacenar el usuario en json-server usando UsuariosService
    this.usuariosService.addUsuario(newUser).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: 'Registro exitoso',
          duration: 2000,
          color: 'success',
        });
        toast.present();
        this.mostrarUsuariosGuardados();
        this.navCtrl.navigateForward('/login');
      },
      error: (err) => {
        this.error = 'Error al registrar usuario en el servidor.';
        console.error('Error al registrar usuario en el servidor:', err);
      }
    });
  }

  async mostrarUsuariosGuardados() {
    const usuarios = await this.dbService.getAllUsers();
    console.log('Usuarios guardados en la base de datos:', usuarios);
  }

  validarFormatoEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
  }

  // Funciones para mostrar/ocultar contraseñas
  toggleMostrarClave() {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  toggleMostrarReclave() {
    this.mostrarRecontrasena = !this.mostrarRecontrasena;
  }
}
