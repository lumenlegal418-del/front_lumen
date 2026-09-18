import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// =====================================================
// MODELOS - ESTADOS DE CLIENTES
// =====================================================

export interface EstadoCliente {
  nombre_tercero: string;
  ano_inicio: string;
  mes_inicio: string;
  ano_fin: string;
  mes_fin: string;
  estado: string;
}

// =====================================================
// MODELOS - REGISTROS DE EGRESOS
// =====================================================

export interface RegistrosEgresos {
  id: number;
  nombre_cuenta: string;
  clasificacion_nombre_cuenta: string;
  tipo_egreso: string;
}

export interface CrearRegistroEgreso {
  nombre_cuenta: string;
  clasificacion_nombre_cuenta: string;
  tipo_egreso: string;
}

// =====================================================
// MODELOS - EMPLEADOS
// =====================================================

export interface Empleados {
  id: number;
  nombre_tercero: string;
  tipo_egreso: string;
}

export interface CrearEmpleado {
  nombre_tercero: string;
  tipo_egreso: string;
}


// =====================================================
// SERVICE
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class MovimientosMetadataService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}


  // =====================================================
  // ESTADOS DE CLIENTES
  // =====================================================

  // GET - Obtener estados de clientes
  obtenerEstadosClientes(
    nombre_tercero?: string,
    ano_inicio?: string,
    mes_inicio?: string,
    ano_fin?: string,
    mes_fin?: string,
    estado?: string
  ): Observable<EstadoCliente[]> {

    let params = new HttpParams();

    if (nombre_tercero) {
      params = params.set('nombre_tercero', nombre_tercero);
    }

    if (ano_inicio) {
      params = params.set('ano_inicio', ano_inicio);
    }

    if (mes_inicio) {
      params = params.set('mes_inicio', mes_inicio);
    }

    if (ano_fin) {
      params = params.set('ano_fin', ano_fin);
    }

    if (mes_fin) {
      params = params.set('mes_fin', mes_fin);
    }

    if (estado) {
      params = params.set('estado', estado);
    }

    return this.http.get<EstadoCliente[]>(
      `${this.apiUrl}/catalogos/estado-clientes`,
      { params }
    );
  }


  // POST - Crear estado de cliente
  crearEstadoCliente(
    estadoCliente: EstadoCliente
  ): Observable<EstadoCliente> {

    return this.http.post<EstadoCliente>(
      `${this.apiUrl}/catalogos/estado-clientes`,
      estadoCliente
    );
  }


  // DELETE - Eliminar estado de cliente
  eliminarEstadoCliente(
    estadoCliente: EstadoCliente
  ): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/catalogos/estado-clientes`,
      {
        body: estadoCliente
      }
    );
  }


  // =====================================================
  // REGISTROS DE EGRESOS
  // =====================================================

  // GET - Obtener registros de egresos
  obtenerRegistrosEgresos(
    id?: number,
    nombre_cuenta?: string,
    clasificacion_nombre_cuenta?: string,
    tipo_egreso?: string
  ): Observable<RegistrosEgresos[]> {

    let params = new HttpParams();

    if (id !== undefined) {
      params = params.set('id', id.toString());
    }

    if (nombre_cuenta) {
      params = params.set('nombre_cuenta', nombre_cuenta);
    }

    if (clasificacion_nombre_cuenta) {
      params = params.set(
        'clasificacion_nombre_cuenta',
        clasificacion_nombre_cuenta
      );
    }

    if (tipo_egreso) {
      params = params.set('tipo_egreso', tipo_egreso);
    }

    return this.http.get<RegistrosEgresos[]>(
      `${this.apiUrl}/catalogos/registros-egresos`,
      { params }
    );
  }


  // POST - Crear registro de egreso
  crearRegistroEgreso(
    registroEgreso: CrearRegistroEgreso
  ): Observable<RegistrosEgresos> {

    return this.http.post<RegistrosEgresos>(
      `${this.apiUrl}/catalogos/registros-egresos`,
      registroEgreso
    );
  }


  // DELETE - Eliminar registro de egreso
  eliminarRegistroEgreso(
    registroEgreso: RegistrosEgresos
  ): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/catalogos/registros-egresos`,
      {
        body: registroEgreso
      }
    );
  }


  // =====================================================
  // EMPLEADOS
  // =====================================================

  // GET - Obtener empleados
  obtenerEmpleados(
    id?: number,
    nombre_tercero?: string,
    tipo_egreso?: string
  ): Observable<Empleados[]> {

    let params = new HttpParams();

    if (id !== undefined) {
      params = params.set('id', id.toString());
    }

    if (nombre_tercero) {
      params = params.set('nombre_tercero', nombre_tercero);
    }

    if (tipo_egreso) {
      params = params.set('tipo_egreso', tipo_egreso);
    }

    return this.http.get<Empleados[]>(
      `${this.apiUrl}/catalogos/empleados`,
      { params }
    );
  }


  // POST - Crear empleado
  crearEmpleado(
    empleado: CrearEmpleado
  ): Observable<Empleados> {

    return this.http.post<Empleados>(
      `${this.apiUrl}/catalogos/empleados`,
      empleado
    );
  }


  // DELETE - Eliminar empleado
  eliminarEmpleado(
    empleado: Empleados
  ): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/catalogos/empleados`,
      {
        body: empleado
      }
    );
  }

}
