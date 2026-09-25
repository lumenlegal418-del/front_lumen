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

  protected archivos = signal<ArchivoCatalogo[]>([]);

  protected selectedFile = signal<string>('');

  // =====================================================
  // REENTRENAMIENTO DE MODELOS
  // =====================================================

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
        console.error('Error al reentrenar los modelos:', error);
        this.reentrenando.set(false);
      },
    });
  }

  // =====================================================
  // SELECCIÓN DE ARCHIVO
  // =====================================================

  // los meses funcionan como filtro: aquí queda el año/mes/archivo exactos que el usuario eligió
  protected seleccion = signal<SeleccionArchivo | null>(null);

  protected readonly tituloTabla = computed(() => {
    const s = this.seleccion();

    return s
      ? `${s.nombreArchivo} — ${s.mes} ${s.anio}`
      : this.selectedFile();
  });

  ngOnInit(): void {
    this.catalogosService
      .getArchivos()
      .subscribe((archivos) => this.archivos.set(archivos));
  }

  // =====================================================
  // TABLA
  // =====================================================

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

  // =====================================================
  // ARCHIVO SELECCIONADO
  // =====================================================

  protected onArchivoSeleccionado(
    seleccion: SeleccionArchivo
  ): void {

    this.selectedFile.set(seleccion.nombreArchivo);
    this.seleccion.set(seleccion);

    // nombre_documento filtra por n° de comprobante,
    // NO por el archivo de origen; no se envía aquí
    this.movimientosService
      .getDetalle(seleccion.anio, seleccion.mes)
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

  // =====================================================
  // ELIMINAR DOCUMENTO
  // =====================================================

  protected onEliminarDocumento(): void {
  const seleccionActual = this.seleccion();

  if (!seleccionActual) {
    return;
  }

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

        this.selectedFile.set('');
        this.seleccion.set(null);
        this.tablaData.set([]);
      },

      error: (error) => {
        console.error(
          'Error al eliminar los movimientos:',
          error
        );
      },
    });
}

  // =====================================================
  // AGREGAR DOCUMENTO
  // =====================================================

  protected onAgregarDocumento(): void {

    const nombreNuevo = prompt(
      'Ingresa el nombre del nuevo documento:'
    );

    if (nombreNuevo && nombreNuevo.trim()) {

      const nombre = nombreNuevo.trim();

      const nuevoArchivo: ArchivoCatalogo = {
        nombreArchivo: nombre,
        anio: new Date().getFullYear().toString(),
        meses: [],
      };

      this.archivos.set([
        ...this.archivos(),
        nuevoArchivo
      ]);

      this.selectedFile.set(nombre);
    }
  }

  protected cargandoArchivo = signal<boolean>(false);

  protected onCargarDatos(
  event: Event
): void {

  const input = event.target as HTMLInputElement;
  const archivo = input.files?.[0];

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

        // Actualizar la lista de archivos
        this.catalogosService
          .getArchivos()
          .subscribe((archivos) => {
            this.archivos.set(archivos);
          });

        // Limpiar el input para permitir volver a seleccionar
        input.value = '';
      },

      error: (error) => {

        console.error(
          'Error al cargar el archivo:',
          error
        );

        this.cargandoArchivo.set(false);

        input.value = '';
      },
    });
}

protected onDescargarTabla(): void {
  const datos = this.tablaData();

  if (!datos.length) {
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(datos);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Información'
  );

  const nombreArchivo = this.seleccion()
    ? `${this.seleccion()!.nombreArchivo}_${this.seleccion()!.mes}_${this.seleccion()!.anio}.xlsx`
    : 'informacion.xlsx';

  XLSX.writeFile(workbook, nombreArchivo);
}

}