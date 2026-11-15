import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonThumbnail,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { heartOutline, trash } from 'ionicons/icons';
import { Observable } from 'rxjs';

import { RecetaModalComponent } from '../../components/receta-modal/receta-modal.component';
import { MealResumen } from '../../models/meal.model';
import { FavoritosService } from '../../services/favoritos.service';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
  imports: [
    AsyncPipe,
    NgFor,
    NgIf,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonThumbnail,
    IonLabel,
    IonIcon,
    RecetaModalComponent,
  ],
})
export class FavoritosPage {
  // Se declara acá y se asigna en el constructor
  // (si se asignara en la declaración, TypeScript se queja de usar el servicio antes de recibirlo)
  favoritos$: Observable<MealResumen[]>;
  recetaSeleccionada: string | null = null;

  constructor(private favoritosService: FavoritosService) {
    this.favoritos$ = this.favoritosService.favoritos$;
    addIcons({ heartOutline, trash });
  }

  abrir(id: string): void {
    this.recetaSeleccionada = id;
  }

  quitar(receta: MealResumen): void {
    this.favoritosService.alternar(receta); // como ya es favorita, la quita
  }
}