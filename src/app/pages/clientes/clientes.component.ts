import { Component, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { HeaderComponent } from '../../components/header/header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';

import {
  FilterConfig,
  FiltersComponent,
} from '../../components/filters/filters.component';

import { CatalogosService } from '../../services/catalogos.service';
import { VisualizacionesService } from '../../services/visualizaciones.service';

import {
  TableColumn,
  TableComponent,
  TableRow,
} from '../../components/table/table.component';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    HeaderComponent,
    NavbarComponent,
    FiltersComponent,
    TableComponent,
  ],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css',
})
export class ClientesComponent implements OnInit {
  constructor(
    private readonly catalogosService: CatalogosService,
    private readonly visualizacionesService: VisualizacionesService
  ) {}

  // Los ids de catálogos/meses y catálogos/anos vienen en orden cronológico
  // (1 = más antiguo), por eso se pueden comparar directamente como números
  // para validar el rango.
  protected readonly errorRango = signal<string | null>(null);

  protected readonly clientesData = signal<TableRow[]>([]);

  protected readonly filtros = signal<FilterConfig[]>([
    {
      name: 'mesInicial',
      label: 'Mes inicial',
      type: 'select',
      options: [],
    },
    {
      name: 'anioInicial',
      label: 'Año inicial',
      type: 'select',
      options: [],
    },
    {
      name: 'mesFinal',
      label: 'Mes final',
      type: 'select',
      options: [],
    },
    {
      name: 'anioFinal',
      label: 'Año final',
      type: 'select',
      options: [],
    },
    {
      name: 'cliente',
      label: 'Entidad',
      type: 'select',
      searchable: true,
      placeholder: 'Escribe el nombre de la Entidad...',
      options: [],
    },
    {
      name: 'nit',
      label: 'NIT',
      type: 'select',
      searchable: true,
      placeholder: 'Escribe el NIT...',
      options: [],
    },
    {
      name: 'documento',
      label: 'Documento',
      type: 'select',
      searchable: true,
      placeholder: 'Escribe el documento...',
      options: [],
    },
  ]);

  ngOnInit(): void {
    forkJoin({
      anios: this.catalogosService.getAnios(),
      meses: this.catalogosService.getMeses(),
      clientes: this.catalogosService.getClientes(),
      nits: this.catalogosService.getNits(),
      documentos: this.catalogosService.getDocumentos(),
    }).subscribe(
      ({ anios, meses, clientes, nits, documentos }) => {
        this.filtros.set([
          {
            name: 'mesInicial',
            label: 'Mes inicial',
            type: 'select',
            options: meses,
          },
          {
            name: 'anioInicial',
            label: 'Año inicial',
            type: 'select',
            options: anios,
          },
          {
            name: 'mesFinal',
            label: 'Mes final',
            type: 'select',
            options: meses,
          },
          {
            name: 'anioFinal',
            label: 'Año final',
            type: 'select',
            options: anios,
          },
          {
            name: 'cliente',
            label: 'Entidad',
            type: 'select',
            searchable: true,
            placeholder: 'Escribe el nombre de la Entidad...',
            options: clientes,
          },
          {
            name: 'nit',
            label: 'NIT',
            type: 'select',
            searchable: true,
            placeholder: 'Escribe el NIT...',
            options: nits,
          },
          {
            name: 'documento',
            label: 'Documento',
            type: 'select',
            searchable: true,
            placeholder: 'Escribe el documento...',
            options: documentos,
          },
        ]);

        // Rango por defecto: todo el histórico disponible en el catálogo.
        const anioInicialDefault = anios[0]?.label ?? '';
        const anioFinalDefault = anios.at(-1)?.label ?? '';
        const mesInicialDefault = meses[0]?.label ?? '';
        const mesFinalDefault = meses.at(-1)?.label ?? '';

        this.cargarRegistros(
          anioInicialDefault,
          mesInicialDefault,
          anioFinalDefault,
          mesFinalDefault,
          undefined,
          undefined,
          undefined,
          true
        );
      }
    );
  }

  private labelDe(filtro: string, id: string): string {
    return (
      this.filtros()
        .find((f) => f.name === filtro)
        ?.options?.find((o) => o.value === id)?.label ?? ''
    );
  }

  // Fisher-Yates: toma N elementos al azar sin repetir.
  private muestraAleatoria(
    items: TableRow[],
    cantidad: number
  ): TableRow[] {
    const copia = [...items];

    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [copia[i], copia[j]] = [copia[j], copia[i]];
    }

