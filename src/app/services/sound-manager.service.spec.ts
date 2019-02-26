import { TestBed } from '@angular/core/testing';

import { SoundManagerService } from './sound-manager.service';

describe('SoundManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SoundManagerService = TestBed.get(SoundManagerService);
    expect(service).toBeTruthy();
  });
});
