import { Component, input, output } from '@angular/core';

export type TableColumnType =
  | 'text'
  | 'number'
  | 'currency'
  | 'percentage'
  | 'date';

export interface TableColumn {
  key: string;
  label: string;
  type?: TableColumnType;
  total?: boolean;
}

export type TableRow = Record<string, unknown>;

@Component({
  selector: 'app-table',
  standalone: true,
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent {
  readonly title = input<string>('');
  readonly columns = input<TableColumn[]>([]);
  readonly data = input<TableRow[]>([]);

  // Selección de filas: desactivada por defecto
  readonly selectable = input<boolean>(false);

  readonly rowSelected = output<TableRow>();

  protected isNumeric(type?: TableColumnType): boolean {
    return type === 'number' || type === 'currency' || type === 'percentage';
  }

  protected getTotal(column: TableColumn): number {
    if (!column.total) return 0;

    return this.data().reduce((total, row) => {
      const value = Number(row[column.key]);

      if (Number.isNaN(value)) {
        return total;
      }

      return total + value;
    }, 0);
  }

  protected formatTotal(column: TableColumn): string {
    return this.format(this.getTotal(column), column.type);
  }

  protected format(value: unknown, type?: TableColumnType): string {
    if (value === null || value === undefined || value === '') {
      return '—';
    }

    switch (type) {
      case 'currency':
        return `$${this.formatNumber(Number(value))}`;

      case 'percentage':
        return `${this.formatPercentage(Number(value))}%`;

      case 'number':
        return this.formatNumber(Number(value));

      case 'date':
        return this.formatDate(value);

      default:
        return String(value);
    }
  }

  private formatNumber(amount: number): string {
    if (Number.isNaN(amount)) {
      return '—';
    }

    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  private formatPercentage(amount: number): string {
    if (Number.isNaN(amount)) {
      return '—';
    }

    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(amount);
  }

  private formatDate(value: unknown): string {
    const date = value instanceof Date
      ? value
      : new Date(String(value));

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }
}