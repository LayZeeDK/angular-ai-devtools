import { TestBed } from '@angular/core/testing';
import { N1UpdateCauseComponent } from './n1-update-cause.component';
import { UpdateCauseService } from './n1-update-cause.service';
import { ExtensionMessageService } from './extension-message.service';

describe('N1UpdateCauseComponent', () => {
  it('renders not-supported state', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [N1UpdateCauseComponent],
    }).createComponent(N1UpdateCauseComponent);
    const ext = TestBed.inject(ExtensionMessageService);
    ext.notSupported.set(true);
    ext.notSupportedReason.set('no profiler');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('not supported');
  });
});
