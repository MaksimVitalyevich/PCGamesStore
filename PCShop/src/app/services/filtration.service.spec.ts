import { TestBed } from '@angular/core/testing';

import { FiltrationService } from './filtration.service';

describe('FiltrationService', () => {
  let service: FiltrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FiltrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
