import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';

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

  constructor(private databaseService: DatabaseService) {}

  ngOnInit() {
    this.loadMedicos();
  }

  async loadMedicos() {
    this.medicos = await this.databaseService.getAllDoctors();
  }

  async addMedico() {
    const success = await this.databaseService.addDoctor(this.newMedico);
    if (success) {
      this.loadMedicos();
      this.resetNewMedico();
    }
  }

  async updateMedico(medico: any) {
    const success = await this.databaseService.updateDoctor(medico.rut, medico);
    if (success) this.loadMedicos();
  }

  async deleteMedico(id: number) {
    const success = await this.databaseService.deleteDoctorById(id);
    if (success) this.loadMedicos();
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
}
