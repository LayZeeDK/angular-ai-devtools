import { TestBed } from '@angular/core/testing';
import { ExtensionMessageService } from './extension-message.service';
import { UpdateCauseService } from './n1-update-cause.service';

const globalChrome = globalThis as unknown as { chrome?: unknown };

describe('ExtensionMessageService', () => {
  let deliver: (msg: unknown) => void;

  beforeEach(() => {
    globalChrome.chrome = {
      devtools: { inspectedWindow: { tabId: 5 } },
      runtime: {
        onMessage: {
          addListener(cb: (msg: unknown) => void): void {
            deliver = cb;
          },
        },
      },
    };
    TestBed.configureTestingModule({}).inject(ExtensionMessageService);
  });

  afterEach(() => {
    globalChrome.chrome = undefined;
  });

  it('records the Angular detection of the inspected tab and ignores other tabs', () => {
    const causes = TestBed.inject(UpdateCauseService);
    deliver({ type: 'angular-detected', version: '19.0.0', tabId: 6 });
    deliver({ type: 'angular-detected', version: '22.2.2', tabId: 5 });
    expect(causes.recorded().map((c) => c.reason)).toEqual(['v22.2.2 detected']);
  });
});
