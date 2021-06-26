import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPharmaciesComponent } from './admin-pharmacies.component';

describe('AdminPharmaciesComponent', () => {
  let component: AdminPharmaciesComponent;
  let fixture: ComponentFixture<AdminPharmaciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminPharmaciesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminPharmaciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
