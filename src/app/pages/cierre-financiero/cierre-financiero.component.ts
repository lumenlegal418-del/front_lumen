import { Component, OnInit, computed, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { HeaderComponent } from '../../components/header/header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import {
  FilterConfig,
  FiltersComponent,
} from '../../components/filters/filters.component';
import { CatalogosService } from '../../services/catalogos.service';
import {
  ResumenEgresosDto,
  ResumenIngresosDto,
  RegistroMensualDto,
  ComposicionEgresosDto,
  ComposicionEgresosFijosDto,
  ComposicionEgresosVariosDto,
  PesoClientesDto,
  ImportanciaClientesAnualDto,
  VisualizacionesService,
} from '../../services/visualizaciones.service';
import { KpiCardComponent } from '../../components/kpi-card/kpi-card.component';
import {
  TimeSeries,
  TimeSeriesComponent,
} from '../../components/time-series/time-series.component';
import {
  PieDatum,
  PieChartComponent,
} from '../../components/pie-chart/pie-chart.component';
import {
  TableColumn,
  TableComponent,
  TableRow,
} from '../../components/table/table.component';

@Component({
  selector: 'app-cierre-financiero',
  standalone: true,
  imports: [
    HeaderComponent,
    NavbarComponent,
    FiltersComponent,
    KpiCardComponent,
    TimeSeriesComponent,
    PieChartComponent,
    TableComponent,
  ],
  templateUrl: './cierre-financiero.component.html',
  styleUrl: './cierre-financiero.component.css',
})
export class CierreFinancieroComponent implements OnInit {
  protected readonly mesSeleccionado = signal<string>('Agosto');

  protected readonly filtros = signal<FilterConfig[]>([
    { name: 'anio', label: 'Año', type: 'select', options: [] },
    { name: 'mes', label: 'Mes', type: 'select', options: [] },
  ]);

  protected readonly resumenIngresos = signal<ResumenIngresosDto | null>(null);
  protected readonly resumenEgresos = signal<ResumenEgresosDto | null>(null);
  protected readonly registroIngresos = signal<RegistroMensualDto | null>(null);
  protected readonly registroEgresos = signal<RegistroMensualDto | null>(null);
  protected readonly registroIngresosAcumulado = signal<RegistroMensualDto | null>(null);
  protected readonly registroEgresosAcumulado = signal<RegistroMensualDto | null>(null);
  protected readonly registroIngresoFijo = signal<RegistroMensualDto | null>(null);
  protected readonly registroIngresoVario = signal<RegistroMensualDto | null>(null);
  protected readonly registroEgresoFijo = signal<RegistroMensualDto | null>(null);
  protected readonly registroEgresoVario = signal<RegistroMensualDto | null>(null);
  protected readonly composicionEgresosApi = signal<ComposicionEgresosDto | null>(null);
  protected readonly composicionEgresosFijosApi = signal<ComposicionEgresosFijosDto | null>(null);
  protected readonly composicionEgresosVariosApi = signal<ComposicionEgresosVariosDto | null>(null);
  protected readonly pesoClientesApi = signal<PesoClientesDto | null>(null);
  protected readonly importanciaClientesAnualApi = signal<ImportanciaClientesAnualDto | null>(null);

  constructor(
    private readonly catalogosService: CatalogosService,
    private readonly visualizacionesService: VisualizacionesService
  ) {}

  ngOnInit(): void {
    forkJoin({
      anios: this.catalogosService.getAnios(),
      meses: this.catalogosService.getMeses(),
    }).subscribe(({ anios, meses }) => {
      this.filtros.set([
        { name: 'anio', label: 'Año', type: 'select', options: anios },
        { name: 'mes', label: 'Mes', type: 'select', options: meses },
      ]);
      const anioDefault = anios.at(-1)?.label ?? '';
      const mesDefault =
        meses.find((m) => m.label === this.mesSeleccionado())?.label ??
        meses[0]?.label ??
        '';
      this.mesSeleccionado.set(mesDefault || this.mesSeleccionado());
      this.cargarResumenes(anioDefault, mesDefault);
    });
  }

