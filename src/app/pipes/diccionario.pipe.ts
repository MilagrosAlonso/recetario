import { Pipe, PipeTransform } from '@angular/core';

import { areaEs, categoriaEs } from '../utils/diccionario';

/**
 * Traduce categorías y países usando el diccionario local.
 * Uso en plantillas: {{ receta.strCategory | diccionario:'categoria' }}
 */
@Pipe({ name: 'diccionario' })
export class DiccionarioPipe implements PipeTransform {
  transform(valor: string | null | undefined, tipo: 'categoria' | 'area'): string {
    return tipo === 'categoria' ? categoriaEs(valor) : areaEs(valor);
  }
}