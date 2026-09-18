import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio.component';
import { CierreFinancieroComponent } from './pages/cierre-financiero/cierre-financiero.component';
import { PresupuestoComponent } from './pages/presupuesto/presupuesto.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { IngresaInformacionComponent } from './pages/ingresa-informacion/ingresa-informacion.component';
import {InformacionEgresosEIngresosComponent} from './pages/informacion-egresos-e-ingresos/informacion-egresos-e-ingresos';
import { AuthGuard } from './services/auth.guard';


export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: InicioComponent },
  { path: 'cierre-financiero', component: CierreFinancieroComponent, canActivate: [AuthGuard] },
  { path: 'presupuesto', component: PresupuestoComponent, canActivate: [AuthGuard] },
  { path: 'clientes', component: ClientesComponent, canActivate: [AuthGuard] },
  { path: 'informacion-egresos-e-ingresos',component:InformacionEgresosEIngresosComponent,canActivate:[AuthGuard]},
  { path: 'ingresar-informacion', component: IngresaInformacionComponent, canActivate: [AuthGuard] },
];