  private labelDe(filtro: string, id: string): string {
    return this.filtros().find((f) => f.name === filtro)?.options?.find((o) => o.value === id)?.label ?? '';
  }

  private cargarResumenes(anio: string, mes: string): void {
    if (anio) {
      this.visualizacionesService
        .getRegistroIngresos(anio)
        .subscribe((registro) => this.registroIngresos.set(registro));
      this.visualizacionesService
        .getRegistroEgresos(anio)
        .subscribe((registro) => this.registroEgresos.set(registro));
      this.visualizacionesService
        .getRegistroIngresosAcumulado(anio)
        .subscribe((registro) => this.registroIngresosAcumulado.set(registro));
      this.visualizacionesService
        .getRegistroEgresosAcumulado(anio)
        .subscribe((registro) => this.registroEgresosAcumulado.set(registro));
      this.visualizacionesService
        .getRegistroIngresosPorTipo(anio, 'Ingreso fijo')
        .subscribe((registro) => this.registroIngresoFijo.set(registro));
      this.visualizacionesService
        .getRegistroIngresosPorTipo(anio, 'Ingreso vario')
        .subscribe((registro) => this.registroIngresoVario.set(registro));
      this.visualizacionesService
        .getRegistroEgresosPorTipo(anio, 'Egreso fijo')
        .subscribe((registro) => this.registroEgresoFijo.set(registro));
      this.visualizacionesService
        .getRegistroEgresosPorTipo(anio, 'Egreso variable')
        .subscribe((registro) => this.registroEgresoVario.set(registro));
      this.visualizacionesService
        .getImportanciaClientesAnual(anio)
        .subscribe((importancia) => this.importanciaClientesAnualApi.set(importancia));
    }
    if (!anio || !mes) {
      return;
    }
    this.visualizacionesService
      .getResumenIngresos(anio, mes)
      .subscribe((resumen) => this.resumenIngresos.set(resumen));
    this.visualizacionesService
      .getResumenEgresos(anio, mes)
      .subscribe((resumen) => this.resumenEgresos.set(resumen));
    this.visualizacionesService
      .getComposicionEgresos(anio, mes)
      .subscribe((composicion) => this.composicionEgresosApi.set(composicion));
    this.visualizacionesService
      .getComposicionEgresosFijos(anio, mes)
      .subscribe((composicion) => this.composicionEgresosFijosApi.set(composicion));
    this.visualizacionesService
      .getComposicionEgresosVarios(anio, mes)
      .subscribe((composicion) => this.composicionEgresosVariosApi.set(composicion));
    this.visualizacionesService
      .getPesoClientes(anio, mes)
      .subscribe((peso) => this.pesoClientesApi.set(peso));
  }

  protected onAplicarFiltros(valores: Record<string, string>): void {
    const anioLabel = this.labelDe('anio', valores['anio']);
    const mesLabel = this.labelDe('mes', valores['mes']);
    if (mesLabel) {
      this.mesSeleccionado.set(mesLabel);
    }
    this.cargarResumenes(anioLabel, mesLabel);
  }

  protected onLimpiarFiltros(): void {
    this.mesSeleccionado.set('Agosto');
    this.resumenIngresos.set(null);
    this.resumenEgresos.set(null);
    this.registroIngresos.set(null);
    this.registroEgresos.set(null);
    this.registroIngresosAcumulado.set(null);
    this.registroEgresosAcumulado.set(null);
    this.registroIngresoFijo.set(null);
    this.registroIngresoVario.set(null);
    this.registroEgresoFijo.set(null);
    this.registroEgresoVario.set(null);
    this.composicionEgresosApi.set(null);
    this.composicionEgresosFijosApi.set(null);
    this.composicionEgresosVariosApi.set(null);
    this.pesoClientesApi.set(null);
    this.importanciaClientesAnualApi.set(null);
  }

  // el backend devuelve "Sin registro" (string) cuando no hay dato del año anterior
  private numOrZero(valor: number | string | undefined): number {
    return typeof valor === 'number' ? valor : 0;
  }

