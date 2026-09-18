import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  protected readonly links = [
    { label: 'Cierre Financiero', path: '/cierre-financiero' },
    { label: 'Presupuesto', path: '/presupuesto' },
    { label: 'Clientes', path: '/clientes' },
    {label: 'Informacion Ingresos e Egresos', path:'/informacion-egresos-e-ingresos'},
    { label: 'Ingresar Información', path: '/ingresar-informacion' },
  ];

  usuario: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.usuario = this.authService.getUsuario();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/inicio']);
  }
}
