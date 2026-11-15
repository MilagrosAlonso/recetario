import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environment';
import { Categoria, Ingrediente, Meal, MealResumen } from '../models/meal.model';

/** Servicio que consume la API JSON de TheMealDB. La URL base viene de src/environments/. */
@Injectable({
  providedIn: 'root', // una sola instancia compartida en toda la app
})
export class MealService {
  private readonly url = environment.mealDbUrl;

  // Inyección por constructor: Angular entrega el HttpClient listo para usar
  constructor(private http: HttpClient) {}

  /** Busca recetas por nombre. Si no hay resultados la API devuelve { meals: null }. */
  buscar(texto: string): Observable<Meal[]> {
    return this.http
      .get<{ meals: Meal[] | null }>(`${this.url}/search.php`, { params: { s: texto } })
      .pipe(map((r) => r.meals ?? [])); // si vino null, devolvemos un arreglo vacío
  }

  /** Lista todas las categorías (Beef, Chicken, Dessert...). */
  obtenerCategorias(): Observable<Categoria[]> {
    return this.http
      .get<{ categories: Categoria[] | null }>(`${this.url}/categories.php`)
      .pipe(map((r) => r.categories ?? []));
  }

  /** Recetas (versión resumida) de una categoría. */
  obtenerPorCategoria(categoria: string): Observable<MealResumen[]> {
    return this.http
      .get<{ meals: MealResumen[] | null }>(`${this.url}/filter.php`, { params: { c: categoria } })
      .pipe(map((r) => r.meals ?? []));
  }

  /** Detalle completo de una receta por id. La API devuelve un arreglo de 1 elemento. */
  obtenerDetalle(id: string): Observable<Meal | null> {
    return this.http
      .get<{ meals: Meal[] | null }>(`${this.url}/lookup.php`, { params: { i: id } })
      .pipe(map((r) => r.meals?.[0] ?? null));
  }

  /** Convierte strIngredient1..20 / strMeasure1..20 en una lista ordenada. */
  extraerIngredientes(meal: Meal): Ingrediente[] {
    const lista: Ingrediente[] = [];
    for (let i = 1; i <= 20; i++) {
      const nombre = meal[`strIngredient${i}`];
      const medida = meal[`strMeasure${i}`];
      if (nombre && nombre.trim()) { // se ignoran los ingredientes vacíos
        lista.push({ nombre: nombre.trim(), medida: (medida ?? '').trim() });
      }
    }
    return lista;
  }
}