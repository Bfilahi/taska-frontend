import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Login } from '../login/login';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth-service';
import { HttpErrorResponse } from '@angular/common/http';
import { SignupRequest } from '../../../dto/signupRequest';
import { HotToastService } from '@ngxpert/hot-toast';

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
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<this>);
  private readonly authService = inject(AuthService);
  private readonly toaster = inject(HotToastService);

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

  public isLoading = signal<boolean>(false);

  public onSubmit() {
    this.isLoading.set(true);

    const request: SignupRequest = {
      firstName: this.signupForm.value?.['firstName'],
      lastName: this.signupForm.value?.['lastName'],
      email: this.signupForm.value?.['email'],
      password: this.signupForm.value?.['password'],
    };

    this.authService.signup(request).subscribe({
      next: () => {
        this.signupForm.reset();
        this.isLoading.set(false);
        this.toaster.success('Profile was created successfully');
        this.dialogRef.close();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        console.error(err);
        this.toaster.error(`Error: ${err.error.message}`);
      },
    });
  }

  public openLoginDialog(): void {
    this.dialogRef.close();
    this.dialog.open(Login);
  }
}
