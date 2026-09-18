import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface EstadoClienteDto {
  nombre_tercero: string;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class InformacionEgresosIngresosService {
  private readonly baseUrl = `${environment.apiUrl}/catalogos`;

  constructor(private http: HttpClient) {}

  getEstadoClientes(): Observable<EstadoClienteDto[]> {
    return this.http.get<EstadoClienteDto[]>(
      `${this.baseUrl}/estado-clientes`
    );
  }
}
