import { Component, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { HeaderComponent } from '../../components/header/header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';

import {
  TableColumn,
  TableComponent,
  TableRow,
} from '../../components/table/table.component';

import {MovimientosMetadataService,EstadoCliente,RegistrosEgresos,Empleados,CrearRegistroEgreso,CrearEmpleado} from '../../services/movimientos-metadata.service';



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
    ReactiveFormsModule,
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
          mes_inicio: this.obtenerNombreMes(item.mes_inicio),
          ano_fin: item.ano_fin,
          mes_fin: this.obtenerNombreMes(item.mes_fin),
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

private obtenerNombreMes(mes: number | string | null): string {
  const meses: Record<string, string> = {
    '1': 'Enero',
    '2': 'Febrero',
    '3': 'Marzo',
    '4': 'Abril',
    '5': 'Mayo',
    '6': 'Junio',
    '7': 'Julio',
    '8': 'Agosto',
    '9': 'Septiembre',
    '10': 'Octubre',
    '11': 'Noviembre',
    '12': 'Diciembre',
  };

  return meses[String(mes)] ?? '';
}

private obtenerNumeroMes(mes: string | number | null): string {
  const meses: Record<string, string> = {
    enero: '1',
    febrero: '2',
    marzo: '3',
    abril: '4',
    mayo: '5',
    junio: '6',
    julio: '7',
    agosto: '8',
    septiembre: '9',
    octubre: '10',
    noviembre: '11',
    diciembre: '12',
  };

  const valor = String(mes ?? '').trim().toLowerCase();

  // Si ya viene como número, lo dejamos igual
  if (/^(?:[1-9]|1[0-2])$/.test(valor)) {
    return valor;
  }

  return meses[valor] ?? '';
}
//ingresos

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
          mes_inicio: this.obtenerNombreMes(item.mes_inicio),
          ano_fin: item.ano_fin,
          mes_fin: this.obtenerNombreMes(item.mes_fin),
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
protected readonly ingresoSeleccionado =
  signal<EstadoCliente | null>(null);


protected onIngresoSeleccionado(
  registro: TableRow
): void {
  const estadoCliente: EstadoCliente = {
    nombre_tercero: String(registro['nombre_tercero']),
    ano_inicio: String(registro['ano_inicio']),
    mes_inicio: this.obtenerNumeroMes(String(registro['mes_inicio'] ?? '')),
    ano_fin: String(registro['ano_fin']),
    mes_fin: this.obtenerNumeroMes(String(registro['mes_fin'] ?? '')),
    estado: String(registro['estado']),
  };

  this.ingresoSeleccionado.set(estadoCliente);
}


protected eliminarIngreso(): void {
  const registro = this.ingresoSeleccionado();

  if (!registro) {
    return;
  }

  this.movimientosMetadataService
    .eliminarEstadoCliente(registro)
    .subscribe({
      next: () => {
        console.log('Ingreso eliminado correctamente');

        this.ingresoSeleccionado.set(null);

        this.cargarEstadosClientes();
      },
      error: (error) => {
        console.error('Error al eliminar el ingreso:', error);
      }
    });
}
protected readonly mostrarFormularioIngresoSignal =signal(false);

protected mostrarFormularioIngreso(): void {this.mostrarFormularioIngresoSignal.set(true);}

protected cancelarFormularioIngreso(): void {this.mostrarFormularioIngresoSignal.set(false);}
private fb = inject(FormBuilder);

protected readonly meses = [
  { valor: '1', nombre: 'Enero' },
  { valor: '2', nombre: 'Febrero' },
  { valor: '3', nombre: 'Marzo' },
  { valor: '4', nombre: 'Abril' },
  { valor: '5', nombre: 'Mayo' },
  { valor: '6', nombre: 'Junio' },
  { valor: '7', nombre: 'Julio' },
  { valor: '8', nombre: 'Agosto' },
  { valor: '9', nombre: 'Septiembre' },
  { valor: '10', nombre: 'Octubre' },
  { valor: '11', nombre: 'Noviembre' },
  { valor: '12', nombre: 'Diciembre' },
];

protected readonly formularioIngreso = this.fb.group({
  nombre_tercero: ['', Validators.required],
  ano_inicio: ['', Validators.required],
  mes_inicio: ['', Validators.required],
  ano_fin: ['', Validators.required],
  mes_fin: ['', Validators.required],
  estado: ['', Validators.required],
});

protected crearIngreso(): void {

  if (this.formularioIngreso.invalid) {
    return;
  }

  const nuevoIngreso: EstadoCliente = {
    nombre_tercero:
      this.formularioIngreso.value.nombre_tercero ?? '',

    ano_inicio:
      this.formularioIngreso.value.ano_inicio ?? '',

    mes_inicio:
      this.formularioIngreso.value.mes_inicio ?? '',

    ano_fin:
      this.formularioIngreso.value.ano_fin ?? '',

    mes_fin:
      this.formularioIngreso.value.mes_fin ?? '',

    estado:
      this.formularioIngreso.value.estado ?? '',
  };

  this.movimientosMetadataService
    .crearEstadoCliente(nuevoIngreso)
    .subscribe({
      next: () => {

        console.log('Ingreso creado correctamente');

        this.formularioIngreso.reset();

        this.mostrarFormularioIngresoSignal.set(false);

        this.cargarEstadosClientes();
      },

      error: (error) => {
        console.error(
          'Error al crear el ingreso:',
          error
        );
      }
    });
}


//egresos
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
  protected readonly egresoGastoSeleccionado = signal<RegistrosEgresos | null>(null);

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

protected onEgresoGastoSeleccionado(
  registro: TableRow
): void {
  const egresoGasto: RegistrosEgresos = {
    id: Number(registro['id']),
    nombre_cuenta: String(registro['nombre_cuenta']),
    clasificacion_nombre_cuenta: String(
      registro['clasificacion_nombre_cuenta']
    ),
    tipo_egreso: String(registro['tipo_egreso']),
  };

  this.egresoGastoSeleccionado.set(egresoGasto);
}
protected eliminarEgresoGasto(): void {
  const registro = this.egresoGastoSeleccionado();

  if (!registro) {
    return;
  }

  this.movimientosMetadataService
    .eliminarRegistroEgreso(registro)
    .subscribe({
      next: () => {
        console.log('Egreso eliminado correctamente');

        this.egresoGastoSeleccionado.set(null);

        this.cargarRegistrosEgresos();
      },
      error: (error) => {
        console.error(
          'Error al eliminar el egreso:',
          error
        );
      }
    });
}

protected readonly formularioEgresoGastoVisible = signal(false);

protected readonly formularioEgresoGasto = this.fb.group({
  nombre_cuenta: ['', Validators.required],
  clasificacion_nombre_cuenta: ['', Validators.required],
  tipo_egreso: ['', Validators.required],
});

protected mostrarFormularioEgresoGasto(): void {
  this.formularioEgresoGastoVisible.set(true);
}

protected cancelarFormularioEgresoGasto(): void {
  this.formularioEgresoGastoVisible.set(false);
  this.formularioEgresoGasto.reset();
}

protected crearEgresoGasto(): void {
  if (this.formularioEgresoGasto.invalid) {
    return;
  }

  const nuevoEgreso: CrearRegistroEgreso = {
    nombre_cuenta:
      this.formularioEgresoGasto.value.nombre_cuenta ?? '',

    clasificacion_nombre_cuenta:
      this.formularioEgresoGasto.value.clasificacion_nombre_cuenta ?? '',

    tipo_egreso:
      this.formularioEgresoGasto.value.tipo_egreso ?? '',
  };

  this.movimientosMetadataService
    .crearRegistroEgreso(nuevoEgreso)
    .subscribe({
      next: () => {
        console.log('Egreso creado correctamente');

        this.formularioEgresoGasto.reset();

        this.formularioEgresoGastoVisible.set(false);

        this.cargarRegistrosEgresos();
      },

      error: (error) => {
        console.error(
          'Error al crear el egreso:',
          error
        );
      }
    });
}


//empleados

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

protected readonly egresoEmpleadoSeleccionado =signal<Empleados | null>(null);
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

protected onEgresoEmpleadoSeleccionado(
  registro: TableRow
): void {
  const empleado: Empleados = {
    id: Number(registro['id']),
    nombre_tercero: String(registro['nombre_tercero']),
    tipo_egreso: String(registro['tipo_egreso']),
  };

  this.egresoEmpleadoSeleccionado.set(empleado);
}

protected eliminarEgresoEmpleado(): void {
  const registro = this.egresoEmpleadoSeleccionado();

  if (!registro) {
    return;
  }

  this.movimientosMetadataService
    .eliminarEmpleado(registro)
    .subscribe({
      next: () => {
        console.log('Empleado eliminado correctamente');

        this.egresoEmpleadoSeleccionado.set(null);

        this.cargarEmpleados();
      },
      error: (error) => {
        console.error(
          'Error al eliminar el empleado:',
          error
        );
      }
    });
}

protected readonly formularioEgresoEmpleadoVisible =
  signal(false);

protected readonly formularioEgresoEmpleado =
  this.fb.group({
    nombre_tercero: ['', Validators.required],
    tipo_egreso: ['', Validators.required],
  });

protected mostrarFormularioEgresoEmpleado(): void {
  this.formularioEgresoEmpleadoVisible.set(true);
}

protected cancelarFormularioEgresoEmpleado(): void {
  this.formularioEgresoEmpleadoVisible.set(false);
  this.formularioEgresoEmpleado.reset();
}

protected crearEgresoEmpleado(): void {
  if (this.formularioEgresoEmpleado.invalid) {
    return;
  }

  const nuevoEmpleado: CrearEmpleado = {
    nombre_tercero:
      this.formularioEgresoEmpleado.value.nombre_tercero ?? '',

    tipo_egreso:
      this.formularioEgresoEmpleado.value.tipo_egreso ?? '',
  };

  this.movimientosMetadataService
    .crearEmpleado(nuevoEmpleado)
    .subscribe({
      next: () => {
        console.log('Empleado creado correctamente');

        this.formularioEgresoEmpleado.reset();

        this.formularioEgresoEmpleadoVisible.set(false);

        this.cargarEmpleados();
      },

      error: (error) => {
        console.error(
          'Error al crear el empleado:',
          error
        );
      }
    });
}

}
