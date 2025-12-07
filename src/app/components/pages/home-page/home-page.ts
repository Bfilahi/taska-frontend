import { Component, inject } from '@angular/core';
import { MatAnchor } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { SignUp } from '../../auth/sign-up/sign-up';
import { Login } from '../../auth/login/login';


@Component({
  selector: 'app-home-page',
  imports: [MatAnchor],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  readonly dialog = inject(MatDialog);

  public openSignUpDialog(): void {
    this.dialog.open(SignUp);
  }

  public openLoginDialog(): void {
    this.dialog.open(Login);
  }
}
