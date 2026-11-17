import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RefresherCustomEvent, SearchbarCustomEvent, SegmentCustomEvent } from '@ionic/angular';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonThumbnail,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { alertCircleOutline, apps, list, searchOutline } from 'ionicons/icons';

import { RecetaModalComponent } from '../../components/receta-modal/receta-modal.component';
import { Meal } from '../../models/meal.model';
import { DiccionarioPipe } from '../../pipes/diccionario.pipe';
import { MealService } from '../../services/meal.service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-recetas',
  templateUrl: './recetas.page.html',
  styleUrls: ['./recetas.page.scss'],
  imports: [
    NgFor,
    NgIf,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonChip,
    IonList,
    IonItem,
    IonThumbnail,
    IonSpinner,
    IonButton,
    IonRefresher,
    IonRefresherContent,
    RecetaModalComponent,
    DiccionarioPipe,
  ],
})
export class RecetasPage implements OnInit {
  recetas: Meal[] = [];
  texto = 'a'; // Búsqueda inicial: recetas que contienen "a" en el nombre
  vista: 'tarjetas' | 'lista' = 'tarjetas';
  cargando = false;
  error = false;
  recetaSeleccionada: string | null = null;

  constructor(private mealService: MealService) {
    addIcons({ alertCircleOutline, apps, list, searchOutline });
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(alTerminar?: () => void): void {
    this.cargando = true;
    this.error = false;
    this.mealService.buscar(this.texto).subscribe({
      next: (meals) => {
        this.recetas = meals;
        this.cargando = false;
        alTerminar?.();
      },
      error: () => {
        this.recetas = [];
        this.error = true;
        this.cargando = false;
        alTerminar?.();
      },
    });
  }

  alBuscar(ev: SearchbarCustomEvent): void {
    const valor = (ev.detail.value ?? '').trim();
    this.texto = valor || 'a';
    this.cargar();
  }

  cambiarVista(ev: SegmentCustomEvent): void {
    this.vista = ev.detail.value === 'lista' ? 'lista' : 'tarjetas';
  }

  refrescar(ev: RefresherCustomEvent): void {
    this.cargar(() => ev.target.complete());
  }

  abrir(id: string): void {
    this.recetaSeleccionada = id;
  }
}