    return copia.slice(0, cantidad);
  }

  // Convierte el nombre del mes a su número correspondiente.
  private numeroMes(mes: string): number {
    const meses: Record<string, number> = {
      enero: 1,
      febrero: 2,
      marzo: 3,
      abril: 4,
      mayo: 5,
      junio: 6,
      julio: 7,
      agosto: 8,
      septiembre: 9,
      octubre: 10,
      noviembre: 11,
      diciembre: 12,
    };

    return meses[mes.trim().toLowerCase()] ?? 0;
  }

  private cargarRegistros(
    anioInicial: string,
    mesInicial: string,
    anioFinal: string,
    mesFinal: string,
    cliente?: string,
    nit?: string,
    documento?: string,
    soloMuestra = false
  ): void {
    if (
      !anioInicial ||
      !mesInicial ||
      !anioFinal ||
      !mesFinal
    ) {
      return;
    }

    this.visualizacionesService
      .getRegistrosPorPeriodo(
        anioInicial,
        mesInicial,
        anioFinal,
        mesFinal,
        cliente,
        nit,
        documento
      )
      .subscribe((registros) => {
        const filas = registros.map((r) => ({
          cliente: r.cliente ?? '',
          nit: r.nit ?? '',
          documento: r.documento ?? '',
          mes: r.mes,
          anio: r.ano,
          valor: r.total,
        }));

        // Ordenar por año y mes, ambos de mayor a menor.
        const filasOrdenadas = [...filas].sort((a, b) => {
          const anioA = Number(a['anio']);
          const anioB = Number(b['anio']);

          // Año: mayor a menor.
          if (anioA !== anioB) {
            return anioB - anioA;
          }

          const mesA = this.numeroMes(String(a['mes']));
          const mesB = this.numeroMes(String(b['mes']));

          // Mes: mayor a menor.
          return mesB - mesA;
        });

        // Si soloMuestra es true, se seleccionan 10 registros aleatorios.
        const resultado = soloMuestra
          ? this.muestraAleatoria(filasOrdenadas, 10)
          : filasOrdenadas;

        // Volver a ordenar después de seleccionar la muestra.
        // Esto garantiza que la tabla siempre quede ordenada.
        resultado.sort((a, b) => {
          const anioA = Number(a['anio']);
          const anioB = Number(b['anio']);

          if (anioA !== anioB) {
            return anioB - anioA;
          }

          return (
            this.numeroMes(String(b['mes'])) -
            this.numeroMes(String(a['mes']))
          );
        });

        this.clientesData.set(resultado);
      });
  }

  // Valida que el año/mes inicial no sea posterior
  // al año/mes final.
  private rangoValido(
    valores: Record<string, string>
  ): boolean {
    const anioInicial = Number(valores['anioInicial']);
    const anioFinal = Number(valores['anioFinal']);
    const mesInicial = Number(valores['mesInicial']);
    const mesFinal = Number(valores['mesFinal']);

    if (
      !anioInicial ||
      !anioFinal ||
      !mesInicial ||
      !mesFinal
    ) {
      return true;
    }

    if (anioInicial > anioFinal) {
      return false;
    }

    if (
      anioInicial === anioFinal &&
      mesInicial > mesFinal
    ) {
      return false;
    }

    return true;
  }

  protected readonly clientesColumns: TableColumn[] = [
    {
      key: 'cliente',
      label: 'Entidad',
      type: 'text',
    },
    {
      key: 'nit',
      label: 'NIT',
      type: 'text',
    },
    {
      key: 'documento',
      label: 'Documento',
      type: 'text',
    },
    {
      key: 'mes',
      label: 'Mes',
      type: 'text',
    },
    {
      key: 'anio',
      label: 'Año',
      type: 'text',
    },
    {
      key: 'valor',
      label: 'Valor',
      type: 'currency',
    },
  ];

  protected onAplicarFiltros(
    valores: Record<string, string>
  ): void {
    console.log('Filtros aplicados:', valores);

    if (!this.rangoValido(valores)) {
      this.errorRango.set(
        'El rango de fechas no es válido: el mes/año inicial no puede ser posterior al final.'
      );

      return;
    }

    this.errorRango.set(null);

    const anioInicial = this.labelDe(
      'anioInicial',
      valores['anioInicial']
    );

    const mesInicial = this.labelDe(
      'mesInicial',
      valores['mesInicial']
    );

    const anioFinal = this.labelDe(
      'anioFinal',
      valores['anioFinal']
    );

    const mesFinal = this.labelDe(
      'mesFinal',
      valores['mesFinal']
    );

    this.cargarRegistros(
      anioInicial,
      mesInicial,
      anioFinal,
      mesFinal,
      valores['cliente'],
      valores['nit'],
      valores['documento']
    );
  }

  protected onLimpiarFiltros(
    _valores: Record<string, string>
  ): void {
    this.errorRango.set(null);

    const anios =
      this.filtros()
        .find((f) => f.name === 'anioInicial')
        ?.options ?? [];

    const meses =
      this.filtros()
        .find((f) => f.name === 'mesInicial')
        ?.options ?? [];

    this.cargarRegistros(
      anios[0]?.label ?? '',
      meses[0]?.label ?? '',
      anios.at(-1)?.label ?? '',
      meses.at(-1)?.label ?? '',
      undefined,
      undefined,
      undefined,
      true
    );
  }

  protected readonly archivos = [
    'movimiento-2023',
    'movimiento-2024',
    'movimiento-2025',
  ];

  protected onArchivoSeleccionado(
    archivo: string
  ): void {
    console.log('Archivo seleccionado:', archivo);
  }
}
