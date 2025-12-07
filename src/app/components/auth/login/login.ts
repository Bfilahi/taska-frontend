import { Component, inject, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SignUp } from '../sign-up/sign-up';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth-service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';
import { User } from '../../../services/user';

@Component({
  selector: 'app-login',
  imports: [
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<this>);
  private readonly authService = inject(AuthService);
  private readonly userService = inject(User);
  private readonly router = inject(Router);
  private readonly toaster = inject(HotToastService);


  public loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
    ]),
    password: new FormControl('', [Validators.required]),
  });

  public isLoading = signal<boolean>(false);

  public onSubmit() {
    this.isLoading.set(true);

    const formData: FormData = new FormData();
    formData.append('email', this.loginForm.value.email);
    formData.append('password', this.loginForm.value.password);

    this.authService.login(formData).subscribe({
      next: () => {
        this.loginForm.reset();
        this.isLoading.set(false);
        this.dialogRef.close();
        this.router.navigate(['dashboard']);
        setTimeout(() => {
          this.toaster.success(`Welcome, ${this.userService.user()?.firstName}`);
        }, 1000);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        console.error(err);
        this.toaster.error(`Error: ${err.error.message}`);
      },
    });
  }

  public openSignUpDialog(): void {
    this.dialogRef.close();
    this.dialog.open(SignUp);
  }
}
