import { TestBed } from '@angular/core/testing';
import { N3DiDoctorComponent } from './n3-di-doctor.component';

describe('N3DiDoctorComponent', () => {
  it('creates', async () => {
    await TestBed.configureTestingModule({
      imports: [N3DiDoctorComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(N3DiDoctorComponent);
    expect(fixture).toBeTruthy();
  });
});