  protected readonly seccionIngresos = computed(() => {
    const r = this.resumenIngresos();
    return {
      title: 'Ingresos',
      full: { title: 'Ingresos del mes', value: r?.ingresos_mes ?? 0, currency: '$', suffix: '' },
      kpis: [
        {
          title: 'Incremento ingresos mes anterior',
          value: r?.incremento_ingresos_mes_anterior ?? 0,
          currency: '$',
          suffix: '',
        },
        {
          title: '% incremento ingresos mes anterior',
          value: r?.porcentaje_incremento_mes_anterior ?? 0,
          currency: '',
          suffix: '%',
        },
        {
          title: 'Incremento ingresos mes con respecto al año anterior',
          value: this.numOrZero(r?.incremento_ingresos_ano_anterior),
          currency: '$',
          suffix: '',
        },
        {
          title: '% incremento ingresos mes con respecto al año anterior',
          value: this.numOrZero(r?.porcentaje_incremento_ano_anterior),
          currency: '',
          suffix: '%',
        },
        {
          title: 'Ingreso mes acumulado',
          value: r?.ingreso_mes_acumulado ?? 0,
          currency: '$',
          suffix: '',
        },
        {
          title: 'Variación acumulada vs. año anterior',
          value: this.numOrZero(r?.porcentaje_incremento_acumulado_ano_anterior),
          currency: '',
          suffix: '%',
        },
      ],
    };
  });

  protected readonly secciones = computed(() => [this.seccionIngresos(), this.seccionEgresos()]);

  protected readonly seccionEgresos = computed(() => {
    const r = this.resumenEgresos();
    return {
      title: 'Egresos',
      full: { title: 'Egresos del mes', value: r?.egresos_mes ?? 0, currency: '$', suffix: '' },
      kpis: [
        {
          title: 'Incremento egresos mes anterior',
          value: r?.incremento_egresos_mes_anterior ?? 0,
          currency: '$',
          suffix: '',
        },
        {
          title: '% incremento egresos mes anterior',
          value: r?.porcentaje_incremento_mes_anterior ?? 0,
          currency: '',
          suffix: '%',
        },
        {
          title: 'Incremento egresos mes con respecto al año anterior',
          value: this.numOrZero(r?.incremento_egresos_ano_anterior),
          currency: '$',
          suffix: '',
        },
        {
          title: '% incremento egresos mes con respecto al año anterior',
          value: this.numOrZero(r?.porcentaje_incremento_ano_anterior),
          currency: '',
          suffix: '%',
        },
        {
          title: 'Egreso mes acumulado',
          value: r?.egreso_mes_acumulado ?? 0,
          currency: '$',
          suffix: '',
        },
        {
          title: 'Variación acumulada vs. año anterior',
          value: this.numOrZero(r?.porcentaje_incremento_acumulado_ano_anterior),
          currency: '',
          suffix: '%',
        },
      ],
    };
  });

  protected readonly meses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  protected readonly registroMensual = computed<TimeSeries[]>(() => {
    const ingresos = this.registroIngresos();
    const egresos = this.registroEgresos();
    return [
      { name: 'Ingresos', data: this.meses.map((mes) => ingresos?.[mes] ?? 0) },
      { name: 'Egresos', data: this.meses.map((mes) => egresos?.[mes] ?? 0) },
    ];
  });

  protected readonly acumuladoMensualReal = computed<TimeSeries[]>(() => {
    const ingresos = this.registroIngresosAcumulado();
    const egresos = this.registroEgresosAcumulado();
    return [
      { name: 'Ingresos acumulados', data: this.meses.map((mes) => ingresos?.[mes] ?? 0) },
      { name: 'Egresos acumulados', data: this.meses.map((mes) => egresos?.[mes] ?? 0) },
    ];
  });

  protected readonly ingresosFijosYVariables = computed<TimeSeries[]>(() => {
    const fijo = this.registroIngresoFijo();
    const vario = this.registroIngresoVario();
    return [
      { name: 'Ingreso fijo', data: this.meses.map((mes) => fijo?.[mes] ?? 0) },
      { name: 'Ingreso vario', data: this.meses.map((mes) => vario?.[mes] ?? 0) },
    ];
  });

