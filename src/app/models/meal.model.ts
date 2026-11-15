/** Receta resumida: la devuelve filter.php (listado por categoría). */
export interface MealResumen {
  idMeal: string;       // id de la receta
  strMeal: string;      // nombre
  strMealThumb: string; // URL de la foto
}

/**
 * Receta completa (search.php y lookup.php).
 * La API manda strIngredient1..20 y strMeasure1..20; por eso la "firma de índice"
 * [campo: string] permite leerlos con corchetes: meal['strIngredient3'].
 */
export interface Meal extends MealResumen {
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strTags: string | null;
  strYoutube: string | null;
  [campo: string]: string | null;
}

export interface Categoria {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

/** Ingrediente ya ordenado (lo armamos nosotros a partir de los 20 campos sueltos). */
export interface Ingrediente {
  nombre: string;
  medida: string;
}