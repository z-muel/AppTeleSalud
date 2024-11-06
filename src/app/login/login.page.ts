import { Component } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { Router, NavigationExtras } from '@angular/router';
import { AuthService } from 'src/app/services/auth-service.service';
import { Storage } from '@ionic/storage-angular';
import { UserService } from '../services/user.service';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  errorMessages: string[] = [];
  rut: string = ''; // Cambiado de username a rut
  password: string = '';
  usernameErrorL: string = '';
  passwordErrorL: string = '';

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private toastCtrl: ToastController,
    private authService: AuthService,
    private storage: Storage,
    private userService: UserService
  ) {}

  async login() {
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*]).{8,}$/;
    const rutPattern = /^[0-9]+-[0-9kK]{1}$/; // Patrón para validar formato de RUT

    if (!rutPattern.test(this.rut)) { // Validación de RUT
      this.usernameErrorL = 'El RUT no es válido. Formato esperado: 12345678-9';
      return;
    } else {
      this.usernameErrorL = '';
    }

    if (!passwordPattern.test(this.password)) {
      this.passwordErrorL = 'La contraseña debe cumplir con los requisitos.';
      return;
    } else {
      this.passwordErrorL = '';
    }

    try {
      const isAuthenticated = await this.authService.authenticate(this.rut, this.password);

      if (isAuthenticated) {
        await this.storage.set('loggedInUser', this.rut);

        this.getCurrentLocation();

        const navigationExtras: NavigationExtras = {
          state: {
            rut: this.rut
          }
        };

        // Verificar si es un administrador
        if (this.authService.isAdminUser()) {
          this.router.navigate(['/admin-page'], navigationExtras); // Redirigir a la página de administración
        } else {
          this.router.navigate(['/main'], navigationExtras); // Redirigir a la página principal
        }
      } else {
        this.showToast('Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error en la autenticación:', error);
      this.showToast('Hubo un error al iniciar sesión. Inténtalo de nuevo.');
    }
  }

  async getCurrentLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      console.log('Ubicación actual:', coordinates);

      const { latitude, longitude } = coordinates.coords;
      console.log(`Latitud: ${latitude}, Longitud: ${longitude}`);

      await this.storage.set('userLocation', { latitude, longitude });
    } catch (error) {
      console.error('Error al obtener la ubicación:', error);
      this.showToast('No se pudo obtener la ubicación');
    }
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'top',
    });
    await toast.present();
  }

  crearCuenta() {
    this.showToast('Crea tu cuenta gratis ahora mismo.');
    this.router.navigate(['/register']);
  }

  olvidasteContrasena() {
    this.navCtrl.navigateForward(['/resetpass']);
  }
}