  protected readonly egresosFijosYVariables = computed<TimeSeries[]>(() => {
    const fijo = this.registroEgresoFijo();
    const vario = this.registroEgresoVario();
    return [
      { name: 'Egreso fijo', data: this.meses.map((mes) => fijo?.[mes] ?? 0) },
      { name: 'Egreso variable', data: this.meses.map((mes) => vario?.[mes] ?? 0) },
    ];
  });
  

  protected readonly tablaComposicionActual = signal(0);
  protected anteriorTabla(): void {
  this.tablaComposicionActual.update((actual) =>
    actual === 0 ? 2 : actual - 1
  );
}

protected siguienteTabla(): void {
  this.tablaComposicionActual.update((actual) =>
    actual === 2 ? 0 : actual + 1
  );
}
  protected readonly composicionEgresosTabla = computed<TableRow[]>(() => {
  const composicion = this.composicionEgresosApi()?.composicion ?? [];

  return composicion.map((item) => ({
    nombre: item.tipo_egreso.toLowerCase(),
    peso: item.porcentaje,
    plata: item.monto
  }));
});

protected readonly composicionEgresosFijosTabla = computed<TableRow[]>(() => {
  const composicion = this.composicionEgresosFijosApi()?.composicion ?? [];

  return composicion
    .map((item) => ({
      nombre: item.nombre_cuenta.toLowerCase(),
      peso: item.porcentaje,
      plata: item.monto
    }))
    .sort((a, b) => b.plata - a.plata)
    //.slice(0, 7);
});

protected readonly composicionEgresosVariablesTabla = computed<TableRow[]>(() => {
  const composicion = this.composicionEgresosVariosApi()?.composicion ?? [];

  return composicion
    .map((item) => ({
      nombre: item.nombre_cuenta.toLowerCase(),
      peso: item.porcentaje,
      plata: item.monto
    }))
    .sort((a, b) => b.plata - a.plata)
    //.slice(0, 7);
});

  protected readonly composicionEgresosColumns: TableColumn[] = [
  { key: 'nombre', label: 'Tipo de egreso', type: 'text' },
  { key: 'peso', label: 'Peso', type: 'percentage', total: true },
  { key: 'plata', label: 'Plata', type: 'currency', total: true },
  ];

  protected readonly composicionEgresos = computed<PieDatum[]>(() => {
    const composicion = this.composicionEgresosApi()?.composicion ?? [];
    return composicion.map((item) => ({ name: item.tipo_egreso, value: item.monto }));
  });

  protected readonly composicionEgresosFijos = computed<PieDatum[]>(() => {
    const composicion = this.composicionEgresosFijosApi()?.composicion ?? [];

    return composicion
      .map((item) => ({
        name: item.nombre_cuenta.toLowerCase(),
        value: item.monto
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  });

  protected readonly composicionEgresosVariables = computed<PieDatum[]>(() => {
    const composicion = this.composicionEgresosVariosApi()?.composicion ?? [];

    return composicion
      .map((item) => ({
        name: item.nombre_cuenta.toLowerCase(),
        value: item.monto
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  });

  protected readonly topClientesColumns: TableColumn[] = [
    { key: 'nombre', label: 'Nombre', type: 'text' },
    { key: 'peso', label: 'Peso', type: 'percentage',total:true, },
    { key: 'plata', label: 'Plata', type: 'currency',total:true, },
  ];

  protected readonly topClientesMes = computed<TableRow[]>(() => {
    const clientes = this.pesoClientesApi()?.clientes ?? [];
    return clientes
      .map((c) => ({ nombre: c.cliente, peso: c.peso_porcentual, plata: c.total_cliente }))
      .sort((a, b) => b.plata - a.plata)
      .slice(0, 5);
  });

  protected readonly topClientesAnio = computed<TableRow[]>(() => {
    const clientes = this.importanciaClientesAnualApi()?.clientes ?? [];
    return clientes
      .map((c) => ({ nombre: c.cliente, peso: c.peso_porcentual, plata: c.total_cliente }))
      .sort((a, b) => b.plata - a.plata)
      .slice(0, 5);
  });
}
