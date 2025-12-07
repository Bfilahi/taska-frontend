import { Component, inject } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TitleCasePipe } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { Utility } from '../../../services/utility';
import { AuthService } from '../../../services/auth-service';


@Component({
  selector: 'app-sidenav',
  imports: [
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    TitleCasePipe,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.scss',
})
export class Sidenav {
  public readonly authService = inject(AuthService);

  public sidenavBtns = [
    { name: 'dashboard', icon: 'dashboard' },
    { name: 'projects', icon: 'assignment' },
    { name: 'settings', icon: 'settings' },
  ];

  constructor(public utility: Utility) {}
}
