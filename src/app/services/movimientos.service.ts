import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DetalleMovimientoDto {
  ano: string | null;
  mes: string | null;
  nit: string | null;
  nombre_tercero: string | null;
  detalle: string | null;
  nombre_cuenta: string | null;
  codigo: string | null;
  documento: string | null;
  debitos: number | null;
  creditos: number | null;
  total: number | null;
}

@Injectable({ providedIn: 'root' })
export class MovimientosService {
  private readonly baseUrl = `${environment.apiUrl}/movimientos`;

  constructor(private http: HttpClient) {}

  getDetalle(
    ano: string,
    mes: string,
    nombreDocumento?: string,
    skip = 0,
    limit = 500
  ): Observable<DetalleMovimientoDto[]> {
    let params = new HttpParams()
      .set('ano', ano)
      .set('mes', mes)
      .set('skip', skip)
      .set('limit', limit);

    if (nombreDocumento) {
      params = params.set('nombre_documento', nombreDocumento);
    }

    return this.http.get<DetalleMovimientoDto[]>(
      `${this.baseUrl}/detalle`,
      { params }
    );
  }

  eliminarMovimientos(
    nombreArchivo: string,
    ano: string,
    mes: string
  ): Observable<any> {

    const params = new HttpParams()
      .set('nombre_archivo', nombreArchivo)
      .set('ano', ano)
      .set('mes', mes);

    return this.http.delete(
      `${environment.apiUrl}/eliminar/movimientos`,
      { params }
    );
  }

  cargarExcel(archivo: File): Observable<any> {
    const formData = new FormData();

    formData.append('archivo', archivo);

    return this.http.post(
      `${environment.apiUrl}/carga/excel`,
      formData
    );
}

}