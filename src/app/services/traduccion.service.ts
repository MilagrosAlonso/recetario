import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, concatMap, from, map, of, toArray } from 'rxjs';

/** Respuesta de la API de MyMemory. */
interface RespuestaMyMemory {
  responseStatus: number | string;
  responseData: { translatedText: string };
}

/** Resultado de traducir un trozo: el texto y si la traducción salió bien. */
interface Trozo {
  texto: string;
  ok: boolean;
}

const CLAVE_CACHE = 'recetario.traducciones';

/**
 * Traduce textos largos (título e instrucciones) de inglés a español usando la API gratuita
 * de MyMemory. Si la traducción falla (sin internet, límite diario), devuelve el texto original.
 *
 * Para gastar pocas peticiones: junta varias líneas en una sola petición, no traduce las líneas
 * que son solo números ("STEP 1", "2"), guarda lo traducido en el celular y, si la API responde
 * "demasiadas peticiones" (429), deja de intentar durante un rato.
 */
@Injectable({
  providedIn: 'root',
})
export class TraduccionService {
  private readonly url = 'https://api.mymemory.translated.net/get';
  /** MyMemory acepta máximo ~500 caracteres por petición. */
  private readonly maxTrozo = 450;
  /** Textos ya traducidos (también se guardan en localStorage para no gastar el cupo diario). */
  private readonly cache = new Map<string, string>(Object.entries(this.leerCache()));
  /** Hasta cuándo no se intenta traducir (después de un error 429). */
  private bloqueadoHasta = 0;

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
    if (this.bloqueado()) {
      return of(original);
    }

    // Se manda trozo por trozo (uno a la vez) y se vuelve a unir en el mismo orden
    return from(this.dividir(original)).pipe(
      concatMap((trozo) => this.traducirTrozo(trozo)),
      toArray(),
      map((partes) => {
        const resultado = partes.map((p) => p.texto).join('\n');
        if (partes.every((p) => p.ok)) {
          this.guardar(original, resultado); // solo se guarda si todo salió bien
        }
        return resultado;
      }),
    );
  }

  private traducirTrozo(trozo: string): Observable<Trozo> {
    if (this.bloqueado()) {
      return of({ texto: trozo, ok: false });
    }
    return this.http
      .get<RespuestaMyMemory>(this.url, { params: { q: trozo, langpair: 'en|es' } })
      .pipe(
        map((r) => {
          const traducido = r.responseData?.translatedText ?? '';
          const estado = Number(r.responseStatus);
          if (estado === 429) {
            this.bloquear();
          }
          const fallo = estado !== 200 || traducido.startsWith('MYMEMORY WARNING');
          return fallo ? { texto: trozo, ok: false } : { texto: traducido, ok: true };
        }),
        catchError((error) => {
          if (error?.status === 429) {
            this.bloquear(); // demasiadas peticiones: se deja de intentar un rato
          }
          return of({ texto: trozo, ok: false });
        }),
      );
  }

  /** Junta las líneas en trozos de hasta 450 caracteres (menos peticiones a la API). */
  private dividir(texto: string): string[] {
    const lineas = texto
      .split(/\r?\n/)
      .map((linea) => linea.trim())
      // se descartan líneas vacías y las que solo dicen "STEP 1" o un número
      .filter((linea) => linea && !/^((step|paso)\s*)?\d+[.):]?$/i.test(linea));

    const trozos: string[] = [];
    let actual = '';
    for (const linea of lineas) {
      for (const parte of this.partir(linea)) {
        if (actual && (actual + '\n' + parte).length > this.maxTrozo) {
          trozos.push(actual);
          actual = parte;
        } else {
          actual = actual ? actual + '\n' + parte : parte;
        }
      }
    }
    if (actual) {
      trozos.push(actual);
    }
    return trozos;
  }

  /** Si una línea es muy larga, la parte por oraciones. */
  private partir(linea: string): string[] {
    if (linea.length <= this.maxTrozo) {
      return [linea];
    }
    const partes: string[] = [];
    let actual = '';
    for (const oracion of linea.split(/(?<=[.!?])\s+/)) {
      if (actual && (actual + ' ' + oracion).length > this.maxTrozo) {
        partes.push(actual);
        actual = oracion;
      } else {
        actual = actual ? actual + ' ' + oracion : oracion;
      }
    }
    if (actual) {
      partes.push(actual);
    }
    return partes;
  }

  private bloqueado(): boolean {
    return Date.now() < this.bloqueadoHasta;
  }

  /** Después de un 429 no se vuelve a pedir durante 30 minutos. */
  private bloquear(): void {
    this.bloqueadoHasta = Date.now() + 30 * 60 * 1000;
  }

  private guardar(original: string, traducido: string): void {
    this.cache.set(original, traducido);
    if (this.cache.size > 40) {
      this.cache.delete(this.cache.keys().next().value as string); // se borra la más vieja
    }
    try {
      localStorage.setItem(CLAVE_CACHE, JSON.stringify(Object.fromEntries(this.cache)));
    } catch {
      // Si el almacenamiento no está disponible, solo se guarda en memoria.
    }
  }

  private leerCache(): Record<string, string> {
    try {
      return JSON.parse(localStorage.getItem(CLAVE_CACHE) ?? '{}');
    } catch {
      return {};
    }
  }
}