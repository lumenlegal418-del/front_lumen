import { Component, OnInit, signal } from '@angular/core';

import { HeaderComponent } from '../../components/header/header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import {
  TableColumn,
  TableComponent,
  TableRow,
} from '../../components/table/table.component';

import {MovimientosMetadataService,EstadoCliente} from '../../services/movimientos-metadata.service';



import {
  FilterConfig,
  FiltersComponent,
} from '../../components/filters/filters.component';

@Component({
  selector: 'app-informacion-egresos-e-ingresos',
  standalone: true,
  imports: [
    HeaderComponent,
    NavbarComponent,
    FiltersComponent,
    TableComponent,
  ],
  templateUrl: './informacion-egresos-e-ingresos.html',
  styleUrl: './informacion-egresos-e-ingresos.css',
})
export class InformacionEgresosEIngresosComponent implements OnInit {

  constructor(
    private movimientosMetadataService: MovimientosMetadataService

  ){}

  ngOnInit(): void {
  this.cargarEstadosClientes();
  this.cargarRegistrosEgresos();
  this.cargarEmpleados();
  }


private cargarEstadosClientes(): void {
  this.movimientosMetadataService
    .obtenerEstadosClientes()
    .subscribe({
      next: (respuesta) => {

        console.log(
          'Estados de clientes recibidos:',
          respuesta
        );

        // Guardamos los datos para la tabla
        const filas: TableRow[] = respuesta.map((item) => ({
          nombre_tercero: item.nombre_tercero,
          ano_inicio: item.ano_inicio,
          mes_inicio: item.mes_inicio,
          ano_fin: item.ano_fin,
          mes_fin: item.mes_fin,
          estado: item.estado,
        }));

        this.ingresosData.set(filas);

        // Obtener nombres de terceros únicos
        const nombresTerceros = [
          ...new Set(
            respuesta
              .map(item => item.nombre_tercero)
              .filter(nombre => nombre)
          )
        ];

        // Obtener estados únicos
        const estados = [
          ...new Set(
            respuesta
              .map(item => item.estado)
              .filter(estado => estado)
          )
        ];

        // Actualizar las opciones de los filtros
        this.filtrosIngresos.update(filtros =>
          filtros.map(filtro => {

            if (filtro.name === 'nombre_tercero') {
              return {
                ...filtro,
                options: nombresTerceros.map(nombre => ({
                  label: nombre,
                  value: nombre
                }))
              };
            }

            if (filtro.name === 'estado') {
              return {
                ...filtro,
                options: estados.map(estado => ({
                  label: estado,
                  value: estado
                }))
              };
            }

            return filtro;
          })
        );
      },

      error: (error) => {
        console.error(
          'Error al obtener estados de clientes:',
          error
        );
      }
    });
}
  private cargarRegistrosEgresos(): void {
  this.movimientosMetadataService
    .obtenerRegistrosEgresos()
    .subscribe({
      next: (respuesta) => {

        console.log(
          'Registros de egresos recibidos:',
          respuesta
        );

        // ==============================
        // DATOS PARA LA TABLA
        // ==============================

        const filas: TableRow[] = respuesta.map((item) => ({
          nombre_cuenta: item.nombre_cuenta,
          clasificacion_nombre_cuenta:
            item.clasificacion_nombre_cuenta,
          tipo_egreso: item.tipo_egreso,
        }));

        this.egresosGastosData.set(filas);

        // ==============================
        // DATOS PARA LOS FILTROS
        // ==============================

        const cuentas = [
          ...new Set(
            respuesta
              .map(item => item.nombre_cuenta)
              .filter(cuenta => cuenta)
          )
        ];

        const clasificaciones = [
          ...new Set(
            respuesta
              .map(item => item.clasificacion_nombre_cuenta)
              .filter(clasificacion => clasificacion)
          )
        ];

        const tiposEgreso = [
          ...new Set(
            respuesta
              .map(item => item.tipo_egreso)
              .filter(tipo => tipo)
          )
        ];

        // ==============================
        // ACTUALIZAR FILTROS
        // ==============================

        this.filtrosEgresosGastos.update(filtros =>
          filtros.map(filtro => {

            if (filtro.name === 'nombre_cuenta') {
              return {
                ...filtro,
                options: cuentas.map(cuenta => ({
                  label: cuenta,
                  value: cuenta
                }))
              };
            }

            if (filtro.name === 'clasificacion_nombre_cuenta') {
              return {
                ...filtro,
                options: clasificaciones.map(clasificacion => ({
                  label: clasificacion,
                  value: clasificacion
                }))
              };
            }

            if (filtro.name === 'tipo_egreso') {
              return {
                ...filtro,
                options: tiposEgreso.map(tipo => ({
                  label: tipo,
                  value: tipo
                }))
              };
            }

            return filtro;
          })
        );
      },

      error: (error) => {
        console.error(
          'Error al obtener registros de egresos:',
          error
        );
      }
    });
}
private cargarEmpleados(): void {
  this.movimientosMetadataService
    .obtenerEmpleados()
    .subscribe({
      next: (respuesta) => {

        console.log(
          'Empleados recibidos:',
          respuesta
        );

        // ==============================
        // DATOS PARA LA TABLA
        // ==============================

        const filas: TableRow[] = respuesta.map((item) => ({
          nombre_tercero: item.nombre_tercero,
          tipo_egreso: item.tipo_egreso,
        }));

        this.egresosEmpleadosData.set(filas);

        // ==============================
        // DATOS PARA LOS FILTROS
        // ==============================

        const empleados = [
          ...new Set(
            respuesta
              .map(item => item.nombre_tercero)
              .filter(nombre => nombre)
          )
        ];

        const tiposEgreso = [
          ...new Set(
            respuesta
              .map(item => item.tipo_egreso)
              .filter(tipo => tipo)
          )
        ];

        // ==============================
        // ACTUALIZAR FILTROS
        // ==============================

        this.filtrosEgresosEmpleados.update(filtros =>
          filtros.map(filtro => {

            if (filtro.name === 'empleado') {
              return {
                ...filtro,
                options: empleados.map(empleado => ({
                  label: empleado,
                  value: empleado
                }))
              };
            }

            if (filtro.name === 'tipo_egreso') {
              return {
                ...filtro,
                options: tiposEgreso.map(tipo => ({
                  label: tipo,
                  value: tipo
                }))
              };
            }

            return filtro;
          })
        );
      },

      error: (error) => {
        console.error(
          'Error al obtener empleados:',
          error
        );
      }
    });
}




protected readonly filtrosIngresos = signal<FilterConfig[]>([
  {
    name: 'nombre_tercero',
    label: 'Nombre tercero',
    type: 'select',
    searchable: true,
    placeholder: 'Escribe el nombre del tercero...',
    options: [],
  },
  {
    name: 'estado',
    label: 'Estado',
    type: 'select',
    options: [],
  },
]);

protected onAplicarFiltrosIngresos(
  valores: Record<string, string>
): void {

  console.log(
    'Filtros de ingresos aplicados:',
    valores
  );

  const nombreTercero = valores['nombre_tercero'];
  const estado = valores['estado'];

  this.movimientosMetadataService
    .obtenerEstadosClientes(
      nombreTercero,
      undefined,
      undefined,
      undefined,
      undefined,
      estado
    )
    .subscribe({
      next: (respuesta) => {

        const filas: TableRow[] = respuesta.map((item) => ({
          nombre_tercero: item.nombre_tercero,
          ano_inicio: item.ano_inicio,
          mes_inicio: item.mes_inicio,
          ano_fin: item.ano_fin,
          mes_fin: item.mes_fin,
          estado: item.estado,
        }));

        this.ingresosData.set(filas);
      },

      error: (error) => {
        console.error(
          'Error al aplicar filtros de ingresos:',
          error
        );
      }
    });
}

