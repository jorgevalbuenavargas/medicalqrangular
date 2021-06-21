import { TestBed } from '@angular/core/testing';

import { PharmacyDataService } from './pharmacy-data.service';

describe('PharmacyDataService', () => {
  let service: PharmacyDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PharmacyDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
