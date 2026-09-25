import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PrediccionMesDto {
  ano: string;
  mes: string;
  valor_predicho: number;
}

export type Clasificacion = 'Egreso fijo' | 'Egreso variable' | 'Ingreso fijo' | 'Ingreso vario';

export interface RecalculoPrediccionDto {
  clasificacion: Clasificacion;
  meses_historicos_usados: number;
  predicciones_generadas: number;
  predicciones: PrediccionMesDto[];
}

@Injectable({ providedIn: 'root' })
export class PrediccionesService {
  private readonly baseUrl = `${environment.apiUrl}/predicciones`;

  constructor(private http: HttpClient) {}

  // Reentrena el modelo de una sola clasificación (usa el rango histórico por defecto del backend)
  recalcular(clasificacion: Clasificacion): Observable<RecalculoPrediccionDto> {
    const params = new HttpParams().set('clasificacion', clasificacion);
    return this.http.post<RecalculoPrediccionDto>(`${this.baseUrl}/recalcular`, null, { params });
  }

  // devuelve un diccionario { mes: valor_predicho } para poder mapearlo igual que registro-*
  getPredicciones(clasificacion: Clasificacion, ano: string): Observable<Record<string, number>> {
    const params = new HttpParams().set('ano', ano);
    return this.http
      .get<PrediccionMesDto[]>(`${this.baseUrl}/${encodeURIComponent(clasificacion)}`, { params })
      .pipe(
        map((predicciones) =>
          predicciones.reduce<Record<string, number>>((acc, p) => {
            acc[p.mes] = p.valor_predicho;
            return acc;
          }, {})
        )
      );
  }
}
