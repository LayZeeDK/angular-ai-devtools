import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideAppFactsTool } from './tool-registry/app-facts';
import { provideErrorDigestTool } from './tool-registry/error-digest.tool';
import { providePanelEnvironmentTool } from './tool-registry/panel-environment.tool';
import { provideReadTools } from './tool-registry/read-tools';
import { provideToolRegistry } from './tool-registry/tool-registry';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideToolRegistry(),
    provideAppFactsTool(),
    provideReadTools(),
    providePanelEnvironmentTool(),
    provideErrorDigestTool()
  ]
};
