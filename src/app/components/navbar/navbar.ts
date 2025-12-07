import { Component, effect, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIcon } from "@angular/material/icon";
import { Utility } from '../../services/utility';
import { MatDialog } from '@angular/material/dialog';
import { Login } from '../auth/login/login';
import { SignUp } from '../auth/sign-up/sign-up';
import { AuthService } from '../../services/auth-service';


@Component({
  selector: 'app-navbar',
  imports: [MatToolbarModule, MatButtonModule, MatIcon, MatSlideToggleModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private readonly dialog = inject(MatDialog);
  public readonly utilityService = inject(Utility);
  public readonly authService = inject(AuthService);

  public setDarkMode = effect(() => {
    document.documentElement.classList.toggle('dark', this.utilityService.isDarkMode());
  });

  public openLoginDialog(): void {
    this.dialog.open(Login);
  }

  public openSignUpDialog(): void {
    this.dialog.open(SignUp);
  }

  public logout() {
    this.authService.logout();
  }
}
