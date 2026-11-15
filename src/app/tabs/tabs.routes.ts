import { Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      // loadComponent = carga perezosa: la página se descarga solo al entrar a ella
      {
        path: 'recetas',
        loadComponent: () => import('../pages/recetas/recetas.page').then((m) => m.RecetasPage),
      },
      {
        path: 'categorias',
        loadComponent: () => import('../pages/categorias/categorias.page').then((m) => m.CategoriasPage),
      },
      {
        path: 'favoritos',
        loadComponent: () => import('../pages/favoritos/favoritos.page').then((m) => m.FavoritosPage),
      },
      {
        path: '',
        redirectTo: '/tabs/recetas',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/recetas',
    pathMatch: 'full',
  },
];