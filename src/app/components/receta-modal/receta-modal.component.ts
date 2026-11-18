import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import {
  IonButton,
  IonCheckbox,
  IonChip,
  IonContent,
  IonIcon,
  IonLabel,
  IonModal,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  SegmentCustomEvent,
  ToastController, IonList, IonHeader, IonToolbar, IonTitle, IonButtons } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  close,
  earthOutline,
  heart,
  heartOutline,
  listOutline,
  logoYoutube,
  restaurantOutline,
} from 'ionicons/icons';

import { Ingrediente, Meal } from '../../models/meal.model';
import { FavoritosService } from '../../services/favoritos.service';
import { MealService } from '../../services/meal.service';
import { TraduccionService } from '../../services/traduccion.service';
import { DiccionarioPipe } from '../../pipes/diccionario.pipe';
import { ingredienteEs, medidaEs } from '../../utils/diccionario';

/** Modal con el detalle completo de una receta. Se abre cuando `idMeal` tiene valor. */
@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-receta-modal',
  templateUrl: './receta-modal.component.html',
  styleUrls: ['./receta-modal.component.scss'],
  imports: [IonButtons, IonTitle, IonToolbar, IonHeader, IonList, 
    NgIf,
    NgFor,
    IonModal,
    IonContent,
    IonButton,
    IonIcon,
    IonChip,
    IonLabel,
    IonSpinner,
    IonSegment,
    IonSegmentButton,
    IonCheckbox,
    DiccionarioPipe,
  ],
})
export class RecetaModalComponent implements OnChanges {
  @Input() idMeal: string | null = null;
  @Output() cerrar = new EventEmitter<void>();

  receta: Meal | null = null;
  ingredientes: Ingrediente[] = [];
  cargando = false;
  error = false;
  /** Título e instrucciones en español (hasta que llega la traducción se muestra el original). */
  tituloEs = '';
  instruccionesEs = '';
  traduciendo = false;
  /** Pestaña activa del detalle: ingredientes o preparación. */
  segmento: 'ingredientes' | 'preparacion' = 'ingredientes';
  /** Posiciones de los ingredientes tildados (ya los tengo / ya los puse). */
  marcados = new Set<number>();

  constructor(
    private mealService: MealService,
    private favoritosService: FavoritosService,
    private toastCtrl: ToastController,
    private traduccionService: TraduccionService,
  ) {
    addIcons({
      alertCircleOutline,
      close,
      earthOutline,
      heart,
      heartOutline,
      listOutline,
      logoYoutube,
      restaurantOutline,
    });
  }

  ngOnChanges(): void {
    if (this.idMeal) {
      this.cargar(this.idMeal);
    }
  }

  cargar(id: string): void {
    this.cargando = true;
    this.error = false;
    this.receta = null;
    this.segmento = 'ingredientes';
    this.marcados.clear();
    this.mealService.obtenerDetalle(id).subscribe({
      next: (meal) => {
        this.receta = meal;
        // Ingredientes y medidas se traducen con el diccionario local
        this.ingredientes = meal
          ? this.mealService
              .extraerIngredientes(meal)
              .map((i) => ({ nombre: ingredienteEs(i.nombre), medida: medidaEs(i.medida) }))
          : [];
        this.tituloEs = meal?.strMeal ?? '';
        this.instruccionesEs = meal?.strInstructions ?? '';
        this.error = !meal;
        this.cargando = false;
        if (meal) {
          this.traducirTextos(meal);
        }
      },
      error: () => {
        this.error = true;
        this.cargando = false;
      },
    });
  }

  /** Título e instrucciones se traducen con la API; si falla, queda el texto en inglés. */
  private traducirTextos(meal: Meal): void {
    this.traduciendo = true;
    this.traduccionService.traducir(meal.strMeal).subscribe((t) => {
      if (this.receta === meal) {
        this.tituloEs = t || meal.strMeal;
      }
    });
    this.traduccionService.traducir(meal.strInstructions).subscribe((t) => {
      if (this.receta === meal) {
        this.instruccionesEs = t || meal.strInstructions;
        this.traduciendo = false;
      }
    });
  }

  cambiarSegmento(ev: SegmentCustomEvent): void {
    this.segmento = ev.detail.value === 'preparacion' ? 'preparacion' : 'ingredientes';
  }

  /** Tilda o destilda un ingrediente de la lista. */
  alternarMarca(indice: number): void {
    if (this.marcados.has(indice)) {
      this.marcados.delete(indice);
    } else {
      this.marcados.add(indice);
    }
  }

  /** La preparación viene como un texto largo: se separa por líneas para mostrarla en pasos. */
  get pasos(): string[] {
    return this.instruccionesEs
      .split(/\r?\n/)
      .map((linea) => linea.trim())
      // se descartan líneas vacías y las que solo dicen "STEP 1" / "1."
      .filter((linea) => linea && !/^((step|paso)\s*)?\d+[.):]?$/i.test(linea));
  }

  get esFavorito(): boolean {
    return !!this.receta && this.favoritosService.esFavorito(this.receta.idMeal);
  }

  async alternarFavorito(): Promise<void> {
    if (!this.receta) {
      return;
    }
    const agregado = this.favoritosService.alternar(this.receta);
    const toast = await this.toastCtrl.create({
      message: agregado ? 'Agregada a favoritos' : 'Quitada de favoritos',
      duration: 1500,
      position: 'bottom',
      color: agregado ? 'success' : 'medium',
    });
    await toast.present();
  }

  get etiquetas(): string[] {
    return this.receta?.strTags ? this.receta.strTags.split(',').filter((t) => t.trim()) : [];
  }
}