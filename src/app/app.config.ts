import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading, RouteReuseStrategy } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),         // detección de cambios con zone.js
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, // navegación al estilo Ionic
    provideIonicAngular(),                                         // activa los componentes de Ionic
    provideRouter(routes, withPreloading(PreloadAllModules)),      // rutas; precarga páginas en segundo plano
    provideHttpClient(),                                           // permite que MealService use HttpClient
  ],
};
