# Angular preferences

- Modern Angular only: standalone components, signals and zoneless. NgZone/zone.js, NgModules (`RouterModule.forRoot`, `HttpClientModule`), class-based guards/resolvers/interceptors, template-driven and Reactive Forms, and `@angular/upgrade` hybrid apps count as legacy and are not supported. Confidence: 0.9
- Constructor injection counts as a legacy feature; `inject()` and `@Service()`-style modern authoring are preferred. Confidence: 0.75
- Signal Forms (`@angular/forms/signals`) is the target forms API; the Insurance Portal was migrated to it. Confidence: 0.8
- RxJS itself is not legacy and should not be excluded; it is fine as long as it stays compatible with OnPush and zoneless, and he expects RxJS-specific and RxJS+Angular-specific features to be designed, not dropped. Confidence: 0.75
- Experimental Angular features are acceptable input to designs and proposals. Confidence: 0.8
- Legacy-support rule: if a feature judged legacy behaves identically to its modern replacement from a runtime DevTools perspective, leave it working with no flag, do not list it as supported, and remove support plus flag it only once the runtime behaviour differs (when it can be detected). Confidence: 0.85
- Expects him to be told about legacy APIs that a target app actually uses (audit the app, then map legacy → modern replacement). Confidence: 0.75
