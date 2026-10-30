import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import type { StaleViewFinding } from '../../../../src/main-world/stale-view-scan';

export interface WorkerScanResult {
  token: string;
  findings: StaleViewFinding[];
}

@Injectable({ providedIn: 'root' })
export class StaleViewScanService implements OnDestroy {
  private worker: Worker | null = null;
  private readonly latestToken = signal<string | null>(null);
  readonly findings = signal<StaleViewFinding[]>([]);
  readonly scanning = signal<boolean>(false);

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.terminateWorker());
      window.addEventListener('pagehide', () => this.terminateWorker());
    }
  }

  private ensureWorker(): Worker | null {
    if (this.worker) return this.worker;
    try {
      const chromeObj = (globalThis as { chrome?: { runtime?: { getURL?: (p: string) => string } } }).chrome;
      const url = chromeObj?.runtime?.getURL
        ? chromeObj.runtime.getURL('stale-view-worker.js')
        : '../stale-view-worker.js';
      const w = new Worker(url);
      w.onmessage = (ev: MessageEvent) => this.handleResult(ev.data as WorkerScanResult);
      w.onerror = () => {
        this.scanning.set(false);
      };
      this.worker = w;
      return w;
    } catch {
      return null;
    }
  }

  issueToken(): string {
    const token = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
      ? crypto.randomUUID()
      : `scan-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.latestToken.set(token);
    return token;
  }

  startScan(graph: unknown): string {
    const token = this.issueToken();
    this.scanning.set(true);
    const w = this.ensureWorker();
    if (w) {
      w.postMessage({ token, graph });
    } else {
      // No worker available: do not leave a dangling scan.
      this.scanning.set(false);
    }
    return token;
  }

  /** Supersede any in-flight scan by issuing a fresh token; the old result is discarded. */
  supersede(graph: unknown): string {
    return this.startScan(graph);
  }

  private handleResult(result: WorkerScanResult | null | undefined): void {
    if (!result || typeof result.token !== 'string') {
      this.scanning.set(false);
      return;
    }
    // Discard stale results whose token is not the latest issued.
    if (result.token !== this.latestToken()) {
      return;
    }
    this.findings.set(Array.isArray(result.findings) ? result.findings : []);
    this.scanning.set(false);
  }

  terminateWorker(): void {
    if (this.worker) {
      try { this.worker.terminate(); } catch { /* ignore */ }
      this.worker = null;
    }
    this.scanning.set(false);
  }

  ngOnDestroy(): void {
    this.terminateWorker();
  }
}
