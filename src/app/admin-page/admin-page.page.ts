import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.page.html',
  styleUrls: ['./admin-page.page.scss'],
})
export class AdminPage implements OnInit {
  usuarios: any[] = [];
  isLoading: boolean = false;

  constructor(
    private databaseService: DatabaseService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadUsuarios();
  }

  async loadUsuarios() {
    this.isLoading = true;
    try {
      this.usuarios = await this.databaseService.getAllUsers();
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      this.showToast('Error al cargar usuarios');
    } finally {
      this.isLoading = false;
    }
  }

  async deactivateUser(rut: string) {
    try {
      await this.databaseService.updateUserStatus(rut, 0);
      this.showToast('Usuario desactivado exitosamente');
      this.loadUsuarios();
    } catch (error) {
      console.error('Error al desactivar usuario:', error);
      this.showToast('Error al desactivar usuario');
    }
  }

  async activateUser(rut: string) {
    try {
      await this.databaseService.updateUserStatus(rut, 1);
      this.showToast('Usuario activado exitosamente');
      this.loadUsuarios();
    } catch (error) {
      console.error('Error al activar usuario:', error);
      this.showToast('Error al activar usuario');
    }
  }

  async confirmDeleteUser(rut: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar al usuario con RUT ${rut}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.deleteUser(rut);
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteUser(rut: string) {
    try {
      await this.databaseService.deleteUser(rut);
      this.showToast('Usuario eliminado exitosamente');
      this.loadUsuarios();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      this.showToast('Error al eliminar usuario');
    }
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: 'primary',
    });
    toast.present();
  }
}
