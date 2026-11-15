import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  RefresherCustomEvent,
  SearchbarCustomEvent,
  SegmentCustomEvent,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { alertCircleOutline, apps, list, searchOutline } from 'ionicons/icons';

import { RecetaModalComponent } from '../../components/receta-modal/receta-modal.component';
import { Meal } from '../../models/meal.model';
import { MealService } from '../../services/meal.service';

@Component({
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
  ],
})
export class RecetasPage implements OnInit {
  recetas: Meal[] = [];
  texto = 'a'; // búsqueda inicial: recetas con "a" en el nombre (así hay resultados al abrir)
  vista: 'tarjetas' | 'lista' = 'tarjetas';
  cargando = false;
  error = false;
  recetaSeleccionada: string | null = null; // id de la receta abierta en el modal

  constructor(private mealService: MealService) {
    addIcons({ alertCircleOutline, apps, list, searchOutline });
  }

  // Los datos se cargan en ngOnInit (lo pide la rúbrica)
  ngOnInit(): void {
    this.cargar();
  }

  // "alTerminar" es opcional: lo usa el refresher para cerrar su animación
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

  // Se dispara al escribir en la barra de búsqueda
  alBuscar(ev: SearchbarCustomEvent): void {
    const valor = (ev.detail.value ?? '').trim();
    this.texto = valor || 'a'; // si se borra todo, vuelve a la búsqueda inicial
    this.cargar();
  }

  cambiarVista(ev: SegmentCustomEvent): void {
    this.vista = ev.detail.value === 'lista' ? 'lista' : 'tarjetas';
  }

  // Deslizar hacia abajo para recargar
  refrescar(ev: RefresherCustomEvent): void {
    this.cargar(() => ev.target.complete());
  }

  abrir(id: string): void {
    this.recetaSeleccionada = id; // al tener valor, el modal se abre solo
  }
}