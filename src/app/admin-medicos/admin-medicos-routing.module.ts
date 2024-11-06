import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminMedicosPage } from './admin-medicos.page';

const routes: Routes = [
  {
    path: '',
    component: AdminMedicosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminMedicosPageRoutingModule {}
