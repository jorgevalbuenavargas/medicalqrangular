import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorUicComponent } from './doctor-uic.component';

describe('DoctorUicComponent', () => {
  let component: DoctorUicComponent;
  let fixture: ComponentFixture<DoctorUicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoctorUicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorUicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
