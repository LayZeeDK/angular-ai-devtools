import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideAppFactsTool } from './tool-registry/app-facts';
import { provideToolRegistry } from './tool-registry/tool-registry';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideToolRegistry(),
    provideAppFactsTool()
  ]
};