  protected onLimpiarFiltrosIngresos(): void {
    console.log('Limpiando filtros de ingresos');

    // Más adelante aquí volveremos a cargar
    // la información inicial de ingresos.
  }
protected readonly ingresosData = signal<TableRow[]>([]);
protected readonly ingresosColumns: TableColumn[] = [
  {
    key: 'nombre_tercero',
    label: 'Nombre tercero',
    type: 'text'
  },
  {
    key: 'ano_inicio',
    label: 'Año inicio',
    type: 'text'
  },
  {
    key: 'mes_inicio',
    label: 'Mes inicio',
    type: 'text'
  },
  {
    key: 'ano_fin',
    label: 'Año fin',
    type: 'text'
  },
  {
    key: 'mes_fin',
    label: 'Mes fin',
    type: 'text'
  },
  {
    key: 'estado',
    label: 'Estado',
    type: 'text'
  },
];



protected readonly filtrosEgresosGastos = signal<FilterConfig[]>([
  {
    name: 'nombre_cuenta',
    label: 'Cuenta',
    type: 'select',
    searchable: true,
    placeholder: 'Escribe el nombre de la cuenta...',
    options: [],
  },
  {
    name: 'clasificacion_nombre_cuenta',
    label: 'Clasificacion',
    type: 'select',
    searchable: true,
    placeholder: 'Escribe la clasificación...',
    options: [],
  },
  {
    name: 'tipo_egreso',
    label: 'Tipo',
    type: 'select',
    options: [],
  },
]);

