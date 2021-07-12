import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMedicalreceiptsComponent } from './admin-medicalreceipts.component';

describe('AdminMedicalreceiptsComponent', () => {
  let component: AdminMedicalreceiptsComponent;
  let fixture: ComponentFixture<AdminMedicalreceiptsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminMedicalreceiptsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminMedicalreceiptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
