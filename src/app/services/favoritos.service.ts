import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { MealResumen } from '../models/meal.model';

const CLAVE = 'recetario.favoritos'; // nombre bajo el que se guarda en localStorage

/** Guarda las recetas favoritas en localStorage (no es una fuente de datos externa). */
@Injectable({
  providedIn: 'root',
})
export class FavoritosService {
  // BehaviorSubject: guarda el valor actual y avisa a quien lo mire cuando cambia
  private readonly _favoritos = new BehaviorSubject<MealResumen[]>(this.leer());
  // Versión de solo lectura que usan las páginas
  readonly favoritos$ = this._favoritos.asObservable();

  esFavorito(id: string): boolean {
    return this._favoritos.value.some((f) => f.idMeal === id);
  }

  /** Agrega o quita la receta. Devuelve true si quedó como favorita. */
  alternar(receta: MealResumen): boolean {
    const actuales = this._favoritos.value;
    const existe = actuales.some((f) => f.idMeal === receta.idMeal);
    const nuevos = existe
      ? actuales.filter((f) => f.idMeal !== receta.idMeal)
      : [...actuales, { idMeal: receta.idMeal, strMeal: receta.strMeal, strMealThumb: receta.strMealThumb }];
    this._favoritos.next(nuevos); // avisa a las pestañas y listas
    this.guardar(nuevos);
    return !existe;
  }

  private leer(): MealResumen[] {
    try {
      return JSON.parse(localStorage.getItem(CLAVE) ?? '[]');
    } catch {
      return []; // si el JSON está dañado, se empieza de cero
    }
  }

  private guardar(lista: MealResumen[]): void {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(lista));
    } catch {
      // Si el almacenamiento no está disponible, los favoritos solo duran la sesión.
    }
  }
}