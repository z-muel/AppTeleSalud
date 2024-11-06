import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminMedicosPageRoutingModule } from './admin-medicos-routing.module';

import { AdminMedicosPage } from './admin-medicos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminMedicosPageRoutingModule
  ],
  declarations: [AdminMedicosPage]
})
export class AdminMedicosPageModule {}