  protected onAplicarFiltrosEgresosGastos(
  valores: Record<string, string>
): void {

  console.log(
    'Filtros de egresos gastos aplicados:',
    valores
  );

  const nombreCuenta =
    valores['nombre_cuenta'];

  const clasificacionNombreCuenta =
    valores['clasificacion_nombre_cuenta'];

  const tipoEgreso =
    valores['tipo_egreso'];

  this.movimientosMetadataService
    .obtenerRegistrosEgresos(
      undefined,
      nombreCuenta,
      clasificacionNombreCuenta,
      tipoEgreso
    )
    .subscribe({
      next: (respuesta) => {

        const filas: TableRow[] = respuesta.map((item) => ({
          nombre_cuenta: item.nombre_cuenta,
          clasificacion_nombre_cuenta:
            item.clasificacion_nombre_cuenta,
          tipo_egreso: item.tipo_egreso,
        }));

        this.egresosGastosData.set(filas);
      },

      error: (error) => {
        console.error(
          'Error al aplicar filtros de egresos gastos:',
          error
        );
      }
    });
}
  protected onLimpiarFiltrosEgresosGastos(): void {
    console.log('Limpiando filtros de egresos gastos');

    // Más adelante aquí volveremos a cargar
    // la información inicial de egresos.
  }

  protected readonly egresosGastosData = signal<TableRow[]>([]);

  protected readonly egresosGastosColumns: TableColumn[] = [
  {
    key: 'nombre_cuenta',
    label: 'Cuenta',
    type: 'text'
  },
  {
    key: 'clasificacion_nombre_cuenta',
    label: 'Clasificación',
    type: 'text'
  },
  {
    key: 'tipo_egreso',
    label: 'Tipo egreso',
    type: 'text'
  },
];





protected readonly filtrosEgresosEmpleados = signal<FilterConfig[]>([
  {
    name: 'empleado',
    label: 'Empleado',
    type: 'select',
    searchable: true,
    placeholder: 'Escribe el nombre del empleado...',
    options: [],
  },
  {
    name: 'tipo_egreso',
    label: 'Tipo egreso',
    type: 'select',
    options: [],
  },
]);


protected onAplicarFiltrosEgresosEmpleados(
  valores: Record<string, string>
): void {

  console.log(
    'Filtros de egresos empleados aplicados:',
    valores
  );

  const empleado =
    valores['empleado'];

  const tipoEgreso =
    valores['tipo_egreso'];

  this.movimientosMetadataService
    .obtenerEmpleados(
      undefined,
      empleado,
      tipoEgreso
    )
    .subscribe({
      next: (respuesta) => {

        const filas: TableRow[] = respuesta.map((item) => ({
          nombre_tercero: item.nombre_tercero,
          tipo_egreso: item.tipo_egreso,
        }));

        this.egresosEmpleadosData.set(filas);
      },

      error: (error) => {
        console.error(
          'Error al aplicar filtros de empleados:',
          error
        );
      }
    });
}

protected onLimpiarFiltrosEgresosEmpleados(): void {
  console.log('Limpiando filtros de egresos empleados');

  // Más adelante aquí volveremos a cargar
  // la información inicial de empleados.
}
protected readonly egresosEmpleadosData = signal<TableRow[]>([]);

protected readonly egresosEmpleadosColumns: TableColumn[] = [
  {
    key: 'nombre_tercero',
    label: 'Empleado',
    type: 'text'
  },
  {
    key: 'tipo_egreso',
    label: 'Tipo egreso',
    type: 'text'
  },
];


}

