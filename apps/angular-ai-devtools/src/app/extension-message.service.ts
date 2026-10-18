import { Injectable, inject } from '@angular/core';
import { UpdateCauseService } from './n1-update-cause.service';

interface ExtensionMessage {
  type?: string;
  version?: string;
  capability?: { availability?: string };
}

@Injectable({ providedIn: 'root' })
export class ExtensionMessageService {
  private readonly causeService = inject(UpdateCauseService);

  constructor() {
    const runtime = (globalThis as { chrome?: { runtime?: { onMessage?: { addListener: (cb: (msg: unknown) => void) => void } } } }).chrome?.runtime;
    if (runtime?.onMessage) {
      runtime.onMessage.addListener((msg: unknown) => {
        this.handleMessage(msg as ExtensionMessage);
      });
    }
  }

  private handleMessage(msg: ExtensionMessage) {
    if (msg.type === 'angular-detected') {
      this.causeService.record('Angular', `v${msg.version ?? '?'} detected`);
    } else if (msg.type === 'host:capability') {
      const info = msg.capability?.availability
        ? `availability: ${msg.capability.availability}`
        : 'capability announced';
      this.causeService.record('Prompt API', info);
    }
  }
}
