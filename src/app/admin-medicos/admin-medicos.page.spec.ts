import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminMedicosPage } from './admin-medicos.page';

describe('AdminMedicosPage', () => {
  let component: AdminMedicosPage;
  let fixture: ComponentFixture<AdminMedicosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminMedicosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
