import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { alertCircleOutline, close, heart, heartOutline, logoYoutube } from 'ionicons/icons';

import { Ingrediente, Meal } from '../../models/meal.model';
import { FavoritosService } from '../../services/favoritos.service';
import { MealService } from '../../services/meal.service';

/** Modal con el detalle completo de una receta. Se abre cuando `idMeal` tiene valor. */
@Component({
  selector: 'app-receta-modal', // se usa en HTML como <app-receta-modal>
  templateUrl: './receta-modal.component.html',
  styleUrls: ['./receta-modal.component.scss'],
  // Cada componente declara qué usa en su HTML
  imports: [
    NgIf,
    NgFor,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonIcon,
    IonChip,
    IonLabel,
    IonSpinner,
    IonList,
    IonItem,
  ],
})
export class RecetaModalComponent implements OnChanges {
  @Input() idMeal: string | null = null;       // el padre pasa el id; si es null el modal está cerrado
  @Output() cerrar = new EventEmitter<void>(); // avisa al padre que hay que cerrar

  receta: Meal | null = null;
  ingredientes: Ingrediente[] = [];
  cargando = false;
  error = false;

  constructor(
    private mealService: MealService,
    private favoritosService: FavoritosService,
    private toastCtrl: ToastController, // para el aviso (ion-toast)
  ) {
    // Ionic necesita que se registren los íconos que se usan por nombre
    addIcons({ alertCircleOutline, close, heart, heartOutline, logoYoutube });
  }

  // Se ejecuta cuando cambia un @Input, o sea, cuando el padre elige otra receta
  ngOnChanges(): void {
    if (this.idMeal) {
      this.cargar(this.idMeal);
    }
  }

  cargar(id: string): void {
    this.cargando = true;
    this.error = false;
    this.receta = null;
    this.mealService.obtenerDetalle(id).subscribe({
      next: (meal) => {
        this.receta = meal;
        this.ingredientes = meal ? this.mealService.extraerIngredientes(meal) : [];
        this.error = !meal;
        this.cargando = false;
      },
      error: () => {
        this.error = true;
        this.cargando = false;
      },
    });
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

  // La API manda las etiquetas como "Pasta,Baking": se separan por coma
  get etiquetas(): string[] {
    return this.receta?.strTags ? this.receta.strTags.split(',').filter((t) => t.trim()) : [];
  }
}