import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmacyMedicalPrescriptionsComponent } from './pharmacy-medical-prescriptions.component';

describe('PharmacyMedicalPrescriptionsComponent', () => {
  let component: PharmacyMedicalPrescriptionsComponent;
  let fixture: ComponentFixture<PharmacyMedicalPrescriptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PharmacyMedicalPrescriptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PharmacyMedicalPrescriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
