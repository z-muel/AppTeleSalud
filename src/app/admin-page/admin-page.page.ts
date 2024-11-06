import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.page.html',
  styleUrls: ['./admin-page.page.scss'],
})
export class AdminPage implements OnInit {
  usuarios: any[] = [];

  constructor(private databaseService: DatabaseService) {}

  ngOnInit() {
    this.loadUsuarios();
  }

  async loadUsuarios() {
    this.usuarios = await this.databaseService.getAllUsers();
  }

  async deactivateUser(rut: string) {
    await this.databaseService.updateUserStatus(rut, 0);
    this.loadUsuarios();
  }

  async activateUser(rut: string) {
    await this.databaseService.updateUserStatus(rut, 1);
    this.loadUsuarios();
  }

  async deleteUser(rut: string) {
    await this.databaseService.deleteUser(rut);
    this.loadUsuarios();
  }
}
