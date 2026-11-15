import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AccordionGroupCustomEvent,
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonThumbnail,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { alertCircleOutline } from 'ionicons/icons';

import { RecetaModalComponent } from '../../components/receta-modal/receta-modal.component';
import { Categoria, MealResumen } from '../../models/meal.model';
import { MealService } from '../../services/meal.service';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.page.html',
  styleUrls: ['./categorias.page.scss'],
  imports: [
    NgFor,
    NgIf,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonAccordionGroup,
    IonAccordion,
    IonItem,
    IonLabel,
    IonList,
    IonThumbnail,
    IonSpinner,
    IonIcon,
    IonButton,
    RecetaModalComponent,
  ],
})
export class CategoriasPage implements OnInit {
  categorias: Categoria[] = [];
  cargando = false;
  error = false;

  /** "Caché": recetas ya descargadas por categoría, para no pedirlas dos veces. */
  recetasPorCategoria: Record<string, MealResumen[]> = {};
  cargandoCategoria: string | null = null; // categoría que se está cargando ahora
  errorCategoria: string | null = null;    // categoría que falló

  recetaSeleccionada: string | null = null;

  constructor(private mealService: MealService) {
    addIcons({ alertCircleOutline });
  }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.cargando = true;
    this.error = false;
    this.mealService.obtenerCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.cargando = false;
      },
      error: () => {
        this.error = true;
        this.cargando = false;
      },
    });
  }

  // Se dispara al abrir un acordeón. ev.detail.value es el nombre de la categoría abierta
  alAbrirAcordeon(ev: AccordionGroupCustomEvent): void {
    const categoria = ev.detail.value as string | undefined;
    if (categoria && !this.recetasPorCategoria[categoria]) {
      this.cargarRecetas(categoria); // solo se pide si todavía no la tenemos
    }
  }

  cargarRecetas(categoria: string): void {
    this.cargandoCategoria = categoria;
    this.errorCategoria = null;
    this.mealService.obtenerPorCategoria(categoria).subscribe({
      next: (recetas) => {
        this.recetasPorCategoria[categoria] = recetas; // se guarda en la caché
        this.cargandoCategoria = null;
      },
      error: () => {
        this.errorCategoria = categoria;
        this.cargandoCategoria = null;
      },
    });
  }

  abrir(id: string): void {
    this.recetaSeleccionada = id;
  }
}