import * as XLSX from 'xlsx';
import { Component, OnInit, computed, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { HeaderComponent } from '../../components/header/header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';

import {
  ArchivoCatalogo,
  FileListComponent,
  SeleccionArchivo,
} from '../../components/file-list/file-list.component';

import { CatalogosService } from '../../services/catalogos.service';
import { MovimientosService } from '../../services/movimientos.service';
import { PrediccionesService } from '../../services/predicciones.service';

import {
  RegistroMensualDto,
  VisualizacionesService,
} from '../../services/visualizaciones.service';

import {
  TableColumn,
  TableComponent,
  TableRow,
} from '../../components/table/table.component';

@Component({
  selector: 'app-ingresa-informacion',
  standalone: true,
  imports: [
    HeaderComponent,
    NavbarComponent,
    FileListComponent,
    TableComponent
  ],
  templateUrl: './ingresa-informacion.component.html',
  styleUrl: './ingresa-informacion.component.css',
})
export class IngresaInformacionComponent implements OnInit {

  constructor(
    private readonly catalogosService: CatalogosService,
    private readonly movimientosService: MovimientosService,
    private readonly visualizacionesService: VisualizacionesService,
    private readonly prediccionesService: PrediccionesService
  ) {}

  // ============================================================
  // ARCHIVOS
  // ============================================================

  protected archivos = signal<ArchivoCatalogo[]>([]);
  protected selectedFile = signal<string>('');

  protected seleccion = signal<SeleccionArchivo | null>(null);

  // ============================================================
  // REENTRENAMIENTO DE MODELOS
  // ============================================================

  protected readonly reentrenando = signal<boolean>(false);

  protected onReentrenarModelos(): void {
    if (this.reentrenando()) {
      return;
    }

    this.reentrenando.set(true);

    forkJoin([
      this.prediccionesService.recalcular('Egreso fijo'),
      this.prediccionesService.recalcular('Egreso variable'),
      this.prediccionesService.recalcular('Ingreso fijo'),
      this.prediccionesService.recalcular('Ingreso vario'),
    ]).subscribe({
      next: () => {
        console.log('Modelos reentrenados correctamente');
        this.reentrenando.set(false);
      },
      error: (error) => {
        console.error(
          'Error al reentrenar los modelos:',
          error
        );
        this.reentrenando.set(false);
      },
    });
  }

  // ============================================================
  // TABLA
  // ============================================================

  protected readonly tituloTabla = computed(() => {
    const s = this.seleccion();

    return s
      ? `${s.nombreArchivo} — ${s.mes} ${s.anio}`
      : this.selectedFile();
  });

  protected readonly tablaColumns: TableColumn[] = [
    { key: 'ano', label: 'Año', type: 'text' },
    { key: 'mes', label: 'Mes', type: 'text' },
    { key: 'nit', label: 'Nit', type: 'text' },
    { key: 'nombreTercero', label: 'Nombre tercero', type: 'text' },
    { key: 'detalle', label: 'Detalle', type: 'text' },
    { key: 'nombreCuenta', label: 'Nombre cuenta', type: 'text' },
    { key: 'codigo', label: 'Codigo', type: 'text' },
    { key: 'documento', label: 'Documento', type: 'text' },
    { key: 'debitos', label: 'debitos', type: 'currency' },
    { key: 'creditos', label: 'creditos', type: 'currency' },
    { key: 'total', label: 'total', type: 'currency' },
  ];

  protected tablaData = signal<TableRow[]>([]);

  protected onArchivoSeleccionado(
    seleccion: SeleccionArchivo
  ): void {
    this.selectedFile.set(
      seleccion.nombreArchivo
    );

    this.seleccion.set(seleccion);

    this.movimientosService
      .getDetalle(
        seleccion.anio,
        seleccion.mes
      )
      .subscribe((detalle) => {
        this.tablaData.set(
          detalle.map((d) => ({
            ano: d.ano ?? '',
            mes: d.mes ?? '',
            nit: d.nit ?? '',
            nombreTercero: d.nombre_tercero ?? '',
            detalle: d.detalle ?? '',
            nombreCuenta: d.nombre_cuenta ?? '',
            codigo: d.codigo ?? '',
            documento: d.documento ?? '',
            debitos: d.debitos ?? 0,
            creditos: d.creditos ?? 0,
            total: d.total ?? 0,
          }))
        );
      });
  }

  // ============================================================
  // ELIMINACIÓN
  // ============================================================

  /**
   * Controla si se muestra la ventana de confirmación.
   */
  protected mostrarConfirmacionEliminar =
    signal<boolean>(false);

  /**
   * Indica si actualmente se está eliminando el archivo.
   */
  protected eliminandoArchivo =
    signal<boolean>(false);

  /**
   * Al presionar "Eliminar Documento"
   * solamente se abre la ventana de confirmación.
   *
   * Aquí NO se llama al backend.
   */
  protected onEliminarDocumento(): void {
    const seleccionActual = this.seleccion();

    if (!seleccionActual) {
      return;
    }

    this.mostrarConfirmacionEliminar.set(true);
  }

  /**
   * El usuario decide NO eliminar.
   */
  protected rechazarEliminacion(): void {
    if (this.eliminandoArchivo()) {
      return;
    }

    this.mostrarConfirmacionEliminar.set(false);
  }

  /**
   * El usuario confirma la eliminación.
   *
   * Aquí sí se llama al backend.
   */
  protected aceptarEliminacion(): void {
    const seleccionActual = this.seleccion();

    if (!seleccionActual) {
      return;
    }

    if (this.eliminandoArchivo()) {
      return;
    }

    this.eliminandoArchivo.set(true);

    this.movimientosService
      .eliminarMovimientos(
        seleccionActual.nombreArchivo,
        seleccionActual.anio,
        seleccionActual.mes
      )
      .subscribe({
        next: () => {
          console.log(
            'Movimientos eliminados correctamente'
          );

          this.eliminandoArchivo.set(false);

          // Cerrar ventana de confirmación
          this.mostrarConfirmacionEliminar.set(false);

          // Limpiar archivo seleccionado
          this.selectedFile.set('');
          this.seleccion.set(null);
          this.tablaData.set([]);

          // Mostrar mensaje de éxito
          this.tipoMensaje.set('exito');

          this.mensajeCarga.set(
            'Archivo eliminado correctamente.'
          );

          this.mostrarMensaje.set(true);

          // Actualizar la lista de archivos
          this.catalogosService
            .getArchivos()
            .subscribe((archivos) => {
              this.archivos.set(archivos);
            });
        },

        error: (error) => {
          console.error(
            'Error al eliminar los movimientos:',
            error
          );

          this.eliminandoArchivo.set(false);

          const mensaje =
            error?.error?.detail ??
            'Ocurrió un error al eliminar el archivo.';

          // Cerrar confirmación
          this.mostrarConfirmacionEliminar.set(false);

          // Mostrar error
          this.tipoMensaje.set('error');
          this.mensajeCarga.set(mensaje);
          this.mostrarMensaje.set(true);
        },
      });
  }

  // ============================================================
  // AGREGAR DOCUMENTO
  // ============================================================

  protected onAgregarDocumento(): void {
    const nombreNuevo = prompt(
      'Ingresa el nombre del nuevo documento:'
    );

    if (
      nombreNuevo &&
      nombreNuevo.trim()
    ) {
      const nombre = nombreNuevo.trim();

      const nuevoArchivo: ArchivoCatalogo = {
        nombreArchivo: nombre,
        anio: new Date()
          .getFullYear()
          .toString(),
        meses: [],
      };

      this.archivos.set([
        ...this.archivos(),
        nuevoArchivo
      ]);

      this.selectedFile.set(nombre);
    }
  }

  // ============================================================
  // CARGAR ARCHIVO
  // ============================================================

  protected cargandoArchivo =
    signal<boolean>(false);

  protected onCargarDatos(
    event: Event
  ): void {
    const input =
      event.target as HTMLInputElement;

    const archivo =
      input.files?.[0];

    if (!archivo) {
      return;
    }

    this.cargandoArchivo.set(true);

    this.movimientosService
      .cargarExcel(archivo)
      .subscribe({
        next: (respuesta) => {
          console.log(
            'Archivo cargado correctamente:',
            respuesta
          );

          this.cargandoArchivo.set(false);

          // Mostrar mensaje de éxito
          this.tipoMensaje.set('exito');

          this.mensajeCarga.set(
            'Archivo subido correctamente.'
          );

          this.mostrarMensaje.set(true);

          // Actualizar lista de archivos
          this.catalogosService
            .getArchivos()
            .subscribe((archivos) => {
              this.archivos.set(archivos);
            });

          input.value = '';
        },

        error: (error) => {
          console.error(
            'Error al cargar el archivo:',
            error
          );

          this.cargandoArchivo.set(false);

          const mensaje =
            error?.error?.detail ??
            'Ocurrió un error al cargar el archivo.';

          this.tipoMensaje.set('error');

          this.mensajeCarga.set(mensaje);

          this.mostrarMensaje.set(true);

          input.value = '';
        },
      });
  }

  // ============================================================
  // MENSAJES
  // ============================================================

  protected mostrarMensaje =
    signal<boolean>(false);

  protected mensajeCarga =
    signal<string>('');

  protected tipoMensaje =
    signal<'exito' | 'error'>('exito');

  protected cerrarMensaje(): void {
    this.mostrarMensaje.set(false);
    this.mensajeCarga.set('');
  }

  // ============================================================
  // DESCARGAR TABLA
  // ============================================================

  protected onDescargarTabla(): void {
    const datos = this.tablaData();

    if (!datos.length) {
      return;
    }

    const worksheet =
      XLSX.utils.json_to_sheet(datos);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Información'
    );

    const nombreArchivo =
      this.seleccion()
        ? `${this.seleccion()!.nombreArchivo}_${this.seleccion()!.mes}_${this.seleccion()!.anio}.xlsx`
        : 'informacion.xlsx';

    XLSX.writeFile(
      workbook,
      nombreArchivo
    );
  }

  // ============================================================
  // INICIALIZACIÓN
  // ============================================================

  ngOnInit(): void {
    this.catalogosService
      .getArchivos()
      .subscribe((archivos) => {
        this.archivos.set(archivos);
      });
  }
}

