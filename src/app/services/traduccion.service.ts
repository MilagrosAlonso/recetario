import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, concatMap, from, map, of, tap, toArray } from 'rxjs';

/** Respuesta de la API de MyMemory. */
interface RespuestaMyMemory {
  responseStatus: number | string;
  responseData: { translatedText: string };
}

/**
 * Traduce textos largos (título e instrucciones) de inglés a español usando la API gratuita
 * de MyMemory. Si la traducción falla (sin internet, límite diario), devuelve el texto original.
 */
@Injectable({
  providedIn: 'root',
})
export class TraduccionService {
  private readonly url = 'https://api.mymemory.translated.net/get';
  /** MyMemory acepta máximo ~500 caracteres por petición. */
  private readonly maxTrozo = 450;
  /** Textos ya traducidos, para no repetir peticiones. */
  private readonly cache = new Map<string, string>();

  constructor(private http: HttpClient) {}

  /** Traduce un texto de cualquier largo conservando los saltos de línea. */
  traducir(texto: string | null | undefined): Observable<string> {
    const original = (texto ?? '').trim();
    if (!original) {
      return of('');
    }
    const guardado = this.cache.get(original);
    if (guardado) {
      return of(guardado);
    }

    // Se manda trozo por trozo (uno a la vez) y se vuelve a unir en el mismo orden
    const trozos = this.dividir(original);
    return from(trozos).pipe(
      concatMap((trozo) => (trozo.trim() ? this.traducirTrozo(trozo) : of(trozo))),
      toArray(),
      map((partes) => partes.join('\n')),
      tap((resultado) => this.cache.set(original, resultado)),
    );
  }

  private traducirTrozo(trozo: string): Observable<string> {
    return this.http
      .get<RespuestaMyMemory>(this.url, { params: { q: trozo, langpair: 'en|es' } })
      .pipe(
        map((r) => {
          const traducido = r.responseData?.translatedText ?? '';
          const fallo = Number(r.responseStatus) !== 200 || traducido.startsWith('MYMEMORY WARNING');
          return fallo ? trozo : traducido;
        }),
        catchError(() => of(trozo)),
      );
  }

  /** Parte el texto por líneas y, si una línea es muy larga, por oraciones. */
  private dividir(texto: string): string[] {
    const resultado: string[] = [];
    for (const linea of texto.split(/\r?\n/)) {
      if (linea.length <= this.maxTrozo) {
        resultado.push(linea);
        continue;
      }
      let actual = '';
      for (const oracion of linea.split(/(?<=[.!?])\s+/)) {
        if (actual && (actual + ' ' + oracion).length > this.maxTrozo) {
          resultado.push(actual);
          actual = oracion;
        } else {
          actual = actual ? actual + ' ' + oracion : oracion;
        }
      }
      if (actual) {
        resultado.push(actual);
      }
    }
    return resultado;
  }
}