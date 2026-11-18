import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RefresherCustomEvent, SearchbarCustomEvent, SegmentCustomEvent, IonCardSubtitle, IonHeader, IonToolbar, IonTitle } from '@ionic/angular';
import {
  IonButton,
  IonCard,
  IonChip,
  IonContent,
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
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { alertCircleOutline, apps, heart, heartOutline, list, searchOutline } from 'ionicons/icons';

import { RecetaModalComponent } from '../../components/receta-modal/receta-modal.component';
import { MealResumen } from '../../models/meal.model';
import { DiccionarioPipe } from '../../pipes/diccionario.pipe';
import { FavoritosService } from '../../services/favoritos.service';
import { MealService } from '../../services/meal.service';

/** Receta para mostrar en las listas. El área y la categoría no siempre vienen de la API. */
type RecetaLista = MealResumen & { strArea?: string; strCategory?: string };

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-recetas',
  templateUrl: './recetas.page.html',
  styleUrls: ['./recetas.page.scss'],
  imports: [IonTitle, IonToolbar, IonHeader, IonCardSubtitle, 
    NgFor,
    NgIf,
    IonContent,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonIcon,
    IonCard,
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
  recetas: RecetaLista[] = [];
  texto = 'a'; // Búsqueda inicial: recetas que contienen "a" en el nombre
  /** Categorías rápidas (nombres de la API, se muestran traducidos con el pipe). */
  readonly categorias = ['Breakfast', 'Chicken', 'Pasta', 'Dessert', 'Seafood', 'Vegetarian', 'Beef'];
  categoria: string | null = null; // null = todas
  vista: 'lista' | 'tarjetas' = 'lista';
  indiceDestacada = 0; // para los puntitos del carrusel
  cargando = false;
  error = false;
  recetaSeleccionada: string | null = null;

  constructor(
    private mealService: MealService,
    private favoritosService: FavoritosService,
  ) {
    addIcons({ alertCircleOutline, apps, heart, heartOutline, list, searchOutline });
  }

  ngOnInit(): void {
    this.cargar();
  }

  /** Las 4 primeras recetas van en el carrusel grande. */
  get destacadas(): RecetaLista[] {
    return this.recetas.slice(0, 4);
  }

  /** El resto se muestra debajo, en lista o en tarjetas. */
  get resto(): RecetaLista[] {
    return this.recetas.slice(4);
  }

  cargar(alTerminar?: () => void): void {
    this.cargando = true;
    this.error = false;
    const categoria = this.categoria;
    // Con una categoría elegida se piden las recetas de esa categoría; si no, se busca por nombre
    const peticion = categoria
      ? this.mealService.obtenerPorCategoria(categoria)
      : this.mealService.buscar(this.texto);
    peticion.subscribe({
      next: (meals) => {
        this.recetas = categoria ? meals.map((m) => ({ ...m, strCategory: categoria })) : meals;
        this.indiceDestacada = 0;
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
    this.categoria = null; // al escribir se vuelve a "Todas"
    this.cargar();
  }

  elegirCategoria(categoria: string | null): void {
    this.categoria = categoria;
    this.cargar();
  }

  cambiarVista(ev: SegmentCustomEvent): void {
    this.vista = ev.detail.value === 'tarjetas' ? 'tarjetas' : 'lista';
  }

  refrescar(ev: RefresherCustomEvent): void {
    this.cargar(() => ev.target.complete());
  }

  /** Calcula qué tarjeta del carrusel se está viendo, para marcar el puntito. */
  alDesplazar(ev: Event): void {
    const carrusel = ev.target as HTMLElement;
    this.indiceDestacada = Math.round(carrusel.scrollLeft / carrusel.clientWidth);
  }

  abrir(id: string): void {
    this.recetaSeleccionada = id;
  }

  esFavorito(id: string): boolean {
    return this.favoritosService.esFavorito(id);
  }

  alternarFavorito(receta: RecetaLista, ev: Event): void {
    ev.stopPropagation(); // para que no se abra el detalle al tocar el corazón
    this.favoritosService.alternar(receta);
  }
}