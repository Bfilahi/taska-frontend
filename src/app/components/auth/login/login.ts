import { Component, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SignUp } from '../sign-up/sign-up';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth-service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [MatFormFieldModule, MatIconModule, MatInputModule, MatDialogModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  readonly dialog = inject(MatDialog);
  readonly authService = inject(AuthService);
  readonly router = inject(Router);


  public loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });



  public onSubmit(){
    const formData: FormData = new FormData();
    formData.append('email', this.loginForm.value.email);
    formData.append('password', this.loginForm.value.password);

    this.authService.login(formData).subscribe({
      next: () => {
        this.loginForm.reset();
        this.dialog.closeAll();
        this.router.navigate(['dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      }
    });
  }

  public openSignUpDialog(): void {
    this.dialog.closeAll();
    this.dialog.open(SignUp);
  }
}
