import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecuritycodesComponent } from './securitycodes.component';

describe('SecuritycodesComponent', () => {
  let component: SecuritycodesComponent;
  let fixture: ComponentFixture<SecuritycodesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SecuritycodesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SecuritycodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
