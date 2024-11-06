import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-admin-medicos',
  templateUrl: './admin-medicos.page.html',
  styleUrls: ['./admin-medicos.page.scss'],
})
export class AdminMedicosPage implements OnInit {
  medicos: any[] = [];
  newMedico: any = {
    nombres: '',
    apellidos: '',
    rut: '',
    direccion: '',
    correo: '',
    telefono: '',
    especialidad: '',
    areaSalud: '',
    activo: 1,
  };
  isLoading: boolean = false;

  constructor(
    private databaseService: DatabaseService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadMedicos();
  }

  async loadMedicos() {
    this.isLoading = true;
    try {
      this.medicos = await this.databaseService.getAllDoctors();
    } catch (error) {
      console.error('Error al cargar médicos:', error);
      this.showToast('Error al cargar médicos');
    } finally {
      this.isLoading = false;
    }
  }

  async addMedico() {
    try {
      const success = await this.databaseService.addDoctor(this.newMedico);
      if (success) {
        this.showToast('Médico añadido exitosamente');
        this.loadMedicos();
        this.resetNewMedico();
      } else {
        this.showToast('Error al añadir el médico');
      }
    } catch (error) {
      console.error('Error al añadir médico:', error);
      this.showToast('Error al añadir el médico');
    }
  }

  async confirmDeleteMedico(rut: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar al médico con RUT ${rut}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.deleteMedico(rut);
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteMedico(rut: string) {
    try {
      const success = await this.databaseService.deleteDoctor(rut);
      if (success) {
        this.showToast('Médico eliminado exitosamente');
        this.loadMedicos();
      } else {
        this.showToast('Error al eliminar el médico');
      }
    } catch (error) {
      console.error('Error al eliminar médico:', error);
      this.showToast('Error al eliminar el médico');
    }
  }

  async updateMedico(medico: any) {
    try {
      const success = await this.databaseService.updateDoctor(medico.rut, medico);
      if (success) {
        this.showToast('Médico actualizado exitosamente');
        this.loadMedicos();
      } else {
        this.showToast('Error al actualizar el médico');
      }
    } catch (error) {
      console.error('Error al actualizar médico:', error);
      this.showToast('Error al actualizar el médico');
    }
  }

  resetNewMedico() {
    this.newMedico = {
      nombres: '',
      apellidos: '',
      rut: '',
      direccion: '',
      correo: '',
      telefono: '',
      especialidad: '',
      areaSalud: '',
      activo: 1,
    };
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
