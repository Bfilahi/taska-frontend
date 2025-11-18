import { Component, inject } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Login } from '../login/login';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth-service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-sign-up',
  imports: [
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss',
})
export class SignUp {
  readonly dialog = inject(MatDialog);
  readonly authService = inject(AuthService);

  public signupForm: FormGroup = new FormGroup({
    firstName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(20),
    ]),
    lastName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(20),
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
    ]),
  });



  public openLoginDialog(): void {
    this.dialog.closeAll();
    this.dialog.open(Login);
  }

  public onSubmit() {
    const request: SignupRequest = {
      firstName: this.signupForm.value?.['firstName'],
      lastName: this.signupForm.value?.['lastName'],
      email: this.signupForm.value?.['email'],
      password: this.signupForm.value?.['password']
    };

    this.authService.signup(request).subscribe({
      next: () => {
        this.signupForm.reset();
        console.log('signed up successfully');
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
      }
    });
    
  }
}
