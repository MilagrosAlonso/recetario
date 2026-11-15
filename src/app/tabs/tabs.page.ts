import { AsyncPipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { IonBadge, IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { grid, heart, restaurant } from 'ionicons/icons';
import { Observable, map } from 'rxjs';

import { FavoritosService } from '../services/favoritos.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  imports: [AsyncPipe, NgIf, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge],
})
export class TabsPage {
  totalFavoritos$: Observable<number>;

  constructor(private favoritosService: FavoritosService) {
    // Convierte la lista de favoritos en su cantidad, para el globito rojo
    this.totalFavoritos$ = this.favoritosService.favoritos$.pipe(map((lista) => lista.length));
    addIcons({ restaurant, grid, heart }); // los 3 íconos de las pestañas
  }
}