import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    // Carga las rutas de las pestañas desde tabs.routes.ts
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
];