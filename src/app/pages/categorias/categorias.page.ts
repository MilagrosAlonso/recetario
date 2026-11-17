import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AccordionGroupCustomEvent } from '@ionic/angular';
import {
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
import { DiccionarioPipe } from '../../pipes/diccionario.pipe';
import { MealService } from '../../services/meal.service';
import { TraduccionService } from '../../services/traduccion.service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
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
    DiccionarioPipe,
  ],
})
export class CategoriasPage implements OnInit {
  categorias: Categoria[] = [];
  cargando = false;
  error = false;

  /** Recetas ya descargadas por categoría (para no repetir la petición). */
  recetasPorCategoria: Record<string, MealResumen[]> = {};
  cargandoCategoria: string | null = null;
  errorCategoria: string | null = null;

  /** Descripciones de categoría ya traducidas al español. */
  descripcionesEs: Record<string, string> = {};

  recetaSeleccionada: string | null = null;

  constructor(
    private mealService: MealService,
    private traduccionService: TraduccionService,
  ) {
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

  alAbrirAcordeon(ev: AccordionGroupCustomEvent): void {
    const categoria = ev.detail.value as string | undefined;
    if (categoria && !this.recetasPorCategoria[categoria]) {
      this.cargarRecetas(categoria);
    }
    // La descripción viene en inglés: se traduce la primera vez que se abre la categoría
    const descripcion = this.categorias.find((c) => c.strCategory === categoria)?.strCategoryDescription;
    if (categoria && descripcion && !this.descripcionesEs[categoria]) {
      this.traduccionService.traducir(descripcion).subscribe((t) => (this.descripcionesEs[categoria] = t));
    }
  }

  cargarRecetas(categoria: string): void {
    this.cargandoCategoria = categoria;
    this.errorCategoria = null;
    this.mealService.obtenerPorCategoria(categoria).subscribe({
      next: (recetas) => {
        this.recetasPorCategoria[categoria] = recetas;
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