import {
  Component,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';

export interface ArchivoCatalogo {
  nombreArchivo: string;
  anio: string;
  meses: string[];
}

export interface SeleccionArchivo {
  nombreArchivo: string;
  anio: string;
  mes: string;
}

@Component({
  selector: 'app-file-list',
  standalone: true,
  templateUrl: './file-list.component.html',
  styleUrl: './file-list.component.css',
})
export class FileListComponent {
  readonly title = input<string>('Lista Archivos');

  readonly archivos = input<ArchivoCatalogo[]>([]);

  readonly selectedFile = model<string | null>(null);

  // Mes puntual seleccionado, para distinguirlo
  // de otros meses del mismo archivo.
  protected readonly selectedMes = signal<string | null>(null);

  readonly fileSelected = output<SeleccionArchivo>();

  // Año expandido actualmente en el acordeón.
  // null = todos los años colapsados.
  protected readonly expandido = signal<string | null>(null);

  protected readonly archivosPorAnio = computed(() => {
    const grupos = new Map<string, ArchivoCatalogo[]>();

    for (const archivo of this.archivos()) {
      const existentes = grupos.get(archivo.anio) ?? [];

      existentes.push(archivo);

      grupos.set(archivo.anio, existentes);
    }

    return Array.from(grupos.entries()).map(([anio, archivos]) => ({
      anio,
      archivos,
    }));
  });

  /**
   * Expande o contrae un año.
   */
  protected toggle(anio: string): void {
    this.expandido.update((actual) =>
      actual === anio ? null : anio
    );
  }

  /**
   * Determina si un mes está actualmente seleccionado.
   */
  protected isActivo(
    archivo: ArchivoCatalogo,
    mes: string
  ): boolean {
    return (
      archivo.nombreArchivo === this.selectedFile() &&
      mes === this.selectedMes()
    );
  }

  /**
   * Selecciona un archivo/mes.
   */
  protected select(
    archivo: ArchivoCatalogo,
    mes: string
  ): void {
    this.selectedFile.set(archivo.nombreArchivo);

    this.selectedMes.set(mes);

    this.fileSelected.emit({
      nombreArchivo: archivo.nombreArchivo,
      anio: archivo.anio,
      mes,
    });
  }
}
