import { Component, resource, signal } from '@angular/core';

/**
 * M036 measurement fixture.
 *
 * Four resources, one per state the resource-lifecycle explainer has to name.
 * The component exists to be *read*, not to look like a product page: each
 * resource is given a `debugName`, because that name is what the framework
 * turns into the signal graph labels `Resource#<debugName>.<field>`
 * (`@angular/core/fesm2022/_resource-chunk.mjs:514-517`).
 *
 * The four subjects:
 *
 * - `LoadingResource` — its request is stable and its loader returns a promise
 *   that never settles, so `status()` stays `loading` for the page's lifetime.
 * - `ResolvedResource` — its loader resolves on the next microtask, so
 *   `status()` settles to `resolved`.
 * - `ErroredResource` — its loader rejects, so `status()` settles to `error`
 *   and `error()` carries the rejection.
 * - `IdleResource` — idle by design. Its params expression reads
 *   `IdleSource`, a signal that stays `undefined` on this page, and returns
 *   `undefined` while it does; a request of `undefined` is what the state
 *   computation turns into `status: 'idle'` (`_resource-chunk.mjs:309`), so the
 *   loader is never called.
 *
 * The template reads `status()` off all four — plus `isLoading()`, `value()` and
 * `error()` where reading them is safe — because the signal graph is walked from
 * the component's template consumer outwards through *producers*: a signal the
 * template never reads contributes no node. `value()` is deliberately not read
 * on `ErroredResource`, where it throws (`_resource-chunk.mjs:229-234`).
 */
@Component({
  selector: 'app-resource-states',
  template: `<h2 id="resource-states-heading">resource states</h2>
    <p id="LoadingResource">
      LoadingResource: {{ LoadingResource.status() }} /
      loading={{ LoadingResource.isLoading() }} /
      value={{ LoadingResource.value() }}
    </p>
    <p id="ResolvedResource">
      ResolvedResource: {{ ResolvedResource.status() }} /
      loading={{ ResolvedResource.isLoading() }} /
      value={{ ResolvedResource.value() }}
    </p>
    <p id="ErroredResource">
      ErroredResource: {{ ErroredResource.status() }} /
      loading={{ ErroredResource.isLoading() }} /
      error={{ errorText(ErroredResource.error()) }}
    </p>
    <p id="IdleResource">
      IdleResource: {{ IdleResource.status() }} /
      loading={{ IdleResource.isLoading() }} /
      value={{ IdleResource.value() }}
    </p>`,
})
export class ResourceStates {
  /**
   * The loading subject's loader result. Nothing resolves or rejects it, so the
   * resource stays `loading` — the state the explainer exists to explain.
   */
  private readonly neverSettles = new Promise<never>(() => {});

  /** What `IdleResource`'s params expression reads. It stays `undefined`. */
  readonly IdleSource = signal<{ id: number } | undefined>(undefined);

  /** Stays `loading`: a request, and a loader that never answers. */
  readonly LoadingResource = resource({
    params: () => ({ id: 'loading' }),
    loader: () => this.neverSettles,
    debugName: 'LoadingResource',
  });

  /** Settles to `resolved` on the next microtask. */
  readonly ResolvedResource = resource({
    params: () => ({ id: 'resolved' }),
    loader: () => Promise.resolve('ResolvedResource value'),
    debugName: 'ResolvedResource',
  });

  /** Settles to `error`: the loader rejects. */
  readonly ErroredResource = resource({
    params: () => ({ id: 'errored' }),
    loader: () =>
      Promise.reject(new Error('ErroredResource loader rejected')),
    debugName: 'ErroredResource',
  });

  /**
   * Idle by design: the params expression returns `undefined` while
   * `IdleSource` is `undefined`, and `IdleSource` is never set.
   */
  readonly IdleResource = resource({
    params: () => {
      const source = this.IdleSource();
      return source ? { id: source.id } : undefined;
    },
    loader: () => Promise.resolve('IdleResource value, never requested'),
    debugName: 'IdleResource',
  });

  /** Renders an error's message; `value()` cannot be read for an errored resource. */
  errorText(error: Error | undefined): string {
    return error ? error.message : 'none';
  }
}
