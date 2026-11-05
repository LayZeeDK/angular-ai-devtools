import { CanActivateFn } from '@angular/router';

/** Gate that always allows activation (must not redirect). */
export const redirectGuard: CanActivateFn = () => true;
