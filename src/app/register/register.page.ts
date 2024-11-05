import { Component } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';
import { UsuariosService } from '../services/usuarios.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-registro',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  rut: string = '';
  nombreCompleto: string = '';
  direccion: string = '';
  telefono: string = '';
  email: string = '';
  fechaNacimiento: string = '';
  contrasena: string = '';
  recontrasena: string = '';
  rutError: string = '';
  nombreCompletoError: string = '';
  direccionError: string = '';
  telefonoError: string = '';
  emailError: string = '';
  fechaError: string = '';
  contrasenaError: string = '';
  error: string = '';
  mostrarContrasena: boolean = false;
  mostrarRecontrasena: boolean = false;

  constructor(
    private navCtrl: NavController,
    private toastController: ToastController,
    private dbService: DatabaseService,
    private usuariosService: UsuariosService
  ) {}

  async enviarRegistro() {
    this.rutError = '';
    this.nombreCompletoError = '';
    this.direccionError = '';
    this.telefonoError = '';
    this.emailError = '';
    this.fechaError = '';
    this.contrasenaError = '';
    this.error = '';

    if (
      this.error || this.rutError || this.nombreCompletoError || this.direccionError || 
      this.telefonoError || this.emailError || this.fechaError || this.contrasenaError
    ) {
      return;
    }

    try {
      const userExistsInSQLite = await this.dbService.checkUserExists(this.rut);
      const userExistsInJSONServer = await firstValueFrom(this.usuariosService.checkUserExists(this.rut));

      if (userExistsInSQLite || userExistsInJSONServer) {
        this.rutError = 'El usuario ya existe.';
        return;
      }

      const usuarioGuardado = await this.dbService.addUser(
        this.rut,
        this.nombreCompleto,
        this.direccion,
        this.telefono,
        this.email,
        this.fechaNacimiento,
        this.contrasena
      );

      if (!usuarioGuardado) {
        this.error = 'Error al registrar usuario localmente.';
        console.error('Error al registrar usuario localmente.');
        return;
      }

      this.usuariosService.addUsuario({
        rut: this.rut,
        nombreCompleto: this.nombreCompleto,
        direccion: this.direccion,
        telefono: this.telefono,
        email: this.email,
        fechaNacimiento: this.fechaNacimiento,
        contrasena: this.contrasena,
        activo: 1
      }).subscribe({
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
    } catch (error) {
      console.error('Error en el proceso de registro:', error);
      this.error = 'Ocurrió un problema durante el registro.';
    }
  }

  async mostrarUsuariosGuardados() {
    const usuarios = await this.dbService.getAllUsers();
    console.log('Usuarios guardados en la base de datos:', usuarios);
  }

  validarFormatoEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
  }

  toggleMostrarClave() {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  toggleMostrarReclave() {
    this.mostrarRecontrasena = !this.mostrarRecontrasena;
  }
}
